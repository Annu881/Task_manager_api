#!/bin/bash
# Quick script to view users - just run: ./view_users_quick.sh

echo "=================================="
echo "📊 Fetching User Data from Railway"
echo "=================================="
echo ""
echo "Please paste your DATABASE_URL from Railway and press Enter:"
echo "(From Railway: PostgreSQL → Variables → DATABASE_URL)"
echo ""
read -r DATABASE_URL

export DATABASE_URL="$DATABASE_URL"
python3 view_users.py
