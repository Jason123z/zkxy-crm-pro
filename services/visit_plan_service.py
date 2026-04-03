from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import uuid
from db.models import VisitPlan
from schemas.customer import VisitPlanCreate, VisitPlanUpdate

class VisitPlanService:
    def __init__(self, db: Session):
        self.db = db

    def _to_dict(self, obj):
        if not obj:
            return None
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    def get_visit_plans(self, user_id: str) -> List[dict]:
        plans = self.db.query(VisitPlan).filter(VisitPlan.user_id == user_id).order_by(desc(VisitPlan.date)).all()
        return [self._to_dict(p) for p in plans]

    def create_visit_plan(self, plan_in: VisitPlanCreate, user_id: str) -> dict:
        data = plan_in.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        new_plan = VisitPlan(**data)
        self.db.add(new_plan)
        self.db.commit()
        self.db.refresh(new_plan)
        return self._to_dict(new_plan)

    def update_visit_plan(self, plan_id: str, plan_in: VisitPlanUpdate, user_id: str) -> dict:
        db_plan = self.db.query(VisitPlan).filter(VisitPlan.id == plan_id, VisitPlan.user_id == user_id).first()
        if not db_plan:
            return None
            
        update_data = plan_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_plan, key, value)
            
        self.db.commit()
        self.db.refresh(db_plan)
        return self._to_dict(db_plan)

    def delete_visit_plan(self, plan_id: str, user_id: str) -> None:
        db_plan = self.db.query(VisitPlan).filter(VisitPlan.id == plan_id, VisitPlan.user_id == user_id).first()
        if db_plan:
            self.db.delete(db_plan)
            self.db.commit()
