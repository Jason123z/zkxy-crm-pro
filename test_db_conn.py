import pymysql
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

mysql_url = os.getenv("MYSQL_URL")
print(f"Connecting to: {mysql_url}")

try:
    # We use sqlalchemy as it's used in the app
    engine = create_engine(mysql_url)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print(f"Success! Result: {result.fetchone()[0]}")
except Exception as e:
    print(f"Connection failed!")
    print(f"Error type: {type(e).__name__}")
    print(f"Error message: {str(e)}")
