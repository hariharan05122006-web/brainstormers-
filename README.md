# Municipality Complaint Registration System

A role-based web application for managing municipal complaints, built with Flask and Supabase.

## Features
- **Roles**: Citizen, Department Officer, Admin.
- **Citizen**: Register/Login, Post Complaints, View History.
- **Officer**: View Assigned Complaints, Update Status (Pending -> In Progress -> Resolved).
- **Admin**: View Dashboard Stats, View All Complaints, Manage Departments.
- **Tech Stack**: Python (Flask), Vanilla JS/CSS, Supabase (PostgreSQL + Auth).

## Setup Instructions

### 1. Prerequisites
- Python 3.8+
- A Supabase account (free tier works great).

### 2. Supabase Setup
1. Create a new project in Supabase.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `database/setup.sql` from this project and copy its content.
4. Run the SQL script to create tables (profiles, departments, complaints, etc.).

### 3. Application Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Configure Environment:
   - Rename `.env.example` to `.env`.
   - Update `SUPABASE_URL` and `SUPABASE_KEY` with your project's credentials (found in Supabase Settings > API).

### 4. Run the Application
```bash
python app.py
```
Visit `http://localhost:5000` in your browser.

## Demo Data
To populate the database with some sample departments and data (optional):
```bash
# Ensure manual run or use the provided script if you have configured the .env correctly
# The setup.sql already inserts default departments.
```

## Folder Structure
- `app.py`: Main Flask application.
- `supabase_client.py`: Database connection instance.
- `static/`: CSS and JavaScript files.
- `templates/`: HTML pages.
- `database/`: SQL scripts.
