import httpx

url = 'https://uzlcidyvuifxbgzzkcwj.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU'

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def find_orphaned_user_ids():
    try:
        # Get all profiles
        r_p = httpx.get(f"{url}/rest/v1/profiles", headers=headers)
        profiles = r_p.json()
        profile_ids = {p['id'] for p in profiles}
        print(f"Profiles found: {len(profile_ids)}")
        for p in profiles:
            print(f"  - {p['email']} ({p['id']})")

        # Get unique user_id from customers
        r_c = httpx.get(f"{url}/rest/v1/customers?select=user_id", headers=headers)
        customers = r_c.json()
        customer_user_ids = {c['user_id'] for c in customers}
        print(f"\nUnique user_ids in customers: {len(customer_user_ids)}")

        orphaned = customer_user_ids - profile_ids
        if orphaned:
            print("\nOrphaned user_ids (in customers but not in profiles):")
            for oid in orphaned:
                # Try to find more info in visit_records or reports if possible
                print(f"  - {oid}")
        else:
            print("\nNo orphaned user_ids found in customers.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_orphaned_user_ids()
