from postgrest import SyncPostgrestClient, AsyncPostgrestClient
from gotrue import SyncSupportedStorage, AsyncSupportedStorage
try:
    from realtime import RealtimeClient
except ImportError:
    from realtime import SyncRealtimeClient as RealtimeClient

try:
    from supabase_functions import FunctionsClient
except ImportError:
    from supabase_functions import SyncFunctionsClient as FunctionsClient


class Client:
    def __init__(self, url, key, options=None):
        self.postgrest = SyncPostgrestClient(url + "/rest/v1", headers={"apikey": key, "Authorization": f"Bearer {key}"})
        self.auth = None # Gotrue needs more setup
        self.realtime = RealtimeClient(url + "/realtime/v1", key)
        self.functions = FunctionsClient(url + "/functions/v1", {"apikey": key, "Authorization": f"Bearer {key}"})
        self.storage = None # storage3 failed to install

def create_client(url, key, options=None):
    return Client(url, key, options)

