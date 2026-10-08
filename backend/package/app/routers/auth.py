from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.user import Token, UserCreate, UserRead, RefreshTokenRequest, LogoutRequest
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.enums import UserRole
from app.dependencies import get_db, require_role
from app.security import create_access_token, hash_password, verify_password, create_refresh_token, hash_refresh_token

from datetime import datetime, timedelta, timezone
from uuid import uuid4
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
) -> Token:
    result = await db.execute(
        select(User).where(User.username == form_data.username)
    )
    user = result.scalar_one_or_none()

    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value})
    refresh_token = create_refresh_token()
    now = datetime.now(timezone.utc)
    refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        issued_at=now,
        expires_at=now + timedelta(
            days=settings.refresh_token_expire_days
        ),
        revoked=False,
        chain_id=str(uuid4()),
    )
    db.add(refresh_record)
    await db.commit()
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/refresh", response_model=Token)
async def refresh_access_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> Token:
    token_hash = hash_refresh_token(payload.refresh_token)

    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    stored_token = result.scalar_one_or_none()

    if stored_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # The token was already used/revoked.
    # Revoke the entire chain because this may indicate token theft.
    if stored_token.revoked:
        await db.execute(
            update(RefreshToken)
            .where(RefreshToken.chain_id == stored_token.chain_id)
            .values(revoked=True)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token reuse detected",
        )

    now = datetime.now(timezone.utc)

    if stored_token.expires_at <= now:
        stored_token.revoked = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    user_result = await db.execute(
        select(User).where(User.id == stored_token.user_id))
    user = user_result.scalar_one_or_none()

    if user is None or not user.is_active:
        stored_token.revoked = True
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user",
        )
    # Rotate the refresh token.
    stored_token.revoked = True
    new_refresh_token = create_refresh_token()
    new_refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(new_refresh_token),
        issued_at=now,
        expires_at=now + timedelta(days=settings.refresh_token_expire_days),
        revoked=False,
        chain_id=stored_token.chain_id,
    )
    db.add(new_refresh_record)
    new_access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value})
    await db.commit()
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
    )

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    payload: LogoutRequest,
    db: AsyncSession = Depends(get_db)
) -> None:
    token_hash = hash_refresh_token(payload.refresh_token)
    result = await db.execute(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    stored_token = result.scalar_one_or_none()

    if stored_token is not None and not stored_token.revoked:
        stored_token.revoked = True
        await db.commit()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
) -> User:
    existing = await db.execute(select(User).where(User.username == payload.username))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username '{payload.username}' is already taken",
        )
# day 11 addition 忽略大小写
    existing = await db.execute(select(User).where(func.lower(User.username) == payload.username.lower()))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username '{payload.username}' is already taken",
        )	
## day 11 addition end
    user = User(
        username = payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

