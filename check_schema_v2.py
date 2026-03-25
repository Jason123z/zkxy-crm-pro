import os
import httpx
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

# Try to get one customer to see its columns
endpoint = f"{url}/rest/v1/customers?select=*&limit=1"

try:
    with httpx.Client() as client:
        response = client.get(endpoint, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if data:
                print("Existing columns in customers:", list(data[0].keys()))
            else:
                print("No customers found, checking projects instead.")
                p_endpoint = f"{url}/rest/v1/projects?select=*&limit=1"
                p_response = client.get(p_endpoint, headers=headers)
                if p_response.status_code == 200:
                    p_data = p_response.json()
                    if p_data:
                        print("Existing columns in projects:", list(p_data[0].keys()))
        else:
            print(f"Failed to check schema: {response.status_code} {response.text}")
except Exception as e:
    print(f"Error: {e}")
