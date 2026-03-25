import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

try:
    # Try to fetch one customer to see the structure
    response = supabase.table("customers").select("*").limit(1).execute()
    if response.data:
        print("Columns in customers table:", response.data[0].keys())
    else:
        print("Customers table is empty, cannot check columns easily via select *")
except Exception as e:
    print("Error checking customers table:", e)

try:
    # Try to fetch one project to see the structure
    response = supabase.table("projects").select("*").limit(1).execute()
    if response.data:
        print("Columns in projects table:", response.data[0].keys())
    else:
        print("Projects table is empty.")
except Exception as e:
    print("Error checking projects table:", e)
