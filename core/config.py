from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZKXY CRM PRO Backend"
    API_V1_STR: str = "/api/v1"
    
    # Supabase config (Legacy)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None

    # MySQL Configuration
    MYSQL_URL: str = "mysql+pymysql://root:password@localhost:3306/zkxy_crm"
    
    # Auth Configuration
    SECRET_KEY: str = "yoursecretkeyhere_change_me_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
