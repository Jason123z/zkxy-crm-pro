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

def check_duplicates():
    try:
        r = httpx.get(f"{url}/rest/v1/profiles?email=eq.admin@admin.com", headers=headers)
        data = r.json()
        print(f"Profiles found: {len(data)}")
        for p in data:
            print(f"ID: {p['id']}, Role: {p['role']}")
    except Exception as e:
        print(f"Error: {e}")

check_duplicates()
