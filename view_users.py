#!/usr/bin/env python3
"""
Script to view all users from the PostgreSQL database
Run this script to see all user login data
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from datetime import datetime

def get_database_url():
    """Get database URL from environment or use default"""
    # Try to get from environment variable (Railway deployment)
    db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        # Ask user to provide DATABASE_URL
        print("DATABASE_URL not found in environment variables.")
        print("\nPlease provide your PostgreSQL DATABASE_URL:")
        print("Format: postgresql://username:password@host:port/database")
        print("\nExample: postgresql://postgres:password@localhost:5432/taskdb")
        print("Or from Railway: postgresql://postgres:xxx@xxx.railway.app:5432/railway")
        db_url = input("\nEnter DATABASE_URL: ").strip()
    
    # Handle Railway's postgres:// format (convert to postgresql://)
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    
    return db_url

def print_table(headers, rows):
    """Simple table printer without external dependencies"""
    # Calculate column widths
    col_widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            col_widths[i] = max(col_widths[i], len(str(cell)))
    
    # Print header
    print("\n" + "=" * (sum(col_widths) + len(headers) * 3 + 1))
    header_row = " | ".join(h.ljust(col_widths[i]) for i, h in enumerate(headers))
    print(f"| {header_row} |")
    print("=" * (sum(col_widths) + len(headers) * 3 + 1))
    
    # Print rows
    for row in rows:
        row_str = " | ".join(str(cell).ljust(col_widths[i]) for i, cell in enumerate(row))
        print(f"| {row_str} |")
    
    print("=" * (sum(col_widths) + len(headers) * 3 + 1))

def view_all_users():
    """Fetch and display all users from the database"""
    try:
        # Get database URL
        db_url = get_database_url()
        
        print(f"\n🔌 Connecting to database...")
        
        # Create database engine
        engine = create_engine(db_url)
        
        # Connect and query
        with engine.connect() as conn:
            # Check if users table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                );
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("\n❌ Error: 'users' table does not exist in the database!")
                print("Please run migrations first: alembic upgrade head")
                return
            
            # Fetch all users
            result = conn.execute(text("""
                SELECT 
                    id,
                    email,
                    username,
                    full_name,
                    role,
                    is_active,
                    created_at,
                    updated_at
                FROM users
                ORDER BY created_at DESC;
            """))
            
            users = result.fetchall()
            
            if not users:
                print("\n📭 No users found in the database.")
                print("Users will appear here after signup/login.")
                return
            
            # Display users in a nice table format
            print(f"\n✅ Found {len(users)} user(s) in the database:")
            
            headers = ["ID", "Email", "Username", "Full Name", "Role", "Active", "Created At"]
            table_data = []
            
            for user in users:
                table_data.append([
                    user[0],  # id
                    user[1],  # email
                    user[2],  # username
                    user[3] or "N/A",  # full_name
                    user[4] or "USER",  # role
                    "Yes" if user[5] else "No",  # is_active
                    str(user[6])[:19] if user[6] else "N/A",  # created_at
                ])
            
            print_table(headers, table_data)
            print(f"\n📊 Total users: {len(users)}")
            
    except Exception as e:
        print(f"\n❌ Error connecting to database: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure your DATABASE_URL is correct")
        print("2. Check if the database server is running")
        print("3. Verify your network connection")
        print("4. Ensure migrations have been run: alembic upgrade head")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 80)
    print("📊 USER DATA VIEWER - Task Management System")
    print("=" * 80)
    view_all_users()
    print("\n" + "=" * 80)
