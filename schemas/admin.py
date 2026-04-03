from pydantic import BaseModel
from typing import List, Optional

class BulkTransferRequest(BaseModel):
    customer_ids: List[str]
    target_user_id: str

class BulkReleaseRequest(BaseModel):
    customer_ids: List[str]
