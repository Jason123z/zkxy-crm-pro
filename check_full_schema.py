import os
import httpx
from dotenv import load_dotenv
import json

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}"
}

endpoint = f"{url}/rest/v1/"

try:
    with httpx.Client() as client:
        response = client.get(endpoint, headers=headers)
        if response.status_code == 200:
            spec = response.json()
            # Look for customers table
            customers_def = spec.get("definitions", {}).get("customers", {})
            if customers_def:
                print("Columns in 'customers' table:")
                for prop_name in customers_def.get("properties", {}).keys():
                    print(f" - {prop_name}")
            else:
                print("'customers' definition not found in OpenAPI spec.")
                
            projects_def = spec.get("definitions", {}).get("projects", {})
            if projects_def:
                print("\nColumns in 'projects' table:")
                for prop_name in projects_def.get("properties", {}).keys():
                    print(f" - {prop_name}")
        else:
            print(f"Failed to fetch OAS: {response.status_code} {response.text}")
except Exception as e:
    print(f"Error: {e}")
