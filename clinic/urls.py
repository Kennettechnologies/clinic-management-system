from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('lab/', include('lab.urls')),
    path('i18n/', include('django.conf.urls.i18n')),  # For language switching
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 