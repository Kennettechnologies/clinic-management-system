import os
import sys

# Add the project directory to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_management_system.settings')

from django.core.asgi import get_asgi_application
application = get_asgi_application() 