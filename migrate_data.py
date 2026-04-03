import os
import uuid
import requests
import json
import time
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from db.mysql_client import SessionLocal
from db.models import User, Profile, Customer, Contact, VisitRecord, Task, CheckIn, VisitPlan, Report, ClientProgress, SystemSetting
from core.auth import get_password_hash

# 加载配置
load_dotenv()

# Supabase 配置
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# MySQL 会话
db: Session = SessionLocal()

def fetch_supabase_data(table_name, max_retries=3):
    """通过 REST API 获取 Supabase 数据 (带重试机制)"""
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Warning: Attempt {attempt+1} failed for {table_name}: {response.status_code}")
        except Exception as e:
            print(f"Warning: Attempt {attempt+1} encountered error for {table_name}: {e}")
        
        if attempt < max_retries - 1:
            time.sleep(2) # 等待 2 秒后重试
            
    print(f"Error: Failed to fetch {table_name} after {max_retries} attempts.")
    return []

def migrate():
    print("Start resilient data migration (Using REST API with Retries)...")
    default_password = get_password_hash("123456")

    try:
        # 1. 迁移 Profiles (并重建 Users)
        print("Syncing profiles and accounts...")
        profiles_data = fetch_supabase_data("profiles")
        for p in profiles_data:
            existing_user_id = db.query(User).filter(User.id == p['id']).first()
            existing_user_email = db.query(User).filter(User.email == p.get('email')).first()
            
            target_user_id = p['id']
            if not existing_user_id and not existing_user_email:
                db.add(User(
                    id=p['id'],
                    email=p.get('email', f"user_{p['id'][:8]}@example.com"),
                    hashed_password=default_password,
                    full_name=p.get('name'),
                    role=p.get('role', '销售人员')
                ))
                db.flush()
            elif existing_user_email and not existing_user_id:
                target_user_id = existing_user_email.id

            if not db.query(Profile).filter(Profile.id == target_user_id).first():
                db.add(Profile(
                    id=target_user_id,
                    name=p.get('name'),
                    role=p.get('role'),
                    employee_id=p.get('employee_id'),
                    avatar=p.get('avatar'),
                    phone=p.get('phone'),
                    email=p.get('email'),
                    department=p.get('department')
                ))
        db.commit()
        print(f"OK: Synced users/profiles")

        # 定义通用迁移函数
        def migrate_table(table_name, model_class, mapping_func):
            print(f"Syncing {table_name}...")
            data = fetch_supabase_data(table_name)
            count = 0
            for item in data:
                try:
                    if not db.query(model_class).filter(model_class.id == item['id']).first():
                        db.add(mapping_func(item))
                        count += 1
                        if count % 50 == 0:
                            db.flush()
                except Exception as e:
                    print(f"Skip record in {table_name} due to error: {e}")
                    db.rollback()
            db.commit()
            print(f"OK: Synced {count} new records for {table_name}")
            time.sleep(0.5) # 给 API 一点反应时间

        # 2. 迁移 Customers
        migrate_table("customers", Customer, lambda c: Customer(
            id=c['id'], user_id=c['user_id'], name=c['name'], level=c['level'],
            industry=c.get('industry'), size=c.get('size'), address=c.get('address'),
            budget_level=c.get('budget_level'), budget_amount=c.get('budget_amount')
        ))

        # 3. 迁移 Contacts
        migrate_table("contacts", Contact, lambda c: Contact(
            id=c['id'], user_id=c['user_id'], customer_id=c.get('customer_id'),
            name=c['name'], role=c.get('role'), decision_role=c.get('decision_role'),
            is_key=c.get('is_key', False), phone=c.get('phone'), email=c.get('email')
        ))

        # 4. 迁移跟进记录
        migrate_table("visit_records", VisitRecord, lambda v: VisitRecord(
            id=v['id'], user_id=v['user_id'], customer_id=v.get('customer_id'), 
            type=v.get('type'), title=v.get('title'), date=v.get('date'), content=v.get('content')
        ))

        # 5. 迁移任务
        migrate_table("tasks", Task, lambda t: Task(
            id=t['id'], user_id=t['user_id'], customer_id=t.get('customer_id'), 
            title=t['title'], deadline=t.get('deadline'), status=t.get('status', 'pending')
        ))

        # 6. 迁移打卡
        migrate_table("check_ins", CheckIn, lambda ci: CheckIn(
            id=ci['id'], user_id=ci['user_id'], customer=ci['customer'], 
            type=ci.get('type'), time=ci.get('time'), date=ci.get('date'), 
            location=ci.get('location'), notes=ci.get('notes')
        ))

        # 7. 迁移周报
        migrate_table("reports", Report, lambda r: Report(
            id=r['id'], user_id=r['user_id'], type=r['type'], date=r['date'], 
            summary=r.get('summary'), next_plan=r.get('next_plan')
        ))

        # 8. 迁移进展
        migrate_table("client_progress", ClientProgress, lambda cp: ClientProgress(
            id=cp['id'], user_id=cp['user_id'], report_id=cp.get('report_id'), 
            customer_id=cp.get('customer_id'), customer_name=cp.get('customer_name'), 
            status=cp.get('status'), progress=cp.get('progress')
        ))

        print("\nSUCCESS: All data migrated successfully!")

    except Exception as e:
        print(f"Fatal error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
