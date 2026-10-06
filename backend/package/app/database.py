import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.config import settings
DATABASE_URL = settings.database_url
os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:0622@localhost:5432/medflow_dev_02"
)
engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)