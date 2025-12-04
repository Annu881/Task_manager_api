#!/usr/bin/env python3
"""
Check what tables exist in the database
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text

db_url = "postgresql://postgres:rLROymZlPHnMTCDYQtfjnLTgSAbqpJtM@switchyard.proxy.rlwy.net:15367/railway"

print("Connecting to database...")
print(f"URL: {db_url[:50]}...")

engine = create_engine(db_url)

with engine.connect() as conn:
    # List all tables
    result = conn.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """))
    
    tables = result.fetchall()
    
    print(f"\n✅ Connected successfully!")
    print(f"\nTables in database: {len(tables)}")
    
    if tables:
        print("\nFound tables:")
        for table in tables:
            print(f"  - {table[0]}")
    else:
        print("\n❌ No tables found!")
        print("\nThis means migrations haven't run on this database yet.")
        print("\nPossible reasons:")
        print("1. Railway is using a different DATABASE_URL internally")
        print("2. The migrations ran on a different database instance")
        print("3. The DATABASE_PUBLIC_URL is different from DATABASE_URL")
