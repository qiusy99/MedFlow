from pydantic import BaseModel, ConfigDict, Field
from app.models.enums import UserRole

class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    role: UserRole

class UserRead(UserBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class UserCreate(UserBase):
    password: str
    # hashed_password: str = Field(min_length=5, max_length=50)

class UserUpdate(BaseModel):
    role: UserRole | None = None
    is_active: bool | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"