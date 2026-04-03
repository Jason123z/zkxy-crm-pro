"""
Migration: Add must_change_password column to users table
Run this script once to update existing databases.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db.mysql_client import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT COUNT(*) as cnt 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'users' 
              AND COLUMN_NAME = 'must_change_password'
        """))
        row = result.fetchone()
        if row[0] > 0:
            print("Column 'must_change_password' already exists. Skipping.")
            return

        # Add the column
        conn.execute(text("""
            ALTER TABLE users 
            ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE
        """))
        conn.commit()
        print("Successfully added 'must_change_password' column to users table.")

if __name__ == "__main__":
    migrate()
