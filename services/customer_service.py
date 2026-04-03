from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Any
import uuid
from db.models import User, Customer, Project, Contact, VisitRecord, Task
from schemas.customer import (
    CustomerCreate, CustomerUpdate,
    ProjectCreate, ProjectUpdate,
    ContactCreate, ContactUpdate,
    VisitRecordCreate, VisitRecordUpdate,
    TaskCreate, TaskUpdate
)

class CustomerService:
    def __init__(self, db: Session):
        self.db = db

    # Helper to convert SA model to dict for compatibility with existing frontend expectations
    def _to_dict(self, obj):
        if not obj:
            return None
        d = {c.name: getattr(obj, c.name) for c in obj.__table__.columns}
        # Convert Decimals to float for JSON compatibility
        for k, v in d.items():
            if hasattr(v, '__float__') and not isinstance(v, (int, float)):
                d[k] = float(v)
        return d

    # --- Customers ---
    def get_customers(self, user_id: str) -> List[dict]:
        customers = self.db.query(Customer).filter(Customer.user_id == user_id).order_by(desc(Customer.created_at)).all()
        return [self._to_dict(c) for c in customers]

    def get_customer(self, customer_id: str, user_id: str = None) -> Optional[dict]:
        # If user_id is provided, we might want to restrict, but for shared follow-up
        # we allow getting any customer if the ID is known.
        query = self.db.query(Customer).filter(Customer.id == customer_id)
        if user_id and False: # Disabled strict ownership for shared follow-up
             query = query.filter(Customer.user_id == user_id)
        customer = query.first()
        return self._to_dict(customer)

    def search_customers(self, query_str: str) -> List[dict]:
        if not query_str:
            return []
        customers = self.db.query(Customer).filter(
            Customer.name.like(f"%{query_str}%")
        ).order_by(desc(Customer.created_at)).all()
        return [self._to_dict(c) for c in customers]

    def create_customer(self, customer: CustomerCreate, user_id: str) -> dict:
        data = customer.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        valid_keys = [c.name for c in Customer.__table__.columns]
        filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            
        new_customer = Customer(**filtered_data)
        self.db.add(new_customer)
        self.db.commit()
        self.db.refresh(new_customer)
        return self._to_dict(new_customer)

    def update_customer(self, customer_id: str, customer: CustomerUpdate, user_id: str) -> dict:
        db_customer = self.db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == user_id).first()
        if not db_customer:
            return None
        
        update_data = customer.model_dump(exclude_unset=True)
        valid_keys = [c.name for c in Customer.__table__.columns]
        
        # Track history
        from db.models import CustomerHistory
        
        for key, value in update_data.items():
            if key in valid_keys:
                if key in ['level', 'status']:
                    old_value = getattr(db_customer, key)
                    if old_value != value:
                        history_record = CustomerHistory(
                            id=str(uuid.uuid4()),
                            customer_id=customer_id,
                            field_name=key,
                            old_value=str(old_value) if old_value else None,
                            new_value=str(value) if value else None,
                            user_id=user_id
                        )
                        self.db.add(history_record)
                
                setattr(db_customer, key, value)
            
        self.db.commit()
        self.db.refresh(db_customer)
        return self._to_dict(db_customer)

    def delete_customer(self, customer_id: str, user_id: str) -> None:
        db_customer = self.db.query(Customer).filter(Customer.id == customer_id, Customer.user_id == user_id).first()
        if db_customer:
            self.db.delete(db_customer)
            self.db.commit()

    # --- Projects ---
    def get_projects_by_customer(self, customer_id: str, user_id: str) -> List[dict]:
        projects = self.db.query(Project).filter(
            Project.customer_id == customer_id, 
            Project.user_id == user_id
        ).order_by(desc(Project.created_at)).all()
        return [self._to_dict(p) for p in projects]

    def get_project(self, project_id: str, user_id: str) -> Optional[dict]:
        project = self.db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        return self._to_dict(project)

    def create_project(self, project: ProjectCreate, user_id: str) -> dict:
        data = project.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        valid_keys = [c.name for c in Project.__table__.columns]
        filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            
        new_project = Project(**filtered_data)
        self.db.add(new_project)
        self.db.commit()
        self.db.refresh(new_project)
        return self._to_dict(new_project)

    def update_project(self, project_id: str, project: ProjectUpdate, user_id: str) -> dict:
        db_project = self.db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if not db_project:
            return None
            
        update_data = project.model_dump(exclude_unset=True)
        valid_keys = [c.name for c in Project.__table__.columns]
        for key, value in update_data.items():
            if key in valid_keys:
                setattr(db_project, key, value)
            
        self.db.commit()
        self.db.refresh(db_project)
        return self._to_dict(db_project)

    def delete_project(self, project_id: str, user_id: str) -> None:
        db_project = self.db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
        if db_project:
            self.db.delete(db_project)
            self.db.commit()

    # --- Contacts ---
    def get_contacts_by_customer(self, customer_id: str, user_id: str, project_id: Optional[str] = None) -> List[dict]:
        query = self.db.query(Contact).filter(
            Contact.customer_id == customer_id
        )
        if project_id:
            query = query.filter(Contact.project_id == project_id)
        contacts = query.order_by(desc(Contact.created_at)).all()
        return [self._to_dict(c) for c in contacts]

    def create_contact(self, contact: ContactCreate, user_id: str) -> dict:
        # Check ownership
        db_customer = self.db.query(Customer).filter(Customer.id == contact.customer_id, Customer.user_id == user_id).first()
        if not db_customer:
            return None # Or raise Exception

        data = contact.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        valid_keys = [c.name for c in Contact.__table__.columns]
        filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            
        new_contact = Contact(**filtered_data)
        self.db.add(new_contact)
        self.db.commit()
        self.db.refresh(new_contact)
        return self._to_dict(new_contact)

    def update_contact(self, contact_id: str, contact: ContactUpdate, user_id: str) -> dict:
        db_contact = self.db.query(Contact).filter(Contact.id == contact_id, Contact.user_id == user_id).first()
        if not db_contact:
            return None
            
        update_data = contact.model_dump(exclude_unset=True)
        valid_keys = [c.name for c in Contact.__table__.columns]
        for key, value in update_data.items():
            if key in valid_keys:
                setattr(db_contact, key, value)
            
        self.db.commit()
        self.db.refresh(db_contact)
        return self._to_dict(db_contact)

    def delete_contact(self, contact_id: str, user_id: str) -> None:
        db_contact = self.db.query(Contact).filter(Contact.id == contact_id, Contact.user_id == user_id).first()
        if db_contact:
            self.db.delete(db_contact)
            self.db.commit()

    # --- Visit Records ---
    def get_visits_by_customer(self, customer_id: str, user_id: str = None, project_id: Optional[str] = None) -> List[dict]:
        # Joined query to get salesperson name
        query = self.db.query(VisitRecord, User.full_name).join(User, VisitRecord.user_id == User.id).filter(
            VisitRecord.customer_id == customer_id
        )
        
        # We don't filter by user_id anymore to show all visit history
        if project_id:
            query = query.filter(VisitRecord.project_id == project_id)
            
        results = query.order_by(desc(VisitRecord.date)).all()
        
        visits = []
        for v, full_name in results:
            d = self._to_dict(v)
            d["salesperson_name"] = full_name
            visits.append(d)
        return visits

    def create_visit(self, visit: VisitRecordCreate, user_id: str) -> dict:
        data = visit.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        valid_keys = [c.name for c in VisitRecord.__table__.columns]
        filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            
        new_visit = VisitRecord(**filtered_data)
        self.db.add(new_visit)
        
        # Update customer's last follow up summary with salesperson info
        customer = self.db.query(Customer).filter(Customer.id == visit.customer_id).first()
        if customer:
            user = self.db.query(User).filter(User.id == user_id).first()
            full_name = user.full_name if user else "未知销售"
            customer.last_follow_up = f"{visit.date or '今日'} | {full_name}: {visit.title}"
            
        self.db.commit()
        self.db.refresh(new_visit)
        return self._to_dict(new_visit)

    def update_visit(self, visit_id: str, visit: VisitRecordUpdate, user_id: str) -> dict:
        db_visit = self.db.query(VisitRecord).filter(VisitRecord.id == visit_id, VisitRecord.user_id == user_id).first()
        if not db_visit:
            return None
            
        update_data = visit.model_dump(exclude_unset=True)
        valid_keys = [c.name for c in VisitRecord.__table__.columns]
        for key, value in update_data.items():
            if key in valid_keys:
                setattr(db_visit, key, value)
            
        self.db.commit()
        self.db.refresh(db_visit)
        return self._to_dict(db_visit)

    def delete_visit(self, visit_id: str, user_id: str) -> None:
        db_visit = self.db.query(VisitRecord).filter(VisitRecord.id == visit_id, VisitRecord.user_id == user_id).first()
        if db_visit:
            self.db.delete(db_visit)
            self.db.commit()

    # --- Tasks ---
    def get_tasks_by_customer(self, customer_id: str, user_id: str, project_id: Optional[str] = None) -> List[dict]:
        query = self.db.query(Task).filter(
            Task.customer_id == customer_id
        )
        if project_id:
            query = query.filter(Task.project_id == project_id)
        tasks = query.order_by(desc(Task.created_at)).all()
        return [self._to_dict(t) for t in tasks]

    def create_task(self, task: TaskCreate, user_id: str) -> dict:
        # Check ownership
        db_customer = self.db.query(Customer).filter(Customer.id == task.customer_id, Customer.user_id == user_id).first()
        if not db_customer:
            return None

        data = task.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        valid_keys = [c.name for c in Task.__table__.columns]
        filtered_data = {k: v for k, v in data.items() if k in valid_keys}
            
        new_task = Task(**filtered_data)
        self.db.add(new_task)
        self.db.commit()
        self.db.refresh(new_task)
        return self._to_dict(new_task)

    def update_task(self, task_id: str, task: TaskUpdate, user_id: str) -> dict:
        db_task = self.db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if not db_task:
            return None
            
        update_data = task.model_dump(exclude_unset=True)
        valid_keys = [c.name for c in Task.__table__.columns]
        for key, value in update_data.items():
            if key in valid_keys:
                setattr(db_task, key, value)
            
        self.db.commit()
        self.db.refresh(db_task)
        return self._to_dict(db_task)

    def delete_task(self, task_id: str, user_id: str) -> None:
        db_task = self.db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
        if db_task:
            self.db.delete(db_task)
            self.db.commit()
