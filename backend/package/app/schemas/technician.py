from pydantic import BaseModel

class ReportingLinesRead(BaseModel):
    supervisor_id: int
    total_technician: int

class TechnicianRead(BaseModel):
    id: int
    name: str
    facility_id: int
    supervisor_id: int