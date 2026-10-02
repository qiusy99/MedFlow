from __future__ import annotations
from .base import Base
from sqlalchemy.orm import Mapped, mapped_column
from .enums import UserRole
from sqlalchemy import String, Boolean
from sqlalchemy import Enum as SqlEnum


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(
        SqlEnum(
            UserRole,
            name = "user_role",
            values_callable = lambda enum_cls:[member.value for member in enum_cls],
        )
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self):
        return (f"User Role(id={self.id}), username={self.username!r} "
                f"role={self.role.value}")