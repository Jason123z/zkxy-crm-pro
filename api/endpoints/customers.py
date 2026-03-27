from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional, Any
from db.client import db_client, get_db
from services.customer_service import CustomerService
from schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ContactCreate, ContactUpdate, ContactResponse,
    VisitRecordCreate, VisitRecordUpdate, VisitRecordResponse,
    TaskCreate, TaskUpdate, TaskResponse
)

from core.auth import get_current_user_id

router = APIRouter()

def get_service(authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "") if authorization else None
    return CustomerService(get_db(token))

@router.get("/", response_model=List[CustomerResponse], response_model_by_alias=True)
def read_customers(user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.get_customers(user_id)

@router.get("/{customer_id}", response_model=CustomerResponse, response_model_by_alias=True)
def read_customer(customer_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    customer = service.get_customer(customer_id, user_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=CustomerResponse, response_model_by_alias=True)
def create_customer(customer: CustomerCreate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.create_customer(customer, user_id)

@router.put("/{customer_id}", response_model=CustomerResponse, response_model_by_alias=True)
def update_customer(customer_id: str, customer: CustomerUpdate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.update_customer(customer_id, customer, user_id)

@router.delete("/{customer_id}")
def delete_customer(customer_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    service.delete_customer(customer_id, user_id)
    return {"message": "Success"}

# --- Projects ---
@router.get("/{customer_id}/projects", response_model=List[ProjectResponse], response_model_by_alias=True)
def read_projects(customer_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.get_projects_by_customer(customer_id, user_id)

@router.post("/{customer_id}/projects", response_model=ProjectResponse, response_model_by_alias=True)
def create_project(customer_id: str, project: ProjectCreate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    project.customer_id = customer_id
    return service.create_project(project, user_id)

@router.put("/{customer_id}/projects/{project_id}", response_model=ProjectResponse, response_model_by_alias=True)
def update_project(customer_id: str, project_id: str, project: ProjectUpdate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.update_project(project_id, project, user_id)

@router.delete("/{customer_id}/projects/{project_id}")
def delete_project(customer_id: str, project_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    service.delete_project(project_id, user_id)
    return {"message": "Success"}

# --- Contacts ---
@router.get("/{customer_id}/contacts", response_model_by_alias=True)
def read_contacts(customer_id: str, project_id: Any = None, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.get_contacts_by_customer(customer_id, user_id, project_id)

@router.post("/{customer_id}/contacts", response_model=ContactResponse, response_model_by_alias=True)
def create_contact(customer_id: str, contact: ContactCreate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    contact.customer_id = customer_id
    return service.create_contact(contact, user_id)

@router.put("/{customer_id}/contacts/{contact_id}", response_model=ContactResponse, response_model_by_alias=True)
def update_contact(customer_id: str, contact_id: str, contact: ContactUpdate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.update_contact(contact_id, contact, user_id)

@router.delete("/{customer_id}/contacts/{contact_id}")
def delete_contact(customer_id: str, contact_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    service.delete_contact(contact_id, user_id)
    return {"message": "Success"}

# --- Visits ---
@router.get("/{customer_id}/visits", response_model=List[VisitRecordResponse], response_model_by_alias=True)
def read_visits(customer_id: str, project_id: Any = None, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.get_visits_by_customer(customer_id, user_id, project_id)

@router.post("/{customer_id}/visits", response_model=VisitRecordResponse, response_model_by_alias=True)
def create_visit(customer_id: str, visit: VisitRecordCreate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    visit.customer_id = customer_id
    return service.create_visit(visit, user_id)

@router.put("/{customer_id}/visits/{visit_id}", response_model=VisitRecordResponse, response_model_by_alias=True)
def update_visit(customer_id: str, visit_id: str, visit: VisitRecordUpdate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.update_visit(visit_id, visit, user_id)

@router.delete("/{customer_id}/visits/{visit_id}")
def delete_visit(customer_id: str, visit_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    service.delete_visit(visit_id, user_id)
    return {"message": "Success"}

# --- Tasks ---
@router.get("/{customer_id}/tasks", response_model=List[TaskResponse], response_model_by_alias=True)
def read_tasks(customer_id: str, project_id: Any = None, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.get_tasks_by_customer(customer_id, user_id, project_id)

@router.post("/{customer_id}/tasks", response_model=TaskResponse, response_model_by_alias=True)
def create_task(customer_id: str, task: TaskCreate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    task.customer_id = customer_id
    return service.create_task(task, user_id)

@router.put("/{customer_id}/tasks/{task_id}", response_model=TaskResponse, response_model_by_alias=True)
def update_task(customer_id: str, task_id: str, task: TaskUpdate, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    return service.update_task(task_id, task, user_id)

@router.delete("/{customer_id}/tasks/{task_id}")
def delete_task(customer_id: str, task_id: str, user_id: str = Depends(get_current_user_id), service: CustomerService = Depends(get_service)):
    service.delete_task(task_id, user_id)
    return {"message": "Success"}

