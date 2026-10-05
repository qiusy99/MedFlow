from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.servicereport import ServiceReportRead, ServiceReportUpdate, ServiceReportCreate
from app.models.servicereport import ServiceReport
from app.dependencies import get_db, get_current_user, require_role
from app.models.user import UserRole, User

router = APIRouter(prefix="/servicereports", tags=["ServiceReport"])

@router.post("", response_model=ServiceReportRead, status_code=status.HTTP_201_CREATED)
async def create_servicereport(
    payload: ServiceReportCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.FIELD_TECHNICIAN))
) -> ServiceReport:
    servicereport = ServiceReport(**payload.model_dump())
    db.add(servicereport)
    await db.commit()
    await db.refresh(servicereport)
    return servicereport


@router.get("", response_model=list[ServiceReportRead])
async def get_servicereport(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
) -> list[ServiceReport]:
    result = await db.execute(select(ServiceReport))
    servicereports = result.scalars().all()
    return servicereports


@router.patch("/{service_report_id}", response_model=ServiceReportRead)
async def update_servicereport(
    service_report_id: int,
    payload: ServiceReportUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
) -> ServiceReport:
    servicereport = await db.get(ServiceReport, service_report_id)
    if servicereport is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service Report {service_report_id} not found."
        )
    servicereport.notes = payload.notes
    await db.commit()
    await db.refresh(servicereport)
    return servicereport


@router.delete("/{service_report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_servicereport(
    service_report_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN))
):
    servicereport = await db.get(ServiceReport, service_report_id)
    if servicereport is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service Report {service_report_id} not found."
        )
    await db.delete(servicereport)
    await db.commit()
