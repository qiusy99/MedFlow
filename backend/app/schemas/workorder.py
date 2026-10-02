from app.models.enums import WorkOrderPriority, WorkOrderStatus
from pydantic import ConfigDict, BaseModel

class DiscrepancyRead(BaseModel):
    work_order_id: int
    title: str
    technician_hospital_id: int
    equipment_hospital_id: int

    model_config = ConfigDict(from_attributes=True)

class WorkOrderRead(BaseModel):
    id: int
    title: str
    priority: WorkOrderPriority
    status: WorkOrderStatus = WorkOrderStatus.PENDING
    equipment_id: int
    technician_id: int

    model_config = ConfigDict(from_attributes=True)

class WorkOrderStatusUpdate(BaseModel):
    status: WorkOrderStatus

class ReliabilityMetricsRead(BaseModel):
    device_model: str
    completion: int
    failure: int
    completion_failure_ratio: float | None

    model_config = ConfigDict(from_attributes=True)
