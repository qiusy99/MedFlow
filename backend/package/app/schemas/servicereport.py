from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ServiceReportBase(BaseModel):
    work_order_id: int
    file_url: str
    notes: str | None = None

class ServiceReportCreate(ServiceReportBase):
    pass

class ServiceReportRead(ServiceReportBase):
    id: int
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class ServiceReportUpdate(BaseModel):
    notes: str