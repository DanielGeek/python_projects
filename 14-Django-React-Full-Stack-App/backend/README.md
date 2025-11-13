# Backend - Django React Full Stack App

A Django REST API backend providing authentication, user management, and secure endpoints for the React frontend application.

## 🚀 Features

- **User Authentication**: JWT-based authentication system
- **User Registration**: Secure user registration with password validation
- **Token Management**: Access and refresh token implementation
- **CORS Support**: Cross-Origin Resource Sharing configuration
- **RESTful API**: Clean REST API endpoints following best practices
- **Database Integration**: SQLite database with Django ORM
- **Security**: Password hashing, token validation, and secure headers
- **Error Handling**: Comprehensive error responses and validation

## 🛠️ Tech Stack

- **Django** - Web framework
- **Django REST Framework** - API development toolkit
- **Simple JWT** - JWT authentication for Django REST Framework
- **Django CORS Headers** - CORS handling for Django
- **SQLite** - Database (development)
- **PostgreSQL** - Database (production ready)
- **Python-dotenv** - Environment variable management

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd 14-Django-React-Full-Stack-App/backend
```

1. Create and activate virtual environment:

```bash
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
```

1. Install dependencies:

```bash
pip install -r requirements.txt
```

1. Create environment file (optional):

```bash
touch .env
```

1. Run database migrations:

```bash
python manage.py migrate
```

1. Create a superuser (optional):

```bash
python manage.py createsuperuser
```

1. Start the development server:

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000`

## 🏗️ Project Structure

```text
backend/
├── api/                   # Main Django app
│   ├── migrations/       # Database migrations
│   ├── __init__.py
│   ├── admin.py          # Django admin configuration
│   ├── apps.py           # App configuration
│   ├── models.py         # Database models
│   ├── serializers.py    # DRF serializers
│   ├── tests.py          # Test cases
│   ├── urls.py           # App URL patterns
│   └── views.py          # API views
├── backend/              # Django project directory
│   ├── __init__.py
│   ├── asgi.py           # ASGI configuration
│   ├── settings.py       # Django settings
│   ├── urls.py           # Project URL patterns
│   └── wsgi.py           # WSGI configuration
├── env/                  # Virtual environment
├── db.sqlite3           # SQLite database
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (gitignored)
```

## 🔧 Configuration

### Django Settings

Key settings in `backend/settings.py`:

```python
# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'api',
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}

# JWT Configuration
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
}

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Environment Variables

Optional environment variables for `.env` file:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
```

## 📚 API Endpoints

### Authentication Endpoints

- **POST** `/api/token/` - Obtain JWT tokens
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

- **POST** `/api/token/refresh/` - Refresh access token
  ```json
  {
    "refresh": "string"
  }
  ```

- **POST** `/api/user/register/` - Register new user
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Protected Endpoints

All endpoints except authentication require a valid JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication:

1. **Registration**: Users create accounts via `/api/user/register/`
2. **Login**: Users obtain tokens via `/api/token/`
3. **Access**: Use access token for API requests (5-minute lifetime)
4. **Refresh**: Use refresh token to obtain new access token (24-hour lifetime)

### Token Usage

```bash
# Get tokens
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'

# Use access token
curl -X GET http://127.0.0.1:8000/protected-endpoint/ \
  -H "Authorization: Bearer <access_token>"
```

## 🗄️ Database

### Models

**User Model**: Extended Django User model with additional fields as needed.

### Migrations

Create new migrations after model changes:

```bash
python manage.py makemigrations
python manage.py migrate
```

### Database Administration

Access Django admin at `http://127.0.0.1:8000/admin/` with superuser credentials.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test api

# Run with verbose output
python manage.py test --verbosity=2
```

### Test Structure

Tests are located in `api/tests.py`:

```python
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

class UserRegistrationTest(TestCase):
    def test_user_registration(self):
        # Test user registration
        pass
```

## 🚀 Deployment

### Production Settings

1. Set `DEBUG=False` in settings
2. Configure production database (PostgreSQL recommended)
3. Set proper `SECRET_KEY`
4. Configure `ALLOWED_HOSTS`
5. Set up static files serving
6. Configure HTTPS

### Environment-Specific Settings

Create separate settings files for different environments:

- `settings/development.py`
- `settings/production.py`
- `settings/testing.py`

## 🔒 Security

### Implemented Security Measures

- Password hashing using Django's built-in authentication
- JWT token authentication with expiration
- CORS configuration for frontend integration
- CSRF protection (Django default)
- Security headers (Django default)

### Security Best Practices

1. Use environment variables for sensitive data
2. Keep Django and dependencies updated
3. Use HTTPS in production
4. Implement rate limiting
5. Validate and sanitize all inputs
6. Use strong password policies

## 📝 Management Commands

```bash
# Development server
python manage.py runserver

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Django shell
python manage.py shell

# Collect static files
python manage.py collectstatic

# Check for issues
python manage.py check
```

## 🛠️ Development

### Adding New Endpoints

1. Define models in `api/models.py`
2. Create serializers in `api/serializers.py`
3. Implement views in `api/views.py`
4. Add URL patterns in `api/urls.py`
5. Run migrations if models changed

### Code Style

Follow PEP 8 style guidelines:
- Use 4 spaces for indentation
- Maximum line length of 79 characters
- Use descriptive variable and function names

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` in settings
2. **Token errors**: Verify JWT configuration and token expiration
3. **Database errors**: Run migrations and check database configuration
4. **Import errors**: Ensure all dependencies are installed

### Debugging

- Use Django debug toolbar for development debugging
- Check Django logs for error messages
- Use `print()` statements or Python debugger for code issues
- Monitor network requests in browser dev tools

### Getting Help

- Check Django documentation
- Review DRF documentation
- Examine error messages and stack traces
- Use Django shell for testing API endpoints
