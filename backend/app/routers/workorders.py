from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import WorkOrder, Technician, Equipment
from app.models.enums import WorkOrderStatus, WorkOrderPriority
from app.dependencies import get_db, require_role
from app.schemas.workorder import DiscrepancyRead, WorkOrderRead, WorkOrderStatusUpdate, ReliabilityMetricsRead
from app.models.user import User, UserRole

router = APIRouter(prefix="/workorders", tags=["Work Orders"])

@router.get("", response_model=list[WorkOrderRead])
async def get_workorders(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(
        UserRole.CLINICAL_ADMIN,
        UserRole.FIELD_TECHNICIAN,
        UserRole.AUDITOR
    )),
) -> list[WorkOrder]:
    statement = select(WorkOrder).order_by(WorkOrder.id)
    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/discrepancies", response_model=list[DiscrepancyRead])
async def get_discrepancies(
    priority: WorkOrderPriority | None = Query(
        default = None,
        description = "Only return discrepancies for work order of this priority"
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(
        UserRole.CLINICAL_ADMIN,
        UserRole.FIELD_TECHNICIAN,
        UserRole.AUDITOR
    ))
):
    statement = (
        select(
            WorkOrder.id.label("work_order_id"),
            WorkOrder.title,
            Technician.facility_id.label("technician_hospital_id"),
            Equipment.facility_id.label("equipment_hospital_id"),
        )
        .join(Technician, Technician.id == WorkOrder.technician_id)
        .join(Equipment, Equipment.id == WorkOrder.equipment_id)
        .where(Equipment.facility_id != Technician.facility_id)
        .order_by(WorkOrder.id)
    )
    if priority is not None:
        statement = statement.where(WorkOrder.priority == priority)
    statement = statement.order_by(WorkOrder.id)
    result = await db.execute(statement)
    return [dict(row) for row in result.mappings().all()]

@router.patch("/{work_order_id}/status", response_model=WorkOrderRead)
async def workorder_status_update(
    work_order_id: int,
    payload: WorkOrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(
        UserRole.CLINICAL_ADMIN,
        UserRole.FIELD_TECHNICIAN
    )),
) -> WorkOrder:
    workorder = await db.get(WorkOrder, work_order_id)
    if work_order_id is None:
        raise HTTPException(
            status_code=404,
            detail=(f"WorkOrder {work_order_id} not found")
        )
    workorder.status = payload.status
    await db.commit()
    await db.refresh(workorder)
    return workorder

@router.get("/reliabilitymetrics", response_model=list[ReliabilityMetricsRead])
async def get_workorder_completion_failure_ratio(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(
        UserRole.CLINICAL_ADMIN,
        UserRole.FIELD_TECHNICIAN,
        UserRole.AUDITOR
    )),
):
    completion_count = func.sum(case(
        (WorkOrder.status == WorkOrderStatus.COMPLETED, 1),
        else_=0
    ))
    failure_count = func.sum(case(
        (WorkOrder.status == WorkOrderStatus.FAILED, 1),
        else_=0
    ))
    ratio = completion_count / func.nullif(failure_count, 0)
    result = await db.execute(
        select(
            Equipment.model.label("device_model"),
            completion_count.label("completion"),
            failure_count.label("failure"),
            ratio.label("completion_failure_ratio"),
        )
        .join(Equipment, Equipment.id == WorkOrder.equipment_id)
        .group_by(Equipment.model)
    )
    reliability_metrics = result.mappings().all()
    return reliability_metrics

