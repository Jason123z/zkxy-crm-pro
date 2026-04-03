from __future__ import annotations
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

# --- Project Schemas ---
class ProjectBase(CamelModel):
    name: str
    status: str | None = None
    product: str | None = None
    budget_level: str | None = None
    budget_amount: float | None = None
    description: str | None = None
    competitors: str | None = None

class ProjectCreate(ProjectBase):
    customer_id: str

class ProjectUpdate(CamelModel):
    name: str | None = None
    status: str | None = None
    product: str | None = None
    budget_level: str | None = None
    budget_amount: float | None = None
    description: str | None = None
    competitors: str | None = None

class ProjectResponse(ProjectBase):
    id: str
    customer_id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

# --- Customer Schemas ---
class CustomerBase(CamelModel):
    name: str
    level: str
    industry: str | None = None
    size: str | None = None
    last_follow_up: str | None = None
    status: str | None = None
    address: str | None = None
    budget_level: str | None = None
    budget_amount: float | None = None
    estimated_purchase_time: str | None = None
    estimated_purchase_amount: float | None = None
    product: str | None = None
    source: str | None = None
    description: str | None = None
    concerns: str | None = None
    solution: str | None = None
    competitors: str | None = None
    status_updated_at: datetime | None = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(CamelModel):
    name: str | None = None
    level: str | None = None
    industry: str | None = None
    size: str | None = None
    last_follow_up: str | None = None
    status: str | None = None
    address: str | None = None
    budget_level: str | None = None
    budget_amount: float | None = None
    estimated_purchase_time: str | None = None
    estimated_purchase_amount: float | None = None
    product: str | None = None
    source: str | None = None
    description: str | None = None
    concerns: str | None = None
    solution: str | None = None
    competitors: str | None = None
    status_updated_at: datetime | None = None

class CustomerResponse(CustomerBase):
    id: str
    user_id: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

# --- Contact Schemas ---
class ContactBase(CamelModel):
    customer_id: str | None = None
    project_id: str | None = None
    name: str
    role: str | None = None
    is_key: bool = False
    phone: str | None = None
    email: str | None = None
    avatar: str | None = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(CamelModel):
    customer_id: str | None = None
    project_id: str | None = None
    name: str | None = None
    role: str | None = None
    is_key: bool | None = None
    phone: str | None = None
    email: str | None = None
    avatar: str | None = None

class ContactResponse(ContactBase):
    id: str
    created_at: datetime | None = None

# --- Visit Record Schemas ---
class VisitRecordBase(CamelModel):
    customer_id: str | None = None
    project_id: str | None = None
    type: str | None = None
    title: str
    date: str | None = None
    content: str | None = None

class VisitRecordCreate(VisitRecordBase):
    pass

class VisitRecordUpdate(CamelModel):
    customer_id: str | None = None
    project_id: str | None = None
    type: str | None = None
    title: str | None = None
    date: str | None = None
    content: str | None = None

class VisitRecordResponse(VisitRecordBase):
    id: str
    salesperson_name: str | None = None
    created_at: datetime | None = None

# --- Task Schemas ---
class TaskBase(CamelModel):
    customer_id: str | None = None
    project_id: str | None = None
    title: str
    deadline: str | None = None
    status: str = "pending"

class TaskCreate(TaskBase):
    pass

class TaskUpdate(CamelModel):
    customer_id: str | None = None
    project_id: str | None = None
    title: str | None = None
    deadline: str | None = None
    status: str | None = None

class TaskResponse(TaskBase):
    id: str
    created_at: datetime | None = None

# --- CheckIn Schemas ---
class CheckInBase(CamelModel):
    customer: str
    type: str | None = None
    time: str | None = None
    date: str
    location: str | None = None
    notes: str | None = None
    photo: str | None = None

class CheckInCreate(CheckInBase):
    pass

class CheckInResponse(CheckInBase):
    id: str
    created_at: datetime | None = None

# --- VisitPlan Schemas ---
class VisitPlanBase(CamelModel):
    customer: str
    time: str
    date: str
    type: str
    completed: bool = False
    address: str | None = None

class VisitPlanCreate(VisitPlanBase):
    pass

class VisitPlanUpdate(CamelModel):
    completed: bool | None = None

class VisitPlanResponse(VisitPlanBase):
    id: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

# --- Report Schemas ---
class ClientProgressBase(CamelModel):
    customer_id: str
    customer_name: str
    status: str
    progress: str | None = None

class ClientProgressCreate(ClientProgressBase):
    pass

class ClientProgressResponse(ClientProgressBase):
    id: str
    report_id: str
    created_at: datetime | None = None

class ReportBase(CamelModel):
    type: str
    date: str
    summary: str
    next_plan: str

class ReportCreate(ReportBase):
    client_progress: List[ClientProgressCreate] | None = None

class ReportResponse(ReportBase):
    id: str
    client_progress: List[ClientProgressResponse] | None = []
    created_at: datetime | None = None

