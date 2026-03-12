from supabase import Client
from typing import List, Optional
from ..schemas.customer import ReportCreate, ReportResponse

class ReportService:
    def __init__(self, db: Client):
        self.db = db

    def get_reports(self, user_id: str) -> List[dict]:
        # 获取属于该用户的 reports
        response = self.db.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        reports = response.data
        
        # 获取该用户的进展
        progress_res = self.db.table("client_progress").select("*").eq("user_id", user_id).execute()
        progress_data = progress_res.data

        # 挂载到相应的 report 上
        for r in reports:
            r["client_progress"] = [p for p in progress_data if p["report_id"] == r["id"]]
            
        return reports

    def create_report(self, report: ReportCreate, user_id: str) -> dict:
        # 分离出 client_progress
        report_data = report.model_dump(exclude={"client_progress"})
        report_data["user_id"] = user_id
        response = self.db.table("reports").insert(report_data).execute()
        new_report = response.data[0]
        
        # 写入进展
        client_progress = []
        if report.client_progress:
            for cp in report.client_progress:
                cp_data = cp.model_dump()
                cp_data["report_id"] = new_report["id"]
                cp_data["user_id"] = user_id
                cp_res = self.db.table("client_progress").insert(cp_data).execute()
                client_progress.append(cp_res.data[0])
                
        new_report["client_progress"] = client_progress
        return new_report

    def delete_report(self, report_id: str, user_id: str) -> None:
        self.db.table("reports").delete().eq("id", report_id).eq("user_id", user_id).execute()
