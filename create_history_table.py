import os
import sys
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

# Add current directory to path
sys.path.append(os.getcwd())

from db.mysql_client import engine, Base
from db.models import CustomerHistory

def create_tables():
    print(f"Connecting to engine...")
    try:
        # Create all tables that don't exist yet
        # Based on my previous file view, CustomerHistory is in db/models.py
        Base.metadata.create_all(bind=engine)
        print("Successfully created missing tables (including customer_history).")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    create_tables()
