import httpx

url = 'https://uzlcidyvuifxbgzzkcwj.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU'

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def check_all_profiles():
    try:
        r = httpx.get(f"{url}/rest/v1/profiles", headers=headers)
        data = r.json()
        print(f"Profiles found: {len(data)}")
        for p in data:
            print(f"ID: {p['id']}, Email: {p['email']}, Role: {p['role']}")
    except Exception as e:
        print(f"Error: {e}")

check_all_profiles()
