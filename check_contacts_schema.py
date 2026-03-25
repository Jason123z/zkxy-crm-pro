import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

async def check_columns():
    try:
        # Try to insert a dummy record with decision_role to see if it works
        # or just try to select and see the keys
        res = supabase.from_not_exists("contacts").select("*").limit(1).execute()
        # Wait, from_not_exists is not a real method, I just want to see what happens
        # if I select all columns.
        res = supabase.from_("contacts").select("*").limit(1).execute()
        if res.data:
            print("Columns in contacts table:", res.data[0].keys())
        else:
            print("No data in contacts table to check columns.")
            
        # Try to select ONLY decision_role
        try:
            res_dr = supabase.from_("contacts").select("decision_role").limit(1).execute()
            print("Successfully selected decision_role column.")
        except Exception as e:
            print(f"Error selecting decision_role: {e}")

    except Exception as e:
        print(f"General error: {e}")

if __name__ == "__main__":
    asyncio.run(check_columns())
