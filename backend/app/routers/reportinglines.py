from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.schemas.technician import ReportingLinesRead
from app.models.technician import Technician
from app.models.workorder import WorkOrder
from app.models.enums import WorkOrderStatus
from app.models.user import User

router = APIRouter(prefix="/reportinglines", tags=["ReportingLines"])

@router.get("/{supervisor_id}", response_model=ReportingLinesRead)
async def get_reportinglines(
    supervisor_id: int, 
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
):
    result = await db.execute(
        select(
            Technician.supervisor_id.label("supervisor_id"),
            func.count(func.distinct(Technician.id)).label("total_technician"),
        )
        .join(WorkOrder, Technician.id == WorkOrder.technician_id)
        .where(Technician.supervisor_id == supervisor_id,
            WorkOrder.status.in_([
                WorkOrderStatus.PENDING,
                WorkOrderStatus.IN_PROGRESS
        ]))
        .group_by(Technician.supervisor_id)
    )
    reportinglines = result.mappings().one()
    return reportinglines
