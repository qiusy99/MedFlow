import os
from datetime import datetime, timedelta, timezone
import bcrypt
import jwt

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "6466a3a0ccc74caabe06bfcdbf4f7c70aeca7842122f04ac4e9acba0701234d0"
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_TIMES = 30

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
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(ACCESS_TOKEN_EXPIRE_TIMES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
