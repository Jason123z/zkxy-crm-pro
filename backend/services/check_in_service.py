from supabase import Client
from typing import List, Optional
import uuid
from ..schemas.customer import CheckInCreate, CheckInResponse

class CheckInService:
    def __init__(self, db: Client):
        self.db = db

    def get_check_ins(self, user_id: str) -> List[dict]:
        response = self.db.table("check_ins").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data

    def create_check_in(self, check_in: CheckInCreate, user_id: str) -> dict:
        data = check_in.model_dump()
        data["user_id"] = user_id
        response = self.db.table("check_ins").insert(data).execute()
        return response.data[0]

    def delete_check_in(self, check_in_id: str, user_id: str) -> None:
        self.db.table("check_ins").delete().eq("id", check_in_id).eq("user_id", user_id).execute()
