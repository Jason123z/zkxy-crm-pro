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

def check_admin():
    try:
        # Since RLS is disabled on profiles (according to my last script instructions)
        # We should be able to see it with the anon key
        r = httpx.get(f"{url}/rest/v1/profiles?email=eq.admin@admin.com", headers=headers)
        print(f"Admin profile search result: {r.text}")
    except Exception as e:
        print(f"Error checking admin: {e}")

check_admin()
