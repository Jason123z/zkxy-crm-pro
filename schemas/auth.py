from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str  # username field (not required to be email)
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    must_change_password: bool = False

class TokenData(BaseModel):
    user_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    employee_id: Optional[str] = None

# ---- Admin-managed sales account schemas ----

class SalesAccountCreate(BaseModel):
    username: str
    full_name: Optional[str] = None

class SalesAccountUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class SalesAccountResponse(BaseModel):
    id: str
    username: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    must_change_password: bool

    class Config:
        from_attributes = True
