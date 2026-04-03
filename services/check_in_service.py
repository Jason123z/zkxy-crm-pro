from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
import uuid
from db.models import CheckIn
from schemas.customer import CheckInCreate

class CheckInService:
    def __init__(self, db: Session):
        self.db = db

    def _to_dict(self, obj):
        if not obj:
            return None
        return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

    def get_check_ins(self, user_id: str) -> List[dict]:
        check_ins = self.db.query(CheckIn).filter(CheckIn.user_id == user_id).order_by(desc(CheckIn.created_at)).all()
        return [self._to_dict(c) for c in check_ins]

    def create_check_in(self, check_in_in: CheckInCreate, user_id: str) -> dict:
        data = check_in_in.model_dump()
        data["user_id"] = user_id
        if "id" not in data or not data["id"]:
            data["id"] = str(uuid.uuid4())
            
        new_check_in = CheckIn(**data)
        self.db.add(new_check_in)
        self.db.commit()
        self.db.refresh(new_check_in)
        return self._to_dict(new_check_in)

    def delete_check_in(self, check_in_id: str, user_id: str) -> None:
        db_check_in = self.db.query(CheckIn).filter(CheckIn.id == check_in_id, CheckIn.user_id == user_id).first()
        if db_check_in:
            self.db.delete(db_check_in)
            self.db.commit()
