from decimal import Decimal
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.equipment import EquipmentRead, EquipmentCreate, EquipmentUpdate
from app.models.equipment import Equipment
from app.dependencies import get_current_user, get_db, require_role
from app.models.enums import EquipmentStatus, UserRole
from app.models.user import User

router = APIRouter(prefix="/equipments", tags=["Equipment"])

# 查看所有active equipment + 查看charge level < 20 的active equipment
@router.get("", response_model=list[EquipmentRead])
async def get_equipment(
    max_charge_level: Decimal | None = Query(
        default=None,
        ge=0,
        le=100,
        description="Only return equipments strictly below charge level percentage"
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Equipment]:
    statement = select(Equipment).where(Equipment.status != EquipmentStatus.OFFLINE)
    if max_charge_level is not None:
        statement = statement.where(Equipment.charge_level < max_charge_level)
    statement = statement.order_by(Equipment.id)
    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{equipment_id}", response_model=EquipmentRead)
async def get_equipment_id(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
) -> Equipment:
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment {equipment_id} not found"
        )
    return equipment

@router.post("", response_model=EquipmentRead, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    payload: EquipmentCreate, 
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
) -> Equipment:
    equipment = Equipment(**payload.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
):
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment {equipment_id} not found"
        )
    await db.delete(equipment)
    await db.commit()

@router.patch("/{equipment_id}", response_model=EquipmentRead)
async def equipment_update(
    equipment_id: int,
    payload: EquipmentUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.FIELD_TECHNICIAN)) 
) -> Equipment:
    equipment = await db.get(Equipment, equipment_id)
    if equipment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Equipment {equipment_id} not found"
        )
    if payload.status is not None:
        equipment.status = payload.status
    if payload.charge_level is not None:
        equipment.charge_level = payload.charge_level
    await db.commit()
    await db.refresh(equipment)
    return equipment    