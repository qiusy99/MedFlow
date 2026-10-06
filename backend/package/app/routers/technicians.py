from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.technician import TechnicianRead
from app.models.technician import Technician
from app.models.user import User

router = APIRouter(prefix="/technicians", tags=["Technicians"])

@router.get("", response_model=list[TechnicianRead])
async def get_technician(
    db: AsyncSession = Depends(get_db),
    _:User = Depends(get_current_user)
) -> list[Technician]:
    result = await db.execute(select(Technician))
    technicians = result.scalars().all()
    return technicians

