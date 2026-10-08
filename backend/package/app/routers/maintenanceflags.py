from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.equipment import Equipment
from app.models.enums import EquipmentStatus
from app.models.hospital import Hospital
from app.schemas.hospital import MaintenanceFlagsRead

router = APIRouter(prefix="/maintenanceflag", tags=["MaintenanceFlag"])

@router.get("", response_model=list[MaintenanceFlagsRead])
async def get_maintenance_flag(db: AsyncSession = Depends(get_db)):
    total_equipments = func.count(Equipment.id)
    maintenance_equipments = func.sum(case(
        (Equipment.status == EquipmentStatus.MAINTENANCE, 1),
        else_=0
    ))
    maintenance_perc = (maintenance_equipments/total_equipments)*100
    result = await db.execute(
        select(
            Equipment.facility_id.label("hospital_id"),
            Hospital.name.label("hospital_name"),
            total_equipments.label("total_equipment"),
            maintenance_equipments.label("maintenance_equipment"),
            maintenance_perc.label("maintenance_percentage"),
        )
        .join(Hospital, Hospital.id == Equipment.facility_id)
        .group_by(Equipment.facility_id, Hospital.name)
        .having(maintenance_perc > 30)
    )
    maintenanceflags = result.mappings().all()
    return maintenanceflags