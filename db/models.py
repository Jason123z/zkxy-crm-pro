from sqlalchemy import Column, String, Boolean, DateTime, DECIMAL, Text, ForeignKey, TIMESTAMP, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.mysql_client import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True)
    username = Column("email", String(255), unique=True, nullable=False)  # stored as 'email' in DB
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), default='销售人员')
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(255))
    role = Column(String(255))
    employee_id = Column(String(50))
    avatar = Column(Text)
    phone = Column(String(50))
    email = Column(String(255))
    department = Column(String(255))
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

class Customer(Base):
    __tablename__ = "customers"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    level = Column(String(50), nullable=False)
    industry = Column(String(255))
    size = Column(String(255))
    address = Column(Text)
    budget_level = Column(String(255))
    budget_amount = Column(DECIMAL(15, 2))
    
    # Newly added fields during Project to Customer merge
    status = Column(String(100), default='线索')
    product = Column(String(255))
    source = Column(String(255))
    description = Column(Text)
    concerns = Column(Text)
    solution = Column(Text)
    competitors = Column(Text)
    estimated_purchase_time = Column(String(255))
    estimated_purchase_amount = Column(DECIMAL(15, 2))
    last_follow_up = Column(String(100))
    status_updated_at = Column(TIMESTAMP, server_default=func.current_timestamp())

    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relationships
    user = relationship("User", backref="customers")

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    status = Column(String(100))
    product = Column(String(255))
    budget_level = Column(String(255))
    budget_amount = Column(DECIMAL(15, 2))
    description = Column(Text)
    competitors = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

class Contact(Base):
    __tablename__ = "contacts"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    role = Column(String(255))
    decision_role = Column(String(100))
    is_key = Column(Boolean, default=False)
    phone = Column(String(50))
    email = Column(String(255))
    avatar = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

class VisitRecord(Base):
    __tablename__ = "visit_records"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"))
    type = Column(String(100))
    title = Column(String(255))
    date = Column(String(50))
    content = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    # Relationships
    user = relationship("User", backref="visit_records")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    deadline = Column(String(100))
    status = Column(String(50), default='pending')
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

class CheckIn(Base):
    __tablename__ = "check_ins"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    customer = Column(String(255), nullable=False)
    type = Column(String(100))
    time = Column(String(50))
    date = Column(String(50))
    location = Column(Text)
    notes = Column(Text)
    photo = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

class VisitPlan(Base):
    __tablename__ = "visit_plans"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    customer = Column(String(255), nullable=False)
    time = Column(String(50))
    date = Column(String(50))
    type = Column(String(100))
    completed = Column(Boolean, default=False)
    address = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

class Report(Base):
    __tablename__ = "reports"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    date = Column(String(100), nullable=False)
    summary = Column(Text)
    next_plan = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

class ClientProgress(Base):
    __tablename__ = "client_progress"
    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_id = Column(String(36), ForeignKey("reports.id", ondelete="CASCADE"))
    customer_id = Column(String(255))
    customer_name = Column(String(255))
    status = Column(String(100))
    progress = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())

class SystemSetting(Base):
    __tablename__ = "system_settings"
    id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(100), nullable=False)
    label = Column(String(255), nullable=False)
    value = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp())

class CustomerHistory(Base):
    __tablename__ = "customer_history"
    id = Column(String(36), primary_key=True)
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(50), nullable=False) # 'level' or 'status'
    old_value = Column(String(100))
    new_value = Column(String(100))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    
    customer = relationship("Customer", backref="history")
