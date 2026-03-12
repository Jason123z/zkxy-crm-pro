from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
from typing import Optional, List
from datetime import datetime

# --- Base Schema with CamelCase ---
class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

# --- Customer Schemas ---
class CustomerBase(CamelModel):
    name: str
    level: str
    industry: Optional[str] = None
    size: Optional[str] = None
    contact_person: Optional[str] = None
    contact_role: Optional[str] = None
    last_follow_up: Optional[str] = None
    status: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Contact Schemas ---
class ContactBase(CamelModel):
    customer_id: Optional[str] = None
    name: str
    role: Optional[str] = None
    is_key: bool = False
    phone: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(CamelModel):
    customer_id: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_key: Optional[bool] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None

class ContactResponse(ContactBase):
    id: str
    created_at: Optional[datetime] = None

# --- Visit Record Schemas ---
class VisitRecordBase(CamelModel):
    customer_id: Optional[str] = None
    type: Optional[str] = None
    title: str
    date: Optional[str] = None
    content: Optional[str] = None

class VisitRecordCreate(VisitRecordBase):
    pass

class VisitRecordUpdate(CamelModel):
    customer_id: Optional[str] = None
    type: Optional[str] = None
    title: Optional[str] = None
    date: Optional[str] = None
    content: Optional[str] = None

class VisitRecordResponse(VisitRecordBase):
    id: str
    created_at: Optional[datetime] = None

# --- Task Schemas ---
class TaskBase(CamelModel):
    customer_id: Optional[str] = None
    title: str
    deadline: Optional[str] = None
    status: str = "pending"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(CamelModel):
    customer_id: Optional[str] = None
    title: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    created_at: Optional[datetime] = None

# --- CheckIn Schemas ---
class CheckInBase(CamelModel):
    customer: str
    type: Optional[str] = None
    time: Optional[str] = None
    date: str
    location: Optional[str] = None
    notes: Optional[str] = None
    photo: Optional[str] = None

class CheckInCreate(CheckInBase):
    pass

class CheckInResponse(CheckInBase):
    id: str
    created_at: Optional[datetime] = None

# --- VisitPlan Schemas ---
class VisitPlanBase(CamelModel):
    customer: str
    time: str
    date: str
    type: str
    completed: bool = False
    address: Optional[str] = None

class VisitPlanCreate(VisitPlanBase):
    pass

class VisitPlanUpdate(CamelModel):
    completed: Optional[bool] = None

class VisitPlanResponse(VisitPlanBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Report Schemas ---
class ClientProgressBase(CamelModel):
    customer_id: str
    customer_name: str
    status: str
    progress: Optional[str] = None

class ClientProgressCreate(ClientProgressBase):
    pass

class ClientProgressResponse(ClientProgressBase):
    id: str
    report_id: str
    created_at: Optional[datetime] = None

class ReportBase(CamelModel):
    type: str
    date: str
    summary: str
    next_plan: str

class ReportCreate(ReportBase):
    client_progress: Optional[List[ClientProgressCreate]] = None

class ReportResponse(ReportBase):
    id: str
    client_progress: Optional[List[ClientProgressResponse]] = []
    created_at: Optional[datetime] = None
