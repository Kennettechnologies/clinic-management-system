# Clinic Management System

A comprehensive clinic management system built with Django that handles patient records, lab tests, and user management.

## Features

- User authentication and authorization
- Patient management
- Lab test requests and results
- Role-based access control
- Multi-language support

## Tech Stack

- Python 3.13
- Django 5.2
- Bootstrap 5
- SQLite (Development)
- PostgreSQL (Production)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clinic-management-system.git
cd clinic-management-system
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration.

## License

MIT License 