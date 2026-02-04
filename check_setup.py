from supabase_client import supabase

def check_setup():
    print("Checking Supabase Connection...")
    try:
        # Check Departments
        response = supabase.table('departments').select('*').execute()
        depts = response.data
        print(f"Connection Successful! Found {len(depts)} departments.")
        for d in depts:
            print(f"- {d['name']}")
            
        print("\nIf you see the departments above, your database setup is correct.")
        print("You can now run 'python app.py' and register a user to start.")
        
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        print("Please check your .env file and ensure you ran the database/setup.sql script.")

if __name__ == "__main__":
    check_setup()
