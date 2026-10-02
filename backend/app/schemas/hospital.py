from pydantic import BaseModel

class MaintenanceFlagsRead(BaseModel):
    hospital_id: int
    hospital_name: str
    total_equipment: int
    maintenance_equipment: int
    maintenance_percentage: float

class HospitalRead(BaseModel):
    id: int
    name: str
    location_region: str
    capacity: int
    supervisor_id: int