# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory in container
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy only necessary application files
COPY api.py .
COPY recipes.json .
COPY comments.json .

# Note: logs directory will be created automatically by api.py

# Expose port
EXPOSE 8000

# Health check using httpx (which is in requirements.txt)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/recipes')"

# Run the application
CMD uvicorn api:app --host 0.0.0.0 --port ${PORT}
