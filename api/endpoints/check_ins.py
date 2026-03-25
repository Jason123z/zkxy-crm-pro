from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from db.client import db_client, get_db
from services.check_in_service import CheckInService
from schemas.customer import CheckInCreate, CheckInResponse
from core.auth import get_current_user_id

router = APIRouter()

def get_service(authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "") if authorization else None
    return CheckInService(get_db(token))

@router.get("/", response_model=List[CheckInResponse], response_model_by_alias=True)
def read_check_ins(user_id: str = Depends(get_current_user_id), service: CheckInService = Depends(get_service)):
    return service.get_check_ins(user_id)

@router.post("/", response_model=CheckInResponse, response_model_by_alias=True)
def create_check_in(check_in: CheckInCreate, user_id: str = Depends(get_current_user_id), service: CheckInService = Depends(get_service)):
    return service.create_check_in(check_in, user_id)

@router.delete("/{check_in_id}")
def delete_check_in(check_in_id: str, user_id: str = Depends(get_current_user_id), service: CheckInService = Depends(get_service)):
    service.delete_check_in(check_in_id, user_id)
    return {"message": "Success"}

