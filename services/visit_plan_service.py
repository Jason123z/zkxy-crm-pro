from supabase import Client
from typing import List, Optional
from schemas.customer import VisitPlanCreate, VisitPlanUpdate, VisitPlanResponse

class VisitPlanService:
    def __init__(self, db: Client):
        self.db = db

    def get_visit_plans(self, user_id: str) -> List[dict]:
        response = self.db.table("visit_plans").select("*").eq("user_id", user_id).order("date", desc=True).execute()
        return response.data

    def create_visit_plan(self, plan: VisitPlanCreate, user_id: str) -> dict:
        data = plan.model_dump()
        data["user_id"] = user_id
        response = self.db.table("visit_plans").insert(data).execute()
        return response.data[0]

    def update_visit_plan(self, plan_id: str, plan: VisitPlanUpdate, user_id: str) -> dict:
        response = self.db.table("visit_plans").update(plan.model_dump(exclude_unset=True)).eq("id", plan_id).eq("user_id", user_id).execute()
        return response.data[0]

    def delete_visit_plan(self, plan_id: str, user_id: str) -> None:
        self.db.table("visit_plans").delete().eq("id", plan_id).eq("user_id", user_id).execute()

