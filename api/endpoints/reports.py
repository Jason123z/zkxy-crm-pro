from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from db.mysql_client import get_db
from db.models import User
from services.report_service import ReportService
from schemas.customer import ReportCreate, ReportResponse
from core.auth import get_current_user

router = APIRouter()

def get_service(db: Session = Depends(get_db)):
    return ReportService(db)

@router.get("/", response_model=List[ReportResponse], response_model_by_alias=True)
def read_reports(current_user: User = Depends(get_current_user), service: ReportService = Depends(get_service)):
    return service.get_reports(current_user.id)

@router.post("/", response_model=ReportResponse, response_model_by_alias=True)
def create_report(report: ReportCreate, current_user: User = Depends(get_current_user), service: ReportService = Depends(get_service)):
    return service.create_report(report, current_user.id)

@router.delete("/{report_id}")
def delete_report(report_id: str, current_user: User = Depends(get_current_user), service: ReportService = Depends(get_service)):
    service.delete_report(report_id, current_user.id)
    return {"message": "Success"}
