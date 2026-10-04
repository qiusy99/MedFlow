from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.models.hospital import Hospital
from app.schemas.hospital import HospitalRead, HospitalUpdate, HospitalCreate
from app.models.user import User, UserRole

router = APIRouter(prefix="/hospitals", tags=["Hospitals"])

@router.get("", response_model=list[HospitalRead])
async def get_hospital(
    db: AsyncSession = Depends(get_db),
    _:User = Depends(get_current_user)
) -> list[Hospital]:
    result = await db.execute(select(Hospital))
    hospitals = result.scalars().all()
    return hospitals

@router.patch("/{hospital_id}", response_model=HospitalRead)
async def update_hospital(
    hospital_id: int,
    payload: HospitalUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
) -> Hospital:
    hospital = await db.get(Hospital, hospital_id)
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_id} not found"
        )
    hospital.capacity = payload.capacity
    await db.commit()
    await db.refresh(hospital)
    return hospital

@router.post("", response_model=HospitalRead, status_code=status.HTTP_201_CREATED)
async def create_hospital(
    payload: HospitalCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
) -> Hospital:
    hospital = Hospital(**payload.model_dump())
    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return hospital

@router.delete("/{hospital_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hospital(
    hospital_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
):
    hospital = await db.get(Hospital, hospital_id)
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hospital {hospital_id} not found"
        )
    await db.delete(hospital)
    await db.commit()
