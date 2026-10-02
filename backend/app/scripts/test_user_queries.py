import asyncio
from app.database import AsyncSessionLocal
from app.models.user import UserRole, User
from app.security import hash_password

async def seed_users() -> None:
    async with AsyncSessionLocal() as session:
        session.add_all([
            User(username="admin", hashed_password=hash_password("Admin000"), role=UserRole.CLINICAL_ADMIN),
            User(username="technician", hashed_password=hash_password("Technician000"), role=UserRole.FIELD_TECHNICIAN),
            User(username="auditor", hashed_password=hash_password("Auditor000"), role=UserRole.AUDITOR)
        ])

        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_users())