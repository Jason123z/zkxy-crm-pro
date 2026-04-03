from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from db.mysql_client import get_db
from db.models import User
from services.visit_plan_service import VisitPlanService
from schemas.customer import VisitPlanCreate, VisitPlanUpdate, VisitPlanResponse
from core.auth import get_current_user

router = APIRouter()

def get_service(db: Session = Depends(get_db)):
    return VisitPlanService(db)

@router.get("/", response_model=List[VisitPlanResponse], response_model_by_alias=True)
def read_visit_plans(current_user: User = Depends(get_current_user), service: VisitPlanService = Depends(get_service)):
    return service.get_visit_plans(current_user.id)

@router.post("/", response_model=VisitPlanResponse, response_model_by_alias=True)
def create_visit_plan(plan: VisitPlanCreate, current_user: User = Depends(get_current_user), service: VisitPlanService = Depends(get_service)):
    return service.create_visit_plan(plan, current_user.id)

@router.put("/{plan_id}", response_model=VisitPlanResponse, response_model_by_alias=True)
def update_visit_plan(plan_id: str, plan: VisitPlanUpdate, current_user: User = Depends(get_current_user), service: VisitPlanService = Depends(get_service)):
    updated = service.update_visit_plan(plan_id, plan, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Visit plan not found or access denied")
    return updated

@router.delete("/{plan_id}")
def delete_visit_plan(plan_id: str, current_user: User = Depends(get_current_user), service: VisitPlanService = Depends(get_service)):
    service.delete_visit_plan(plan_id, current_user.id)
    return {"message": "Success"}
