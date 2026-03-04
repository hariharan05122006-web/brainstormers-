from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
import os
from supabase_client import supabase

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "supersecretkey")
CORS(app)

# --- API Routes ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    role = data.get('role', 'citizen') # Default to citizen
    department_id = data.get('department_id') # For officers

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # 1. Sign up user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        user = auth_response.user
        if not user:
             return jsonify({"error": "Registration failed"}), 400

        # 2. Add to profiles table
        profile_data = {
            "id": user.id,
            "email": email,
            "full_name": full_name,
            "role": role
        }
        
        if role == 'officer' and department_id:
            profile_data['department_id'] = department_id
            
        supabase.table('profiles').insert(profile_data).execute()

        return jsonify({"message": "Registration successful", "user": {"id": user.id, "email": user.email, "role": role}}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # 1. Sign in with Supabase Auth
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        user = auth_response.user
        session_data = auth_response.session
        
        if not user:
            return jsonify({"error": "Login failed"}), 401

        # 2. Fetch user role from profiles
        profile_response = supabase.table('profiles').select('role, department_id, full_name').eq('id', user.id).single().execute()
        profile = profile_response.data
        
        role = profile.get('role', 'citizen')

        return jsonify({
            "message": "Login successful",
            "token": session_data.access_token,
            "user": {
                "id": user.id,
                "email": email,
                "role": role,
                "full_name": profile.get("full_name"),
                "department_id": profile.get("department_id")
            }
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 401


# --- Department Routes ---

@app.route('/api/departments', methods=['GET', 'POST'])
def departments():
    if request.method == 'GET':
        response = supabase.table('departments').select('*').execute()
        return jsonify(response.data)
    
    # Admin only - strictly this should be protected, but for demo we trust the client logic somewhat or session
    # In real app: verify JWT token from header
    data = request.json
    try:
        response = supabase.table('departments').insert({'name': data.get('name')}).execute()
        return jsonify({"message": "Department created", "data": response.data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- Complaint Routes ---

@app.route('/api/complaints', methods=['GET', 'POST'])
def complaints():
    if request.method == 'POST':
        data = request.json
        user_id = data.get('user_id')
        department_id = data.get('department_id')
        title = data.get('title')
        description = data.get('description')

        if not all([user_id, department_id, title, description]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            complaint_data = {
                "user_id": user_id,
                "department_id": department_id,
                "title": title,
                "description": description,
                "status": "Pending"
            }
            response = supabase.table('complaints').insert(complaint_data).execute()
            return jsonify({"message": "Complaint registered", "data": response.data}), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # GET - Filter based on params
    user_id = request.args.get('user_id')
    role = request.args.get('role')
    department_id = request.args.get('department_id') # For officers

    query = supabase.table('complaints').select('*, departments(name), profiles(full_name, email)')

    if role == 'citizen' and user_id:
        query = query.eq('user_id', user_id)
    elif role == 'officer' and department_id:
        query = query.eq('department_id', department_id)
    # Admin sees all, so no filter if role=admin

    try:
        response = query.order('created_at', desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/complaints/<int:id>', methods=['PUT'])
def update_complaint(id):
    data = request.json
    status = data.get('status')
    comment = data.get('comment')
    updated_by = data.get('updated_by')

    try:
        # 1. Update Complaint Status
        supabase.table('complaints').update({'status': status}).eq('id', id).execute()

        # 2. Add History/Log
        if comment:
            supabase.table('complaint_updates').insert({
                'complaint_id': id,
                'updated_by': updated_by,
                'comment': comment,
                'status': status
            }).execute()

        return jsonify({"message": "Complaint updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Stats Route ---
@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        # Simple counts. For strictness we might want specialized RPC or multiple queries.
        # Supabase-py doesn't have effortless 'count' without fetching sometimes depending on version,
        # but select(count='exact', head=True) works.
        
        total_complaints = supabase.table('complaints').select('*', count='exact', head=True).execute().count
        resolved_complaints = supabase.table('complaints').select('*', count='exact', head=True).eq('status', 'Resolved').execute().count
        pending_complaints = supabase.table('complaints').select('*', count='exact', head=True).eq('status', 'Pending').execute().count
        
        return jsonify({
            "total": total_complaints,
            "resolved": resolved_complaints,
            "pending": pending_complaints
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return redirect(url_for('login_page'))

# --- Auth Pages ---
@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

# --- Dashboards ---
@app.route('/dashboard/citizen')
def citizen_dashboard():
    # In a real app, verify session/token here
    return render_template('citizen_dashboard.html')

@app.route('/dashboard/officer')
def officer_dashboard():
    return render_template('officer_dashboard.html')

@app.route('/dashboard/admin')
def admin_dashboard():
    return render_template('admin_dashboard.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
