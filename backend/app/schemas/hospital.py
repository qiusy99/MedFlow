from pydantic import BaseModel, ConfigDict

class MaintenanceFlagsRead(BaseModel):
    hospital_id: int
    hospital_name: str
    total_equipment: int
    maintenance_equipment: int
    maintenance_percentage: float

class HospitalBase(BaseModel):
    name: str
    location_region: str
    capacity: int
    supervisor_id: int

class HospitalRead(HospitalBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class HospitalUpdate(BaseModel):
    capacity: int

class HospitalCreate(HospitalBase):
    pass


