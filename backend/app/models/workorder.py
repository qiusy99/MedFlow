from __future__ import annotations
from typing import TYPE_CHECKING
from .base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy import Enum as SqlEnum
from .enums import WorkOrderPriority, WorkOrderStatus

if TYPE_CHECKING:
    from .technician import Technician
    from .equipment import Equipment
    from .servicereport import ServiceReport

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    priority: Mapped[WorkOrderPriority] = mapped_column(
        SqlEnum(
            WorkOrderPriority,
            name = "work_order_priority",
            values_callable = lambda enum_cls: [member.value for member in enum_cls],
        )
    )
    status: Mapped[WorkOrderStatus] = mapped_column(
        SqlEnum(
            WorkOrderStatus,
            name = "work_order_status",
            values_callable = lambda enum_cls: [member.value for member in enum_cls],
        ),
        default = WorkOrderStatus.PENDING
    )
    equipment_id: Mapped[int] = mapped_column(Integer, ForeignKey("equipments.id"))
    technician_id: Mapped[int] = mapped_column(Integer, ForeignKey("technicians.id"))

    technician: Mapped[list["Technician"]] = relationship(back_populates="workorders")
    equipment: Mapped[list["Equipment"]] = relationship(back_populates="workorders")
    service_reports: Mapped[list["ServiceReport"]] = relationship(back_populates="workorder")

    def is_completed(self) -> bool:
        if self.status == WorkOrderStatus.COMPLETED:
            return True
        else:
            return False

    def is_failed(self) -> bool:
        if self.status == WorkOrderStatus.FAILED:
            return True
        else:
            return False

    def is_active(self) -> bool:
        if self.status == WorkOrderStatus.PENDING or self.status == WorkOrderStatus.IN_PROGRESS:
            return True
        else:
            return False

    def __repr__(self):
        return (f"Work Orders(id={self.id}), title={self.title!r} "
                f"equipment_id={self.equipment_id}, technician_id={self.technician_id} "
                f"priority={self.priority}, status={self.status}")