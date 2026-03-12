from supabase import Client
from typing import List, Optional
from ..schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerResponse,
    ContactCreate, ContactUpdate, ContactResponse,
    VisitRecordCreate, VisitRecordUpdate, VisitRecordResponse,
    TaskCreate, TaskUpdate, TaskResponse
)

class CustomerService:
    def __init__(self, db: Client):
        self.db = db

    # --- Customers ---
    def get_customers(self, user_id: str) -> List[dict]:
        response = self.db.table("customers").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data

    def get_customer(self, customer_id: str, user_id: str) -> Optional[dict]:
        response = self.db.table("customers").select("*").eq("id", customer_id).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    def create_customer(self, customer: CustomerCreate, user_id: str) -> dict:
        data = customer.model_dump()
        data["user_id"] = user_id
        response = self.db.table("customers").insert(data).execute()
        return response.data[0]

    def update_customer(self, customer_id: str, customer: CustomerUpdate, user_id: str) -> dict:
        response = self.db.table("customers").update(customer.model_dump(exclude_unset=True)).eq("id", customer_id).eq("user_id", user_id).execute()
        return response.data[0]

    def delete_customer(self, customer_id: str, user_id: str) -> None:
        self.db.table("customers").delete().eq("id", customer_id).eq("user_id", user_id).execute()

    # --- Contacts ---
    def get_contacts_by_customer(self, customer_id: str, user_id: str) -> List[dict]:
        response = self.db.table("contacts").select("*").eq("customer_id", customer_id).eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data

    def create_contact(self, contact: ContactCreate, user_id: str) -> dict:
        data = contact.model_dump()
        data["user_id"] = user_id
        response = self.db.table("contacts").insert(data).execute()
        return response.data[0]

    def update_contact(self, contact_id: str, contact: ContactUpdate, user_id: str) -> dict:
        response = self.db.table("contacts").update(contact.model_dump(exclude_unset=True)).eq("id", contact_id).eq("user_id", user_id).execute()
        return response.data[0]

    def delete_contact(self, contact_id: str, user_id: str) -> None:
        self.db.table("contacts").delete().eq("id", contact_id).eq("user_id", user_id).execute()

    # --- Visit Records ---
    def get_visits_by_customer(self, customer_id: str, user_id: str) -> List[dict]:
        response = self.db.table("visit_records").select("*").eq("customer_id", customer_id).eq("user_id", user_id).order("date", desc=True).execute()
        return response.data

    def create_visit(self, visit: VisitRecordCreate, user_id: str) -> dict:
        data = visit.model_dump()
        data["user_id"] = user_id
        response = self.db.table("visit_records").insert(data).execute()
        return response.data[0]

    def update_visit(self, visit_id: str, visit: VisitRecordUpdate, user_id: str) -> dict:
        response = self.db.table("visit_records").update(visit.model_dump(exclude_unset=True)).eq("id", visit_id).eq("user_id", user_id).execute()
        return response.data[0]

    def delete_visit(self, visit_id: str, user_id: str) -> None:
        self.db.table("visit_records").delete().eq("id", visit_id).eq("user_id", user_id).execute()

    # --- Tasks ---
    def get_tasks_by_customer(self, customer_id: str, user_id: str) -> List[dict]:
        response = self.db.table("tasks").select("*").eq("customer_id", customer_id).eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data

    def create_task(self, task: TaskCreate, user_id: str) -> dict:
        data = task.model_dump()
        data["user_id"] = user_id
        response = self.db.table("tasks").insert(data).execute()
        return response.data[0]

    def update_task(self, task_id: str, task: TaskUpdate, user_id: str) -> dict:
        response = self.db.table("tasks").update(task.model_dump(exclude_unset=True)).eq("id", task_id).eq("user_id", user_id).execute()
        return response.data[0]

    def delete_task(self, task_id: str, user_id: str) -> None:
        self.db.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()
