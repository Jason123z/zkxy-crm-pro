import os
from dotenv import load_dotenv
import httpx

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def check_table(name):
    try:
        r = httpx.get(f"{url}/rest/v1/{name}?select=count", headers=headers, params={"select": "count"})
        print(f"Table {name} count: {r.text}")
    except Exception as e:
        print(f"Error checking {name}: {e}")

check_table("customers")
check_table("profiles")
check_table("check_ins")
check_table("reports")
