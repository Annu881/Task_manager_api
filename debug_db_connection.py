import os
import sys
from sqlalchemy import text

# Add backend to path so we can import app modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.config import settings
from app.db.session import engine

def test_connection():
    print("--- Debugging Database Connection ---")
    
    # 1. Check URL transformation
    raw_url = os.environ.get("DATABASE_URL", "")
    print(f"Raw DATABASE_URL from env: {raw_url}")
    print(f"Settings.DATABASE_URL:     {settings.DATABASE_URL}")
    
    if settings.DATABASE_URL.startswith("postgres://"):
        print("❌ FAIL: URL still starts with postgres:// (Validator not working)")
    elif settings.DATABASE_URL.startswith("postgresql://"):
        print("✅ PASS: URL starts with postgresql://")
    else:
        print(f"⚠️ UNKNOWN: URL starts with {settings.DATABASE_URL.split(':')[0]}")

    # 2. Try to connect
    print("\nAttempting to connect to database...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print(f"✅ Connection Successful! Result: {result.scalar()}")
            
            # Check for users table
            result = connection.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');"))
            print(f"✅ Users table exists: {result.scalar()}")
            
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_connection()
