import os
import requests
import json
import time
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()
from db.mysql_client import SessionLocal, engine, Base
from db.models import User, Profile, Customer, Project, Contact, VisitRecord, Task, CheckIn, VisitPlan, Report, ClientProgress

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI2NzQ0NCwiZXhwIjoyMDg4ODQzNDQ0fQ.yDWOD8UzhKsWXztjvbIupBskivuMVsNER9wV07UiLK4"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Profile": "public"
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def main():
    print("🚀 Starting Complete Data Migration bypassing RLS...")
    db = SessionLocal()
    try:
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry

        session = requests.Session()
        retry = Retry(connect=5, backoff_factor=1, status_forcelist=[ 502, 503, 504 ])
        adapter = HTTPAdapter(max_retries=retry)
        session.mount('https://', adapter)

        def fetch_with_retry(url, headers, timeout=60, max_tries=5):
            for i in range(max_tries):
                try:
                    res = session.get(url, headers=headers, timeout=timeout)
                    return res
                except Exception as e:
                    print(f"  [Attempt {i+1}] Connection dropped: {e}, retrying...")
                    time.sleep(2 ** i)
            return None

        print("1. Fetching Profiles...")
        r = fetch_with_retry(f"{SUPABASE_URL}/rest/v1/profiles?select=*", headers=HEADERS)
        profiles = r.json() if r and r.status_code == 200 else []
        print(f"Found {len(profiles)} profiles.")
        
        default_password = pwd_context.hash("123456")
        for p in profiles:
            uid = p.get('id')
            email = p.get('email')
            
            user = db.query(User).filter(User.id == uid).first()
            if not user:
                user_by_email = db.query(User).filter(User.email == email).first()
                if user_by_email:
                    print(f"  Fixing User ID mismatch for {email}")
                    db.query(User).filter(User.email == email).delete()
                    db.commit()

                print(f"  Creating aligned User: {email}")
                new_user = User(
                    id=uid,
                    email=email,
                    hashed_password=default_password,
                    role=p.get('role', '销售人员'),
                    full_name=p.get('name')
                )
                db.add(new_user)
                try:
                    db.commit()
                except Exception as e:
                    db.rollback()
                    print(f"  Could not create user {email}: {e}")
                    continue

                if not db.query(Profile).filter(Profile.id == uid).first():
                    new_profile = Profile(
                        id=uid,
                        name=p.get('name'),
                        role=p.get('role'),
                        employee_id=p.get('employee_id'),
                        avatar=p.get('avatar'),
                        phone=p.get('phone'),
                        email=p.get('email'),
                        department=p.get('department')
                    )
                    db.add(new_profile)
                    db.commit()
            
        print("✅ Account alignment complete.")

        tables = [
            ("customers", Customer),
            ("projects", Project),
            ("contacts", Contact),
            ("visit_records", VisitRecord),
            ("tasks", Task),
            ("check_ins", CheckIn),
            ("visit_plans", VisitPlan),
            ("reports", Report),
            ("client_progress", ClientProgress)
        ]

        for t_name, t_cls in tables:
            print(f"Fetching {t_name}...")
            all_records = []
            offset, limit = 0, 1000
            
            while True:
                url = f"{SUPABASE_URL}/rest/v1/{t_name}?select=*&limit={limit}&offset={offset}"
                res = fetch_with_retry(url, headers=HEADERS)
                if not res or res.status_code != 200:
                    text = res.text if res else "No response"
                    print(f"  Failed: {text}")
                    break
                data = res.json()
                if not data:
                    break
                all_records.extend(data)
                offset += limit
                
            print(f"  Got {len(all_records)} records. Importing...")
            count = 0
            for item in all_records:
                valid_fields = {c.name for c in t_cls.__table__.columns}
                row_data = {k: v for k, v in item.items() if k in valid_fields}
                
                # Idempotent: check if it already exists
                if not db.query(t_cls).filter(t_cls.id == row_data.get('id')).first():
                    try:
                        record = t_cls(**row_data)
                        db.add(record)
                        db.commit()
                        count += 1
                    except Exception as e:
                        db.rollback()
                        print(f"  Failed to insert {row_data.get('id')} into {t_name}: foreign key issue or data error")
                        
            print(f"✅ Inserted {count} new records into {t_name}")

    except Exception as e:
        print(f"Critical error: {e}")
    finally:
        db.close()
        print("🎉 Migration Finished.")

if __name__ == "__main__":
    main()
