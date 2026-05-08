from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException, status

from app.core.security import decode_token
from app.services.store import TruthShieldStore, get_truthshield_store


def get_store() -> TruthShieldStore:
    return get_truthshield_store()


def _extract_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    if authorization.lower().startswith("bearer "):
        return authorization.split(" ", 1)[1].strip()
    return authorization.strip() or None


def get_current_user(
    authorization: str | None = Header(default=None),
    repository: TruthShieldStore = Depends(get_store),
) -> dict:
    token = _extract_token(authorization)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        payload = decode_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = repository.get_user_by_email(subject)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists")
    return user


def optional_current_user(
    authorization: str | None = Header(default=None),
    repository: TruthShieldStore = Depends(get_store),
) -> Optional[dict]:
    token = _extract_token(authorization)
    if not token:
        return None
    try:
        payload = decode_token(token)
    except ValueError:
        return None
    subject = payload.get("sub")
    if not subject:
        return None
    return repository.get_user_by_email(subject)


def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
