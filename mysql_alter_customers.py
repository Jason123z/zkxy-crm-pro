import sqlalchemy as sa
from sqlalchemy import text
from db.mysql_client import SessionLocal

def main():
    print("🚀 Starting MySQL Customers schema upgrade...")
    db = SessionLocal()
    
    commands = [
        "ALTER TABLE customers ADD COLUMN status VARCHAR(100) DEFAULT '线索';",
        "ALTER TABLE customers ADD COLUMN product VARCHAR(255);",
        "ALTER TABLE customers ADD COLUMN description TEXT;",
        "ALTER TABLE customers ADD COLUMN estimated_purchase_time VARCHAR(255);",
        "ALTER TABLE customers ADD COLUMN estimated_purchase_amount DECIMAL(15, 2);",
        "ALTER TABLE customers ADD COLUMN concerns TEXT;",
        "ALTER TABLE customers ADD COLUMN solution TEXT;",
        "ALTER TABLE customers ADD COLUMN competitors TEXT;",
        "ALTER TABLE customers ADD COLUMN source VARCHAR(255);",
        "ALTER TABLE customers ADD COLUMN last_follow_up VARCHAR(100);",
        "ALTER TABLE customers ADD COLUMN status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
    ]
    
    for cmd in commands:
        col_name = cmd.split("ADD COLUMN ")[1].split(" ")[0]
        try:
            db.execute(text(cmd))
            print(f"✅ Added {col_name} successfully.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print(f"ℹ️ Column {col_name} already exists.")
            else:
                print(f"❌ Error adding {col_name}: {e}")
                
    db.commit()
    print("✅ Customers table schema upgraded.")

if __name__ == "__main__":
    main()
