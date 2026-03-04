import os
try:
    from supabase import create_client, Client
except ImportError:
    print("Supabase library not found. Using Mock Client.")
    create_client = None
    Client = None

from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

class MockTable:
    def __init__(self, name):
        self.name = name
        self.is_single = False
    def insert(self, data):
        print(f"[MockDB] Insert into {self.name}: {data}")
        return self
    def select(self, *args, **kwargs):
        print(f"[MockDB] Select from {self.name}")
        return self
    def update(self, data):
        print(f"[MockDB] Update {self.name}: {data}")
        return self
    def eq(self, col, val):
        return self
    def single(self):
        self.is_single = True
        return self
    def order(self, *args, **kwargs):
        return self
    def execute(self):
        # Return dummy data structure matching Supabase response
        is_single_req = self.is_single
        table_name = self.name
        
        class Response:
            data = []
            count = 0
            
            if is_single_req:
                # Return a dict for single row queries (like profiles on login)
                data = {
                    "id": "mock-user-id",
                    "role": "citizen", 
                    "full_name": "Mock User", 
                    "department_id": None,
                    "email": "mock@example.com"
                }
            else:
                # Return a list for multiple row queries
                if table_name == 'departments':
                     data = [
                         {"id": 1, "name": "Roads"}, 
                         {"id": 2, "name": "Sanitation"},
                         {"id": 3, "name": "Health"}
                     ]
                elif table_name == 'complaints':
                     data = [
                         {
                             "id": 101, 
                             "title": "Mock Complaint 1", 
                             "description": "This is a test complaint in mock mode.", 
                             "status": "Pending", 
                             "created_at": "2023-10-27T10:00:00",
                             "departments": {"name": "Roads"},
                             "profiles": {"full_name": "Mock User", "email": "mock@example.com"}
                         }
                     ]
                else:
                    data = []

            # Add dummy user/session for Auth
            class User:
                id = "mock-user-id"
                email = "mock@example.com"
            user = User()
            
            class Session:
                access_token = "mock-token"
            session = Session()

        return Response()

class MockClient:
    def __init__(self, url, key):
        self.auth = self
    def table(self, name):
        return MockTable(name)
    def sign_up(self, credentials):
        print(f"[MockAuth] Sign up: {credentials.get('email')}")
        return MockTable("auth").execute()
    def sign_in_with_password(self, credentials):
        print(f"[MockAuth] Sign in: {credentials.get('email')}")
        return MockTable("auth").execute()

if not url or not key:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not found in environment variables.")

if create_client:
    try:
        supabase: Client = create_client(url, key)
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}. Using Mock Client.")
        supabase = MockClient(url, key)
else:
    supabase = MockClient(url, key)
