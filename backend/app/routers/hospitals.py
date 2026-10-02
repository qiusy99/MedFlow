from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalRead
from app.models.user import User

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=list[HospitalRead])
async def get_hospital(
    db: AsyncSession = Depends(get_db),
    _:User = Depends(get_current_user)
) -> list[Hospital]:
    result = await db.execute(select(Hospital))
    hospitals = result.scalars().all()
    return hospitals
