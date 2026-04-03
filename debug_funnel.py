import os
import sys
import datetime
from dotenv import load_dotenv
from sqlalchemy import func

load_dotenv()
sys.path.append(os.getcwd())

from db.mysql_client import SessionLocal
from db.models import CustomerHistory, Customer

db = SessionLocal()
try:
    h_count = db.query(CustomerHistory).count()
    c_count = db.query(Customer).count()
    print(f"HISTORY_COUNT: {h_count}")
    print(f"CUSTOMER_COUNT: {c_count}")
    
    now = datetime.datetime.now()
    print(f"CURRENT_MONTH: {now.month}")
    print(f"CURRENT_YEAR: {now.year}")
    
    new_b = db.query(Customer).filter(
        func.month(Customer.created_at) == now.month,
        func.year(Customer.created_at) == now.year,
        Customer.level == 'B'
    ).count()
    print(f"NEW_B_THIS_MONTH: {new_b}")
    
    # Check history records
    histories = db.query(CustomerHistory).all()
    for h in histories:
        print(f"History: Field={h.field_name}, Old={h.old_value}, New={h.new_value}, Date={h.created_at}")

finally:
    db.close()
