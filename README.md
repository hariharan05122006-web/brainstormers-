
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
---
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

