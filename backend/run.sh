#!/bin/bash
# Run database migrations
alembic upgrade head

# Start the application
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
