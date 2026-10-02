from __future__ import annotations
from typing import TYPE_CHECKING
from .base import Base
from sqlalchemy import Integer, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .workorder import WorkOrder

class ServiceReport(Base):
    __tablename__ = "service_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    work_order_id: Mapped[int] = mapped_column(Integer, ForeignKey("work_orders.id"))
    file_url: Mapped[Text] = mapped_column(Text)
    notes: Mapped[Text] = mapped_column(Text, nullable=True)
    timestamp: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())

    workorder: Mapped[list["WorkOrder"]] = relationship(back_populates="service_reports")

    def __repr__(self):
        return (f"Service Report(id={self.id}), work_order_id={self.work_order_id} "
                f"file_url={self.file_url!r} "
                f"notes={self.notes!r} "
                f"timestamp={self.timestamp}")