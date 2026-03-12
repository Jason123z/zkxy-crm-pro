import httpx
from ..core.config import settings

class SimpleSupabaseClient:
    def __init__(self, url: str, key: str, token: str = None):
        print(f"DEBUG: Initializing Supabase Client - URL: {url}, Key: {key[:10]}...{key[-5:] if key else ''}, Token: {token[:10] if token else 'None'}...")
        self.url = url
        self.key = key
        self.token = token
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.token if self.token else self.key}",
            "Content-Type": "application/json"
        }

    def table(self, table_name: str):
        return TableQuery(self, table_name)

class TableQuery:
    def __init__(self, client: SimpleSupabaseClient, table_name: str):
        self.client = client
        self.table_name = table_name
        self.endpoint = f"{client.url}/rest/v1/{table_name}"
        self.query_params = {}
        self._order = []

    def select(self, columns: str = "*"):
        self.query_params["select"] = columns
        return self

    def eq(self, column: str, value: str):
        self.query_params[column] = f"eq.{value}"
        return self

    def order(self, column: str, desc: bool = False):
        self._order.append(f"{column}.{'desc' if desc else 'asc'}")
        return self

    def insert(self, data: dict):
        self._action = "POST"
        self._data = data
        return self

    def update(self, data: dict):
        self._action = "PATCH"
        self._data = data
        return self

    def delete(self):
        self._action = "DELETE"
        return self

    def execute(self):
        if self._order:
            self.query_params["order"] = ",".join(self._order)
        
        url = self.endpoint
        headers = dict(self.client.headers)
        
        action = getattr(self, "_action", "GET")
        if action == "PATCH" or action == "DELETE":
            # For update and delete, prefer token or allow returning representation
            headers["Prefer"] = "return=representation"
        elif action == "POST":
            headers["Prefer"] = "return=representation"

        try:
            with httpx.Client() as client:
                if action == "GET":
                    response = client.get(url, params=self.query_params, headers=headers)
                elif action == "POST":
                    response = client.post(url, json=self._data, headers=headers)
                elif action == "PATCH":
                    response = client.patch(url, params=self.query_params, json=self._data, headers=headers)
                elif action == "DELETE":
                    response = client.delete(url, params=self.query_params, headers=headers)
                
                if response.status_code >= 400:
                    print(f"DEBUG: Supabase Request Failed!")
                    print(f"DEBUG: URL: {url}")
                    print(f"DEBUG: Status: {response.status_code}")
                    print(f"DEBUG: Response Body: {response.text}")
                
                response.raise_for_status()
                
                # Mock supabase response object
                class SupabaseResponse:
                    def __init__(self, data):
                        self.data = data
                
                return SupabaseResponse(response.json() if response.content else [])
        except Exception as e:
            print(f"DEBUG: Exception in Supabase Execution: {str(e)}")
            raise e


def get_db(token: str = None) -> SimpleSupabaseClient:
    return SimpleSupabaseClient(settings.SUPABASE_URL, settings.SUPABASE_KEY, token)

# 默认全局 client (用于无鉴权或系统操作)
db_client = get_db()
