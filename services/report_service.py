from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import uuid
from db.models import Report, ClientProgress
from schemas.customer import ReportCreate

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def _to_dict(self, obj):
        if not obj:
            return None
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    def get_reports(self, user_id: str) -> List[dict]:
        # Get reports
        reports_objs = self.db.query(Report).filter(Report.user_id == user_id).order_by(desc(Report.created_at)).all()
        reports = [self._to_dict(r) for r in reports_objs]
        
        # Get all progress for this user to avoid N+1 if needed, or just filter
        progress_objs = self.db.query(ClientProgress).filter(ClientProgress.user_id == user_id).all()
        progress_data = [self._to_dict(p) for p in progress_objs]

        # Nest progress in reports
        for r in reports:
            r["client_progress"] = [p for p in progress_data if p["report_id"] == r["id"]]
            
        return reports

    def create_report(self, report_in: ReportCreate, user_id: str) -> dict:
        # Create report record
        report_data = report_in.model_dump(exclude={"client_progress"})
        report_data["user_id"] = user_id
        if "id" not in report_data or not report_data["id"]:
            report_data["id"] = str(uuid.uuid4())
            
        new_report_obj = Report(**report_data)
        self.db.add(new_report_obj)
        self.db.flush()  # Ensure report exists before adding child rows
        
        # Create progress records
        client_progress = []
        if report_in.client_progress:
            for cp in report_in.client_progress:
                cp_data = cp.model_dump()
                cp_data["report_id"] = report_data["id"]
                cp_data["user_id"] = user_id
                if "id" not in cp_data or not cp_data["id"]:
                    cp_data["id"] = str(uuid.uuid4())
                
                new_cp_obj = ClientProgress(**cp_data)
                self.db.add(new_cp_obj)
                client_progress.append(cp_data)
        
        self.db.commit()
        self.db.refresh(new_report_obj)
        
        res = self._to_dict(new_report_obj)
        res["client_progress"] = client_progress
        return res

    def delete_report(self, report_id: str, user_id: str) -> None:
        db_report = self.db.query(Report).filter(Report.id == report_id, Report.user_id == user_id).first()
        if db_report:
            self.db.delete(db_report)
            self.db.commit()
