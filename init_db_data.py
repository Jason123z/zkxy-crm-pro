from db.mysql_client import SessionLocal
from db.models import User, Profile, SystemSetting
from core.auth import get_password_hash
import uuid

def init_db():
    db = SessionLocal()
    try:
        # 1. Create default admin if not exists
        admin_username = "admin"
        admin_user = db.query(User).filter(User.username == admin_username).first()
        
        if not admin_user:
            print(f"Creating default admin: {admin_username}")
            admin_id = str(uuid.uuid4())
            new_admin = User(
                id=admin_id,
                username=admin_username,
                hashed_password=get_password_hash("123456"),
                full_name="超级管理员",
                role="admin"
            )
            db.add(new_admin)
            db.commit() # Flush and commit user first to satisfy Profile FK

            # Create profile for admin
            new_profile = Profile(
                id=admin_id,
                name="超级管理员",
                role="admin",
                email=admin_username,
                department="管理层"
            )
            db.add(new_profile)
            db.commit()
            print("Admin created successfully.")
        else:
            print(f"Admin {admin_username} already exists.")

        # 2. Preset 3 Sales Accounts
        sales_presets = [
            ("sales01", "销售员01"),
            ("sales02", "销售员02"),
            ("sales03", "销售员03"),
        ]
        
        for username, full_name in sales_presets:
            existing_sales = db.query(User).filter(User.username == username).first()
            if not existing_sales:
                print(f"Creating preset sales account: {username}")
                u_id = str(uuid.uuid4())
                new_sales = User(
                    id=u_id,
                    username=username,
                    hashed_password=get_password_hash("123456"),
                    full_name=full_name,
                    role="销售人员",
                    must_change_password=True
                )
                db.add(new_sales)
                db.commit()

                new_sales_profile = Profile(
                    id=u_id,
                    name=full_name,
                    role="销售人员",
                    email=username,
                    department="销售部"
                )
                db.add(new_sales_profile)
                db.commit()
            else:
                print(f"Sales account {username} already exists.")

        # 3. Populate default system settings if table is empty
        if db.query(SystemSetting).count() == 0:
            print("Populating default system settings...")
            defaults = [
                # Sales Stages
                ("sales_stage", "线索", "线索", 1),
                ("sales_stage", "初步拜访", "初步拜访", 2),
                ("sales_stage", "需求调研", "需求调研", 3),
                ("sales_stage", "方案/询价", "方案/询价", 4),
                ("sales_stage", "商务谈判", "商务谈判", 5),
                ("sales_stage", "赢单/合同", "赢单/合同", 6),
                ("sales_stage", "输单", "输单", 7),
                
                # Industries
                ("industry", "制造业", "制造业", 1),
                ("industry", "互联网/软件", "互联网/软件", 2),
                ("industry", "医疗/健康", "医疗/健康", 3),
                ("industry", "金融服务", "金融服务", 4),
                ("industry", "教育培训", "教育培训", 5),
                ("industry", "房地产", "房地产", 6),
                
                # Visit Types
                ("visit_type", "电话沟通", "电话沟通", 1),
                ("visit_type", "现场拜访", "现场拜访", 2),
                ("visit_type", "方案演示", "方案演示", 3),
                ("visit_type", "商务宴请", "商务宴请", 4),
                
                # Customer Sources
                ("customer_source", "主动开发", "主动开发", 1),
                ("customer_source", "转介绍", "转介绍", 2),
                ("customer_source", "展会/活动", "展会/活动", 3),
                ("customer_source", "官网咨询", "官网咨询", 4),
            ]
            
            for cat, label, val, order in defaults:
                db.add(SystemSetting(category=cat, label=label, value=val, sort_order=order))
            
            db.commit()
            print("Default settings populated successfully.")
        else:
            print("System settings already present, skipping population.")

    except Exception as e:
        print(f"Error during initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
