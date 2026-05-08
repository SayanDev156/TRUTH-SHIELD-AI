import base64
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from app import schemas
from app.core.config import get_settings
from app.core.dependencies import get_current_user, get_store
from app.core.security import create_access_token, decode_token
from app.services.store import TruthShieldStore

router = APIRouter(prefix="/auth", tags=["auth"])

ADMIN_REGISTRATION_SECRET = "TruthShield@Admin2024"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


@router.post("/register", response_model=schemas.AuthResponse)
def register(payload: schemas.UserCreate, repository: TruthShieldStore = Depends(get_store)):
    if payload.is_admin:
        if payload.admin_secret != ADMIN_REGISTRATION_SECRET:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin secret key")
    try:
        user = repository.register_user(
            payload.full_name, payload.email, payload.password, payload.locale,
            is_admin=payload.is_admin
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    token = create_access_token(subject=user["email"], claims={"full_name": user["full_name"], "is_admin": user["is_admin"]})
    return schemas.AuthResponse(access_token=token, user=schemas.UserPublic(**user))


@router.post("/login", response_model=schemas.AuthResponse)
def login(payload: schemas.UserLogin, repository: TruthShieldStore = Depends(get_store)):
    user = repository.verify_login(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=user["email"], claims={"full_name": user["full_name"], "is_admin": user["is_admin"]})
    return schemas.AuthResponse(access_token=token, user=schemas.UserPublic(**user))


@router.get("/google/login")
def google_login():
    settings = get_settings()
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google login is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
        )

    state = create_access_token(subject="google_oauth_state")
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": state,
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/google/callback")
def google_callback(
    code: str | None = Query(default=None),
    state: str | None = Query(default=None),
    error: str | None = Query(default=None),
    repository: TruthShieldStore = Depends(get_store),
):
    settings = get_settings()
    frontend_callback = f"{settings.frontend_url.rstrip('/')}/login/google/callback"
    if error:
        return RedirectResponse(f"{frontend_callback}?error={quote(error)}")
    if not code or not state:
        return RedirectResponse(f"{frontend_callback}?error=Missing%20Google%20authorization%20code")

    try:
        state_payload = decode_token(state)
        if state_payload.get("sub") != "google_oauth_state":
            raise ValueError("Invalid Google OAuth state")
    except ValueError:
        return RedirectResponse(f"{frontend_callback}?error=Invalid%20Google%20OAuth%20state")

    try:
        token_payload = _post_form(
            GOOGLE_TOKEN_URL,
            {
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        google_access_token = token_payload.get("access_token")
        if not google_access_token:
            raise ValueError("Google did not return an access token")

        profile = _get_json(GOOGLE_USERINFO_URL, bearer_token=google_access_token)
        if not profile.get("email") or not profile.get("email_verified"):
            raise ValueError("Google account email is missing or unverified")

        user = repository.get_or_create_oauth_user(
            email=profile["email"],
            full_name=profile.get("name") or profile["email"].split("@")[0],
            provider="google",
            provider_id=profile.get("sub", ""),
        )
        token = create_access_token(subject=user["email"], claims={"full_name": user["full_name"], "is_admin": user["is_admin"]})
        session = schemas.AuthResponse(access_token=token, user=schemas.UserPublic(**user))
        encoded_session = _base64url_json(session.model_dump(mode="json"))
        return RedirectResponse(f"{frontend_callback}?session={encoded_session}")
    except (HTTPError, URLError, ValueError) as exc:
        message = urlencode({"error": str(exc)})
        return RedirectResponse(f"{frontend_callback}?{message}")


def _post_form(url: str, payload: dict) -> dict:
    data = urlencode(payload).encode("utf-8")
    request = Request(url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def _get_json(url: str, *, bearer_token: str) -> dict:
    request = Request(url, headers={"Authorization": f"Bearer {bearer_token}"})
    with urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def _base64url_json(payload: dict) -> str:
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


@router.get("/me", response_model=schemas.UserPublic)
def me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=schemas.UserPublic)
def update_profile(
    payload: schemas.ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    repository: TruthShieldStore = Depends(get_store),
):
    try:
        updated = repository.update_profile(current_user["email"], payload.full_name, payload.locale)
        return schemas.UserPublic(**updated)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/password")
def change_password(
    payload: schemas.PasswordChange,
    current_user: dict = Depends(get_current_user),
    repository: TruthShieldStore = Depends(get_store),
):
    try:
        repository.change_password(current_user["email"], payload.current_password, payload.new_password)
        return {"message": "Password updated successfully"}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
