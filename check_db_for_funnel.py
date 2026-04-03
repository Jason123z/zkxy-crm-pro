import os
import sys
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.getcwd())

from db.mysql_client import SessionLocal
from db.models import SystemSetting, Customer

db = SessionLocal()
try:
    settings = db.query(SystemSetting).filter(SystemSetting.category == 'sales_stage').order_by(SystemSetting.sort_order).all()
    print("SALES STAGES:", [(s.label, s.sort_order) for s in settings])
    
    customers_b = db.query(Customer).filter(Customer.level == 'B').count()
    print("TOTAL B CUSTOMERS:", customers_b)
finally:
    db.close()
