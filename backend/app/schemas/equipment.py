from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import EquipmentStatus

class EquipmentBase(BaseModel):
    serial_number: str = Field(min_length=0, max_length=50)
    model: str = Field(min_length=0, max_length=100)
    status: EquipmentStatus = EquipmentStatus.AVAILABLE
    charge_level: Decimal = Field(ge=0, le=100)
    facility_id: int

class EquipmentCreate(EquipmentBase):
    """frontend-->backend, body request"""

class EquipmentRead(EquipmentBase):
    """backend-->frontend, api response"""
    id: int
    model_config = ConfigDict(from_attributes=True)

# 这里的None默认为不修改
class EquipmentUpdate(BaseModel):
    status: EquipmentStatus | None = None
    charge_level: Decimal | None = Field(default=None, ge=0, le=100)