import os
import json
import subprocess
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
from db.mysql_client import SessionLocal
from db.models import User, SystemSetting

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI2NzQ0NCwiZXhwIjoyMDg4ODQzNDQ0fQ.yDWOD8UzhKsWXztjvbIupBskivuMVsNER9wV07UiLK4"

def download_data():
    print("📥 Downloading system_settings from Supabase via curl...")
    url = f"{SUPABASE_URL}/rest/v1/system_settings?select=*"
    cmd = [
        "curl", "-s", "-H", f"apikey: {SERVICE_KEY}", "-H", f"Authorization: Bearer {SERVICE_KEY}",
        url, "-o", "temp_settings.json"
    ]
    subprocess.run(cmd, check=True)
    with open("temp_settings.json", "r", encoding="utf-8") as f:
        return json.load(f)

def main():
    db = SessionLocal()
    try:
        # 1. Force Admin Role
        print("👤 Ensuring admin@admin.com has 'admin' role...")
        u = db.query(User).filter(User.email == 'admin@admin.com').first()
        if u:
            u.role = 'admin'
            db.commit()
            print(f"  Role verified: {u.role}")
        else:
            print("  Warning: admin@admin.com account not found in MySQL!")

        # 2. Sync Settings
        data = download_data()
        print(f"📦 Syncing {len(data)} settings to MySQL...")
        
        count = 0
        valid_fields = {c.name for c in SystemSetting.__table__.columns}
        
        # Clean current table to avoid ID conflicts since Supabase and Local IDs might overlap
        # Warning: Only doing this for system settings to ensure a fresh, calibrated set.
        db.query(SystemSetting).delete()
        db.commit()
        
        for item in data:
            row_data = {k: v for k, v in item.items() if k in valid_fields}
            
            # Map categories if needed (singular vs plural)
            # Frontend uses: industry, visit_type, product, sales_stage, customer_source
            if row_data.get('category') == 'products': row_data['category'] = 'product'
            if row_data.get('category') == 'sales_stages': row_data['category'] = 'sales_stage'
            
            # Ensure id matches model (Integer)
            if 'id' in row_data and isinstance(row_data['id'], str):
                del row_data['id']
                
            try:
                setting = SystemSetting(**row_data)
                db.add(setting)
                count += 1
            except Exception as e:
                print(f"  Failed to insert {item.get('label')}: {e}")
        
        db.commit()
        print(f"✅ Successfully restored {count} dictionary entries.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()
        if os.path.exists("temp_settings.json"):
            os.remove("temp_settings.json")

if __name__ == "__main__":
    main()
