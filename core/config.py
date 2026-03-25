from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ZKXY CRM PRO Backend"
    API_V1_STR: str = "/api/v1"
    
    # Supabase config
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        case_sensitive = True
        env_file = "backend/.env"

settings = Settings()

