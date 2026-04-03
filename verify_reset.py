from db.mysql_client import SessionLocal
from db.models import User, Customer, Contact, VisitRecord, Task, SystemSetting

def verify():
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        customer_count = db.query(Customer).count()
        contact_count = db.query(Contact).count()
        visit_count = db.query(VisitRecord).count()
        task_count = db.query(Task).count()
        setting_count = db.query(SystemSetting).count()

        print(f"Users: {user_count} (Expected: 1 admin)")
        print(f"Customers: {customer_count} (Expected: 0)")
        print(f"Contacts: {contact_count} (Expected: 0)")
        print(f"Visit Records: {visit_count} (Expected: 0)")
        print(f"Tasks: {task_count} (Expected: 0)")
        print(f"System Settings: {setting_count} (Expected: >0)")

        if user_count == 1 and customer_count == 0 and setting_count > 0:
            print("\n✅ Verification PASSED: Database is reset and initialized correctly.")
        else:
            print("\n❌ Verification FAILED: Database state is not as expected.")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
