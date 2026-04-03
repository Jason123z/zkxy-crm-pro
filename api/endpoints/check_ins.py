from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from db.mysql_client import get_db
from db.models import User
from services.check_in_service import CheckInService
from schemas.customer import CheckInCreate, CheckInResponse
from core.auth import get_current_user

router = APIRouter()

def get_service(db: Session = Depends(get_db)):
    return CheckInService(db)

@router.get("/", response_model=List[CheckInResponse], response_model_by_alias=True)
def read_check_ins(current_user: User = Depends(get_current_user), service: CheckInService = Depends(get_service)):
    return service.get_check_ins(current_user.id)

@router.post("/", response_model=CheckInResponse, response_model_by_alias=True)
def create_check_in(check_in: CheckInCreate, current_user: User = Depends(get_current_user), service: CheckInService = Depends(get_service)):
    return service.create_check_in(check_in, current_user.id)

@router.delete("/{check_in_id}")
def delete_check_in(check_in_id: str, current_user: User = Depends(get_current_user), service: CheckInService = Depends(get_service)):
    service.delete_check_in(check_in_id, current_user.id)
    return {"message": "Success"}
