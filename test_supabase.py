import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

tables = ['profiles', 'customers', 'contacts', 'visit_records', 'tasks', 'check_ins']

print("Testing Supabase connection and tables...")
for t in tables:
    url = f"{SUPABASE_URL}/rest/v1/{t}?select=id"
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Table '{t}': {len(data)} records found")
        if data:
            print(f"  Sample ID: {data[0]['id']}")
    else:
        print(f"Table '{t}': ERROR {response.status_code} - {response.text}")
