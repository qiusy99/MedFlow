from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy import Integer, String, ForeignKey
from .base import Base

if TYPE_CHECKING:
    from .workorder import WorkOrder
    from .hospital import Hospital

class Technician(Base):
    __tablename__ = "technicians"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    facility_id: Mapped[int] = mapped_column(Integer, ForeignKey("hospitals.id"))
    supervisor_id: Mapped[int] = mapped_column(Integer)

    workorders: Mapped[list["WorkOrder"]] = relationship(back_populates="technician")
    hospital: Mapped[list["Hospital"]] = relationship(back_populates="technicians")

    def __repr__(self):
        return (f"Technician(id={self.id}), name={self.name!r} "
                f"facility_id={self.facility_id}, supervisor_id={self.supervisor_id}")