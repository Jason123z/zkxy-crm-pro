from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
import uuid
from db.mysql_client import get_db
from db.models import User, Profile, Customer, Project, Report, ClientProgress, CheckIn, SystemSetting
from core.auth import get_current_user, get_password_hash
from schemas.auth import UserResponse, SalesAccountCreate, SalesAccountUpdate, SalesAccountResponse
from schemas.customer import VisitRecordResponse
from schemas.admin import BulkTransferRequest, BulkReleaseRequest

router = APIRouter()

DEFAULT_PASSWORD = "123456"

def check_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

# ─────────────────────────────────────────────
# Sales Account Management (admin only)
# ─────────────────────────────────────────────

@router.get("/sales-accounts", response_model=List[SalesAccountResponse])
def list_sales_accounts(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    return db.query(User).filter(User.role == "销售人员").order_by(User.created_at.asc()).all()


@router.post("/sales-accounts", response_model=SalesAccountResponse)
def create_sales_account(body: SalesAccountCreate, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="该账号名已存在")

    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        username=body.username,
        hashed_password=get_password_hash(DEFAULT_PASSWORD),
        full_name=body.full_name or body.username,
        role="销售人员",
        is_active=True,
        must_change_password=True,
    )
    db.add(new_user)

    new_profile = Profile(
        id=user_id,
        name=body.full_name or body.username,
        email=body.username,
        role="销售人员",
        avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=" + body.username,
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.put("/sales-accounts/{user_id}", response_model=SalesAccountResponse)
def update_sales_account(user_id: str, body: SalesAccountUpdate, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    user = db.query(User).filter(User.id == user_id, User.role == "销售人员").first()
    if not user:
        raise HTTPException(status_code=404, detail="账号不存在")

    if body.username is not None:
        conflict = db.query(User).filter(User.username == body.username, User.id != user_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="该账号名已被其他人占用")
        user.username = body.username
        # Keep profile email in sync
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if profile:
            profile.email = body.username

    if body.full_name is not None:
        user.full_name = body.full_name
        profile = db.query(Profile).filter(Profile.id == user_id).first()
        if profile:
            profile.name = body.full_name

    if body.is_active is not None:
        user.is_active = body.is_active

    db.commit()
    db.refresh(user)
    return user


@router.delete("/sales-accounts/{user_id}")
def delete_sales_account(user_id: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    user = db.query(User).filter(User.id == user_id, User.role == "销售人员").first()
    if not user:
        raise HTTPException(status_code=404, detail="账号不存在")
    db.delete(user)
    db.commit()
    return {"success": True}


@router.post("/sales-accounts/{user_id}/reset-password")
def reset_sales_account_password(user_id: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    user = db.query(User).filter(User.id == user_id, User.role == "销售人员").first()
    if not user:
        raise HTTPException(status_code=404, detail="账号不存在")
    user.hashed_password = get_password_hash(DEFAULT_PASSWORD)
    user.must_change_password = True
    db.commit()
    return {"success": True, "message": f"密码已重置为默认密码 {DEFAULT_PASSWORD}"}

# ─────────────────────────────────────────────
# Other Admin Endpoints
# ─────────────────────────────────────────────

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    total = db.query(Customer).count()
    return {
        "total_customers": total,
        "totalCustomers": total,
        "customers_a": db.query(Customer).filter(Customer.level == 'A').count(),
        "customers_b": db.query(Customer).filter(Customer.level == 'B').count(),
        "customers_c": db.query(Customer).filter(Customer.level == 'C').count(),
        "customers_d": db.query(Customer).filter(Customer.level == 'D').count(),
        "total_projects": db.query(Project).count(),
        "total_check_ins": db.query(CheckIn).count(),
    }

from sqlalchemy import extract, func, text, or_
from datetime import datetime

@router.get("/funnel-stats")
def get_funnel_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from db.models import CustomerHistory, SystemSetting, Customer
    
    now = datetime.now()
    current_month = now.month
    current_year = now.year
    
    # We use func.month and func.year as they are very reliable across DBs in SQLAlchemy
    # Base query for this month's history
    history_query = db.query(CustomerHistory).options(
        joinedload(CustomerHistory.customer).joinedload(Customer.user)
    ).filter(
        func.month(CustomerHistory.created_at) == current_month,
        func.year(CustomerHistory.created_at) == current_year
    )
    
    # If not admin, restrict history to their own customers
    if current_user.role != "admin":
        history_query = history_query.join(Customer).filter(Customer.user_id == current_user.id)
    
    history = history_query.all()
    
    # Fetch stages to determine order
    stages = db.query(SystemSetting).filter(SystemSetting.category == 'sales_stage').order_by(SystemSetting.sort_order).all()
    stage_order = {s.label: index for index, s in enumerate(stages)}
    
    if not stage_order:
        # Fallback default order if settings table is empty
        default_stages = ['线索', '初步拜访', '需求调研', '方案/询价', '明确预算', '招标采购', '合同签约']
        stage_order = {stage: index for index, stage in enumerate(default_stages)}
    
    level_changes = []
    advanced_count = 0
    backward_count = 0
    
    # Use func.month/year here too
    cust_query = db.query(Customer).options(joinedload(Customer.user)).filter(
        Customer.level == 'B',
        func.month(Customer.created_at) == current_month,
        func.year(Customer.created_at) == current_year
    )
    if current_user.role != "admin":
        cust_query = cust_query.filter(Customer.user_id == current_user.id)
    new_b_count = cust_query.count()
    
    for record in history:
        if record.field_name == 'level':
            level_changes.append({
                "customerId": record.customer_id,
                "customerName": record.customer.name if record.customer else "Unknown",
                "oldLevel": record.old_value,
                "newLevel": record.new_value,
                "date": record.created_at
            })
        elif record.field_name == 'status':
            old_idx = stage_order.get(record.old_value, -1)
            new_idx = stage_order.get(record.new_value, -1)
            
            if old_idx != -1 and new_idx != -1:
                if new_idx > old_idx:
                    advanced_count += 1
                elif new_idx < old_idx:
                    backward_count += 1
    
    # Stagnant customers: no status change in 14 days, not in final stage
    # If status_updated_at is null, we fallback to created_at
    if stage_order:
        final_stage = list(stage_order.keys())[-1]
    else:
        final_stage = '合同签约'
        
    stagnant_query = db.query(Customer).options(joinedload(Customer.user)).filter(
        Customer.status != final_stage,
        text("DATEDIFF(CURRENT_TIMESTAMP, COALESCE(customers.status_updated_at, customers.created_at)) > 14")
    )
    if current_user.role != "admin":
        stagnant_query = stagnant_query.filter(Customer.user_id == current_user.id)
    stagnant_customers = stagnant_query.all()
    stagnant_count = len(stagnant_customers)
    
    # Organize history for advanced/backward lists
    advanced_details = []
    backward_details = []
    
    # We need to collect the details from history while processing
    for record in history:
        entry = {
            "customerId": record.customer_id,
            "customerName": record.customer.name if record.customer else "Unknown",
            "oldValue": record.old_value,
            "newValue": record.new_value,
            "date": record.created_at,
            "salesperson": record.customer.user.full_name if record.customer and record.customer.user else "Unknown"
        }
        
        if record.field_name == 'status':
            old_idx = stage_order.get(record.old_value, -1)
            new_idx = stage_order.get(record.new_value, -1)
            
            if old_idx != -1 and new_idx != -1:
                # To avoid duplicate customers in the detail list, we could use a set, 
                # but managers usually want to see every move.
                if new_idx > old_idx:
                    advanced_details.append(entry)
                elif new_idx < old_idx:
                    backward_details.append(entry)

    # Format result
    return {
        "newBThisMonth": new_b_count,
        "newBDetails": [
            {
                "id": c.id,
                "name": c.name,
                "salesperson": c.user.full_name if c.user else "Unknown",
                "createdAt": c.created_at
            } for c in cust_query.all()
        ],
        "advancedCount": len(advanced_details),
        "advancedDetails": advanced_details,
        "backwardCount": len(backward_details),
        "backwardDetails": backward_details,
        "stagnantCount": stagnant_count,
        "stagnantDetails": [
            {
                "id": c.id,
                "name": c.name,
                "salesperson": c.user.full_name if c.user else "Unknown",
                "status": c.status,
                "lastUpdate": c.status_updated_at or c.created_at
            } for c in stagnant_customers
        ],
        "recentHistory": [{
            "id": r.id,
            "customerId": r.customer_id,
            "customerName": r.customer.name if r.customer else "Unknown",
            "fieldName": r.field_name,
            "oldValue": r.old_value,
            "newValue": r.new_value,
            "date": r.created_at
        } for r in sorted(history, key=lambda x: x.created_at, reverse=True)[:20]]
    }

@router.get("/projects")
def get_all_projects(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    return db.query(Project).order_by(Project.created_at.desc()).all()

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    profiles = db.query(Profile).all()
    # Map to list of dicts for easier frontend consumption
    return [
        {
            "id": p.id,
            "name": p.name,
            "role": p.role,
            "employeeId": p.employee_id,
            "avatar": p.avatar,
            "phone": p.phone,
            "email": p.email,
            "department": p.department
        } for p in profiles
    ]

@router.get("/customers")
def get_all_customers(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    # Joined query to get owner name for each customer
    # Profile might be missing if user was created but profile failed, so using outer join
    results = db.query(Customer, Profile.name).outerjoin(
        Profile, Customer.user_id == Profile.id
    ).order_by(Customer.created_at.desc()).all()
    
    customers = []
    for c, owner_name in results:
        c_dict = {column.name: getattr(c, column.name) for column in c.__table__.columns}
        c_dict["owner_name"] = owner_name or "公海/未分配"
        customers.append(c_dict)
    return customers

@router.post("/customers/transfer")
def bulk_transfer_customers(body: BulkTransferRequest, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    if not body.customer_ids:
        return {"success": True, "count": 0}
        
    db.query(Customer).filter(Customer.id.in_(body.customer_ids)).update(
        {Customer.user_id: body.target_user_id},
        synchronize_session=False
    )
    db.commit()
    return {"success": True, "count": len(body.customer_ids)}

@router.post("/customers/release")
def bulk_release_customers(body: BulkReleaseRequest, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    if not body.customer_ids:
        return {"success": True, "count": 0}
        
    db.query(Customer).filter(Customer.id.in_(body.customer_ids)).update(
        {Customer.user_id: None},
        synchronize_session=False
    )
    db.commit()
    return {"success": True, "count": len(body.customer_ids)}

@router.get("/customers/{customer_id}")
def get_customer_detail(customer_id: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Also fetch owner profile
    owner_profile = db.query(Profile).filter(Profile.id == customer.user_id).first()
    
    return {
        "customer": customer,
        "owner_name": owner_profile.name if owner_profile else "未知人员"
    }

@router.get("/customers/{customer_id}/contacts")
def get_customer_contacts(customer_id: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    from db.models import Contact
    return db.query(Contact).filter(Contact.customer_id == customer_id).all()

@router.get("/customers/{customer_id}/visits", response_model=List[VisitRecordResponse])
def get_customer_visits(customer_id: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    from db.models import VisitRecord, User
    results = db.query(VisitRecord, User.full_name).join(
        User, VisitRecord.user_id == User.id
    ).filter(
        VisitRecord.customer_id == customer_id
    ).order_by(VisitRecord.date.desc()).all()
    
    visits = []
    for v, full_name in results:
        # We manually attach salesperson_name so the schema can pick it up
        v_dict = {column.name: getattr(v, column.name) for column in v.__table__.columns}
        v_dict["salesperson_name"] = full_name
        visits.append(v_dict)
    return visits

@router.get("/customers/{customer_id}/tasks")
def get_customer_tasks(customer_id: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    from db.models import Task
    return db.query(Task).filter(Task.customer_id == customer_id).order_by(Task.created_at.desc()).all()

@router.get("/reports")
def get_all_reports(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        progress = db.query(ClientProgress).filter(ClientProgress.report_id == r.id).all()
        report_data = {
            "id": r.id,
            "userId": r.user_id,
            "type": r.type,
            "date": r.date,
            "summary": r.summary,
            "nextPlan": r.next_plan,
            "createdAt": r.created_at,
            "clientProgress": progress
        }
        results.append(report_data)
    return results

@router.get("/checkins")
def get_all_checkins(db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    return db.query(CheckIn).order_by(CheckIn.created_at.desc()).all()

from schemas.system import SystemSettingCreate, SystemSettingUpdate, SystemSettingResponse

@router.get("/settings", response_model=List[SystemSettingResponse])
def get_settings(category: str, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    return db.query(SystemSetting).filter(SystemSetting.category == category).order_by(SystemSetting.sort_order.asc()).all()

@router.post("/settings", response_model=SystemSettingResponse)
def add_setting(setting_in: SystemSettingCreate, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    # Fallback value if missing
    if not setting_in.value:
        setting_in.value = setting_in.label
        
    new_setting = SystemSetting(**setting_in.model_dump())
    db.add(new_setting)
    db.commit()
    db.refresh(new_setting)
    return new_setting

@router.put("/settings/{setting_id}", response_model=SystemSettingResponse)
def update_setting(setting_id: int, updates: SystemSettingUpdate, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    setting = db.query(SystemSetting).filter(SystemSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(setting, key, value)
    
    db.commit()
    db.refresh(setting)
    return setting

@router.delete("/settings/{setting_id}")
def delete_setting(setting_id: int, db: Session = Depends(get_db), _admin: User = Depends(check_admin)):
    setting = db.query(SystemSetting).filter(SystemSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    db.delete(setting)
    db.commit()
    return {"success": True}
