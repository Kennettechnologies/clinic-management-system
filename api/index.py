import os
import sys
from pathlib import Path

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_management_system.settings')

from django.core.asgi import get_asgi_application
application = get_asgi_application() 