import os
import requests
import json
import time
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
from db.mysql_client import SessionLocal
from db.models import SystemSetting

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI2NzQ0NCwiZXhwIjoyMDg4ODQzNDQ0fQ.yDWOD8UzhKsWXztjvbIupBskivuMVsNER9wV07UiLK4"

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}"
}

def fetch_with_retry(url, headers, timeout=60, max_tries=5):
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry
    
    session = requests.Session()
    retry = Retry(connect=5, backoff_factor=1, status_forcelist=[502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('https://', adapter)
    
    for i in range(max_tries):
        try:
            res = session.get(url, headers=headers, timeout=timeout)
            return res
        except Exception as e:
            print(f"  [Attempt {i+1}] Connection dropped: {e}, retrying...")
            time.sleep(2 ** i)
    return None

def main():
    print("🚀 Starting Dictionary Data Migration (System Settings)...")
    db = SessionLocal()
    try:
        t_name = "system_settings"
        print(f"Fetching {t_name} from Supabase...")
        
        url = f"{SUPABASE_URL}/rest/v1/{t_name}?select=*"
        res = fetch_with_retry(url, headers=HEADERS)
        
        if not res or res.status_code != 200:
            text = res.text if res else "No response"
            print(f"  Failed: {text}")
            return
            
        all_records = res.json()
        print(f"  Got {len(all_records)} records. Importing...")
        
        count = 0
        for item in all_records:
            # Check if this setting already exists in MySQL to avoid duplicates
            existing = db.query(SystemSetting).filter(
                SystemSetting.category == item.get('category'),
                SystemSetting.label == item.get('label')
            ).first()
            
            if not existing:
                valid_fields = {c.name for c in SystemSetting.__table__.columns}
                row_data = {k: v for k, v in item.items() if k in valid_fields}
                
                # If 'id' is in Supabase but it's an auto-increment in MySQL, 
                # check if we should keep the ID. SystemSettings in MySQL use Integer primary key.
                # If Supabase used UUID for id, we should let MySQL generate its own Integer ID.
                # Let's check model definition: id is Integer primary key.
                if 'id' in row_data and isinstance(row_data['id'], str):
                    del row_data['id'] # Let MySQL handle the integer ID
                
                try:
                    record = SystemSetting(**row_data)
                    db.add(record)
                    db.commit()
                    count += 1
                except Exception as e:
                    db.rollback()
                    print(f"  Failed to insert {item.get('label')} into {t_name}: {e}")
            else:
                # Optionally update existing? Usually dictionaries are static.
                pass
                
        print(f"✅ Successfully inserted {count} new system settings.")

    except Exception as e:
        print(f"Critical error: {e}")
    finally:
        db.close()
        print("🎉 Dictionary Migration Finished.")

if __name__ == "__main__":
    main()
