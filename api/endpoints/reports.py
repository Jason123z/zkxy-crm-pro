from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List
from db.client import db_client, get_db
from services.report_service import ReportService
from schemas.customer import ReportCreate, ReportResponse
from core.auth import get_current_user_id

router = APIRouter()

def get_service(authorization: str = Header(None)):
    token = authorization.replace("Bearer ", "") if authorization else None
    return ReportService(get_db(token))

@router.get("/", response_model=List[ReportResponse], response_model_by_alias=True)
def read_reports(user_id: str = Depends(get_current_user_id), service: ReportService = Depends(get_service)):
    return service.get_reports(user_id)

@router.post("/", response_model=ReportResponse, response_model_by_alias=True)
def create_report(report: ReportCreate, user_id: str = Depends(get_current_user_id), service: ReportService = Depends(get_service)):
    return service.create_report(report, user_id)

@router.delete("/{report_id}")
def delete_report(report_id: str, user_id: str = Depends(get_current_user_id), service: ReportService = Depends(get_service)):
    service.delete_report(report_id, user_id)
    return {"message": "Success"}

