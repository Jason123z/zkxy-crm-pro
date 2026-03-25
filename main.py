from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import traceback
import sys

load_dotenv()

from api.endpoints import customers, check_ins, visit_plans, reports
from core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"CRITICAL ERROR: {str(exc)}")
    traceback.print_exc(file=sys.stdout)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
    )

app.include_router(customers.router, prefix=f"{settings.API_V1_STR}/customers", tags=["customers"])
app.include_router(check_ins.router, prefix=f"{settings.API_V1_STR}/check_ins", tags=["check_ins"])
app.include_router(visit_plans.router, prefix=f"{settings.API_V1_STR}/visit_plans", tags=["visit_plans"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {"message": "Welcome to ZKXY CRM PRO API"}

