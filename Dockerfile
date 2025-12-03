# FRESH BUILD - NO CACHE - 2025-12-04
FROM python:3.12-slim

# Unique timestamp to invalidate ALL cache
ENV BUILD_TIMESTAMP=2025-12-04-00-45-FIXED
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install ALL build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libpq-dev \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements FIRST
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .
COPY start.sh .
RUN chmod +x start.sh

# Verify bcrypt is installed
RUN python -c "import bcrypt; print('bcrypt OK')"

# Run the application
CMD ["./start.sh"]
