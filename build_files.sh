#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories if they don't exist
mkdir -p staticfiles
mkdir -p media

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create a production .env file
cat > .env << EOL
DJANGO_DEBUG=False
SECRET_KEY=${SECRET_KEY}
DATABASE_URL=${DATABASE_URL}
EOL 