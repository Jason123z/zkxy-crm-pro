from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SystemSettingBase(BaseModel):
    category: str
    label: str
    value: Optional[str] = None
    sort_order: Optional[int] = 0

class SystemSettingCreate(SystemSettingBase):
    pass

class SystemSettingUpdate(BaseModel):
    category: Optional[str] = None
    label: Optional[str] = None
    value: Optional[str] = None
    sort_order: Optional[int] = None

class SystemSettingResponse(SystemSettingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
