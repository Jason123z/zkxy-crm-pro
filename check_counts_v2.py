import httpx

url = 'https://uzlcidyvuifxbgzzkcwj.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU'

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

def check_counts():
    tables = ['customers', 'profiles', 'check_ins', 'reports']
    for t in tables:
        try:
            r = httpx.get(f"{url}/rest/v1/{t}?select=count", headers=headers)
            print(f"Table {t} count: {r.json()}")
        except Exception as e:
            print(f"Error {t}: {e}")

check_counts()
