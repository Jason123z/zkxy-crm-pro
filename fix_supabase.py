import os

def setup_venv_fix():
    path = 'venv_fix/supabase'
    os.makedirs(path, exist_ok=True)
    
    init_content = """from postgrest import SyncPostgrestClient, AsyncPostgrestClient
from gotrue import SyncSupportedStorage, AsyncSupportedStorage
from realtime import RealtimeClient
from supabase_functions import FunctionsClient

class Client:
    def __init__(self, url, key, options=None):
        self.postgrest = SyncPostgrestClient(url + "/rest/v1", headers={"apikey": key, "Authorization": f"Bearer {key}"})
        self.auth = None # Gotrue needs more setup
        self.realtime = RealtimeClient(url + "/realtime/v1", key)
        self.functions = FunctionsClient(url + "/functions/v1", {"apikey": key, "Authorization": f"Bearer {key}"})
        self.storage = None # storage3 failed to install

def create_client(url, key, options=None):
    return Client(url, key, options)
"""
    
    with open(os.path.join(path, '__init__.py'), 'w') as f:
        f.write(init_content)
    print("Supabase shim created in venv_fix/supabase")

if __name__ == "__main__":
    setup_venv_fix()

