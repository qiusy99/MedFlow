from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, CheckConstraint, DECIMAL, NUMERIC, ForeignKey
from sqlalchemy import Enum as SqlEnum
from .enums import EquipmentStatus
from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .workorder import WorkOrder

class Equipment(Base):
    __tablename__ = "equipments"
    __table_args__ = (
        CheckConstraint("charge_level BETWEEN 0 and 100",
                        name = "charge_level_range"),
        )

    id: Mapped[int] = mapped_column(primary_key=True)
    serial_number: Mapped[str] = mapped_column(String(50), unique=True)
    model: Mapped[str] = mapped_column(String(50))
    status: Mapped[EquipmentStatus] = mapped_column(
        SqlEnum(
            EquipmentStatus,
            name='equipment_status',
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        default=EquipmentStatus.AVAILABLE
    )
    charge_level: Mapped[DECIMAL] = mapped_column(NUMERIC(5, 2))
    facility_id: Mapped[int] = mapped_column(Integer, ForeignKey("hospitals.id"))

    hospital: Mapped[list['Hospital']] = relationship(back_populates="equipments")
    workorders: Mapped[list['WorkOrder']] = relationship(back_populates="equipment")

    LOW_CHARGE_LEVEL_THRESHOLD: int = 20
    def is_low_charge(self, threshold: int | None = None) -> bool:
        if threshold is not None:
            limit = threshold
        else:
            limit = Equipment.LOW_CHARGE_LEVEL_THRESHOLD

        return self.charge_level < limit

    def __repr__(self):
        return (f"Equipment(id={self.id}), serial_number={self.serial_number!r} "
                f"model={self.model!r} "
                f"charge_level={self.charge_level}%, facility_id={self.facility_id} "
                f"status={self.status}")
