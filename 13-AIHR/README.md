# � AI-Powered HR Management System

A comprehensive HR management system that leverages AI for efficient candidate screening and job application processing. Built with Django and powered by Meta's Llama 3 70B LLM through Groq API.

## ✨ Features

### For HR Personnel
- 📝 Create and manage job postings
- ✏️ Edit existing job listings
- 🤖 AI-powered candidate shortlisting
- � Application tracking system
- 👥 Candidate management dashboard

### For Job Applicants
- 🔍 Browse available job positions
- � Submit applications online
- 📱 Mobile-responsive interface
- 📧 Application status notifications

## �️ Tech Stack

- **Backend:** Django 4.2
- **Frontend:** Bootstrap 5 (Purple Admin Template)
- **AI Integration:** Groq API with Meta's Llama 3 70B
- **Database:** SQLite (default, can be configured for production)
- **Environment:** Python 3.8+

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd 13-AIHR
   ```

2. **Set up a virtual environment**
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate the virtual environment
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   # venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the project root and add:
   ```
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   GROQ_API_KEY=your-groq-api-key
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (admin account)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - Admin Dashboard: `http://127.0.0.1:8000/admin/`
   - Careers Page: `http://127.0.0.1:8000/`

## 🧪 Running Tests

```bash
# Install test dependencies
pip install pytest pytest-django

# Run tests
pytest
```

## 📂 Project Structure

```
13-AIHR/
├── AIHumanResource/          # Main project directory
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   └── ...
├── HumanResource/           # Main application
│   ├── migrations/          # Database migrations
│   ├── templates/           # HTML templates
│   ├── models.py            # Database models
│   ├── views.py             # View functions
│   └── ...
├── static/                  # Static files (CSS, JS, images)
├── media/                   # User-uploaded files
├── requirements.txt         # Project dependencies
└── manage.py                # Django management script
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootstrap Purple Admin Template](https://www.bootstrapdash.com/product/purple-free-admin-template)
- [Django Documentation](https://docs.djangoproject.com/)
- [Groq API](https://groq.com/)
- [Meta's Llama 3](https://ai.meta.com/llama/)