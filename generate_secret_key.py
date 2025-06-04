from django.core.management.utils import get_random_secret_key

# Generate a secure secret key
secret_key = get_random_secret_key()
print("\nYour secure Django secret key is:")
print(secret_key)
print("\nAdd this to your .env file as:")
print(f"DJANGO_SECRET_KEY={secret_key}") 