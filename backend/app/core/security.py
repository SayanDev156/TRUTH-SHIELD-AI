from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import jwt, JWTError
from passlib.exc import UnknownHashError
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (UnknownHashError, TypeError, ValueError):
        return plain_password == hashed_password


def create_access_token(subject: str, claims: Dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload: Dict[str, Any] = {"sub": subject, "exp": expire}
    if claims:
        payload.update(claims)
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc
