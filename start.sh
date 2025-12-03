#!/bin/bash
set -e  # Exit on error

echo "========================================="
echo "Starting Task Manager API"
echo "========================================="

echo ""
echo "📋 Running database migrations..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi

echo ""
echo "🚀 Starting application server..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
