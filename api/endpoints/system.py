from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from db.mysql_client import get_db
from db.models import SystemSetting, User
from core.auth import get_current_user

router = APIRouter()

# This endpoint is accessible to any logged-in user (sales or admin)
@router.get("/settings")
def get_settings(category: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(SystemSetting).filter(SystemSetting.category == category).order_by(SystemSetting.sort_order.asc()).all()
