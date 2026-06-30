# Multi-stage Dockerfile for NyxVault Advanced Cybersecurity Suite
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system compilation dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies into a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY nyxvault-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# Final run stage
FROM python:3.12-slim

WORKDIR /app

# Install runtime system libraries (like libpq for postgres, if used)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy backend files (context is parent directory)
COPY nyxvault-backend/ ./backend/

# Copy frontend static files
COPY nyxvault/ ./nyxvault/

WORKDIR /app/backend

# Expose NyxVault port
EXPOSE 3000

# Set production environment variables
ENV FLASK_APP=app.py
ENV PORT=3000
ENV PYTHONUNBUFFERED=1

# Start the Flask backend server
CMD ["python", "app.py"]
