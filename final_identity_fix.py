import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
from sqlalchemy import text
from db.mysql_client import SessionLocal
from db.models import User, Profile, Customer, Contact, VisitRecord, Task, CheckIn, VisitPlan, Report, ClientProgress

# Correct mapping from Supabase
MAPPING = {
    'researcher@google.com': 'ee00fb94-2a83-4927-8062-3a20b45e76f1',
    'admin@admin.com': 'f56d266b-4884-4d1a-ba9c-e208fe731058',
    'zsc785539123@gmail.com': '08230d54-fc23-4b39-ac52-b80a462a29f8',
    '785539123@qq.com': '05307042-70ae-458a-9f09-b776e69e553b',
    'liming@example.com': '36ade119-a166-4a98-bede-58503b61fd39'
}

def main():
    print("🚀 Starting Final Identity Alignment...")
    db = SessionLocal()
    try:
        # We need to be careful with foreign keys. 
        # MySQL wont let us change User.id if it's referenced, unless on update cascade is set.
        # Let's check models.py: ForeignKey("users.id", ondelete="CASCADE") - usually also ON UPDATE CASCADE is better.
        # For safety, we will:
        # 1. Temporarily disable foreign key checks
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        for email, correct_id in MAPPING.items():
            print(f"Aligning {email} -> {correct_id}")
            
            # Find the user by email regardless of current ID
            u = db.query(User).filter(User.email == email).first()
            if u:
                old_id = u.id
                if old_id != correct_id:
                    print(f"  Updating User ID from {old_id} to {correct_id}")
                    # Update User
                    db.execute(text(f"UPDATE users SET id='{correct_id}' WHERE id='{old_id}';"))
                    # Update Profile
                    db.execute(text(f"UPDATE profiles SET id='{correct_id}' WHERE id='{old_id}';"))
                    # Update all business records
                    tables = ['customers', 'contacts', 'visit_records', 'tasks', 'check_ins', 'visit_plans', 'reports']
                    for table in tables:
                        db.execute(text(f"UPDATE {table} SET user_id='{correct_id}' WHERE user_id='{old_id}';"))
                else:
                    print(f"  User ID already correct: {correct_id}")
            else:
                print(f"  User {email} not found locally, skipping.")
        
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("✅ Identity Alignment Complete.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
