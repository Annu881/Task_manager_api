# Use Python 3.12
FROM python:3.12-slim

# Force rebuild: Fixed deployment error - 2025-12-04

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

# Run the application
CMD ["./start.sh"]
