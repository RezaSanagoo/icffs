FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Pass the WSGI module explicitly so a missing/empty runtime app setting
# cannot make Gunicorn boot with an empty module name.
CMD ["gunicorn", "--config", "./gunicorn.conf.py", "config.wsgi:application"]

