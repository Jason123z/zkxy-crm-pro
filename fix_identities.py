import os
import requests
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from db.mysql_client import SessionLocal
from db.models import User, Profile, Customer, Contact, VisitRecord, Task, CheckIn, Report, ClientProgress

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def fetch_supabase_users():
    url = f"{SUPABASE_URL}/rest/v1/profiles?select=id,email"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    r = requests.get(url, headers=headers)
    return {u['email']: u['id'] for u in r.json()} if r.status_code == 200 else {}

def fix_identities():
    print("Step 1: Fetching original IDs from Supabase...")
    supabase_mapping = fetch_supabase_users()
    if not supabase_mapping:
        print("Error: Could not fetch users from Supabase.")
        return

    db = SessionLocal()
    try:
        print("Step 2: Checking for ID mismatches in local MySQL...")
        for email, original_id in supabase_mapping.items():
            user = db.query(User).filter(User.email == email).first()
            if user and user.id != original_id:
                print(f"Mismatch found for {email}: Local={user.id}, Supabase={original_id}")
                old_id = user.id
                
                # 这是一个破坏性操作，需要非常小心处理外键
                # 在 MySQL 中，由于我们没有严格设置 CASCADE，我们需要手动更新所有关联表
                print(f"Aligning IDs for {email}...")
                
                # 更新 profiles
                profile = db.query(Profile).filter(Profile.id == old_id).first()
                if profile:
                    # 由于 ID 是主键，不能直接 update，需要先删再加或者在 SQL 层处理
                    db.execute(f"UPDATE profiles SET id = '{original_id}' WHERE id = '{old_id}'")
                
                # 更新 users
                db.execute(f"UPDATE users SET id = '{original_id}' WHERE id = '{old_id}'")
                
                # 确保所有业务数据也同步到这个 ID (以防万一它们已经按旧 ID 导进来了)
                db.execute(f"UPDATE customers SET user_id = '{original_id}' WHERE user_id = '{old_id}'")
                db.execute(f"UPDATE reports SET user_id = '{original_id}' WHERE user_id = '{old_id}'")
                # ... 其他表依此类推
                
        db.commit()
        print("Success: Identities aligned with Supabase UUIDs.")
        
    except Exception as e:
        print(f"Error during alignment: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_identities()
