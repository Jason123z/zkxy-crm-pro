from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from ...db.client import db_client, get_db
from ...services.visit_plan_service import VisitPlanService
from ...schemas.customer import VisitPlanCreate, VisitPlanUpdate, VisitPlanResponse
from ...core.auth import get_current_user_id

router = APIRouter()

def get_service(authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "") if authorization else None
    return VisitPlanService(get_db(token))

@router.get("/", response_model=List[VisitPlanResponse], response_model_by_alias=True)
def read_visit_plans(user_id: str = Depends(get_current_user_id), service: VisitPlanService = Depends(get_service)):
    return service.get_visit_plans(user_id)

@router.post("/", response_model=VisitPlanResponse, response_model_by_alias=True)
def create_visit_plan(plan: VisitPlanCreate, user_id: str = Depends(get_current_user_id), service: VisitPlanService = Depends(get_service)):
    return service.create_visit_plan(plan, user_id)

@router.put("/{plan_id}", response_model=VisitPlanResponse, response_model_by_alias=True)
def update_visit_plan(plan_id: str, plan: VisitPlanUpdate, user_id: str = Depends(get_current_user_id), service: VisitPlanService = Depends(get_service)):
    return service.update_visit_plan(plan_id, plan, user_id)

@router.delete("/{plan_id}")
def delete_visit_plan(plan_id: str, user_id: str = Depends(get_current_user_id), service: VisitPlanService = Depends(get_service)):
    service.delete_visit_plan(plan_id, user_id)
    return {"message": "Success"}
