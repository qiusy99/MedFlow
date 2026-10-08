
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from app.config import settings
import hashlib
import secrets

ALGORITHM = "HS256"

def hash_password(plain_password: str) -> str:
    hashed = bcrypt.hashpw(
        plain_password.encode("utf-8"),
        bcrypt.gensalt()
    )
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])

# stretch goal: Refresh Tokens

#真正的random token
def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)
#存database
def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()