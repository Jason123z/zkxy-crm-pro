import httpx

url = 'https://uzlcidyvuifxbgzzkcwj.supabase.co'
key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6bGNpZHl2dWlmeGJnenprY3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNjc0NDQsImV4cCI6MjA4ODg0MzQ0NH0.v44eWAWu1s53w7HEy_0DPPCtB1bHW3iiSYRemHWxiRU'

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def restore_profile():
    user_id = "05307042-70ae-458a-9f09-b776e69e553b"
    email = "785539123@qq.com"
    
    profile_data = {
        "id": user_id,
        "email": email,
        "name": "785539123@qq.com",
        "role": "销售人员",
        "avatar": "https://picsum.photos/seed/salesman/200/200",
        "department": "销售部"
    }
    
    try:
        r = httpx.post(f"{url}/rest/v1/profiles", headers=headers, json=profile_data)
        if r.status_code == 201:
            print(f"Successfully restored profile for {email}")
            print(r.json())
        else:
            print(f"Failed to restore profile. Status code: {r.status_code}")
            print(r.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    restore_profile()
