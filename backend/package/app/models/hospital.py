from __future__ import annotations
from typing import TYPE_CHECKING
from .base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String


if TYPE_CHECKING:
    from .equipment import Equipment
    from .technician import Technician 

class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    location_region: Mapped[str] = mapped_column(String(50))
    capacity: Mapped[int] = mapped_column(Integer)
    supervisor_id: Mapped[int] = mapped_column(Integer)

    equipments: Mapped[list["Equipment"]] = relationship(back_populates="hospital")
    technicians: Mapped[list["Technician"]] = relationship(back_populates="hospital")

    def __repr__(self) -> str:
        return (f"Hospital(id={self.id}), name={self.name!r} "
                f"lacation_region={self.location_region!r} "
                f"capacity={self.capacity}, supervisor_id={self.supervisor_id}")