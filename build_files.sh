#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Create necessary directories if they don't exist
mkdir -p static
mkdir -p media

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate 