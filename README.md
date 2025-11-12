# 🐍 DanielGeek's Python Projects

This repository showcases my journey and hands-on practice with Python — starting from the basics of syntax and control flow to more advanced topics like scoping, dictionaries, and testing with `pytest`. These exercises reflect my progressive mastery of Python through small, focused challenges and mini-projects.

---

## 🧠 Learning Roadmap

Organized by day, this repository follows a project-based learning style (inspired by 100 Days of Code and Bootcamp formats).

### ✅ Fundamentals & Data Types

- `1-day-1-printing` – Variables, printing, and f-strings.
- `2-day-1-variables` – Primitive data types and type conversion.
- `3-day-2-datat-ypes` – Tip calculator project.
- `4-day-3` – Conditional logic: Treasure Island game.
- `5-day-4-randomisation-python-lists` – Randomization and Rock-Paper-Scissors.
- `6-day-5-loops` – Loops and password generator.
- `7-day-7` – ASCII art and basic UI interaction.

### 🔐 Logic, Dictionaries & Scope

- `8-day-8` – Caesar cipher encoder/decoder with user input improvements.
- `9-day-9-dictionaries` – Using dictionaries for structured data.
- `10-day-10-function-outputs` – Function return values and flow control.
- `11-day-11` – Intro to testing and debugging logic.
- `12-day-12-scope` – Understanding local vs global scope in Python.

---

## 🧪 Testing & Real-World Projects

### 🧬 AIHR: AI-Powered HR Management System

- **Folder:** `13-AIHR`
- **Description:** A comprehensive HR management system that leverages AI for candidate screening and job application processing.
- **Features:**
  - Job posting and management for HR personnel
  - Career page for applicants to browse and apply for jobs
  - AI-powered candidate shortlisting using Meta's Llama 3 70B LLM
  - Application tracking system
  - User-friendly admin interface

#### 🛠️ Tech Stack
- **Backend:** Django
- **Frontend:** Bootstrap 5 (Purple Admin Template)
- **AI Integration:** Groq API with Meta's Llama 3 70B
- **Environment:** Python 3.x

#### 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd python_projects/13-AIHR
   ```

2. **Set up the environment**
   ```bash
   virtualenv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file and add your Groq API key:
   ```
   GROQ_API_KEY=your_api_key_here
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

6. **Access the application**
   - HR Dashboard: `http://127.0.0.1:8000/admin/`
   - Careers Page: `http://127.0.0.1:8000/`

#### 🧪 Testing
Run tests using pytest:
```bash
pip install pytest pytest-django
pytest
```

#### 📚 Resources
- [Bootstrap Admin Template](https://www.bootstrapdash.com/product/purple-free-admin-template)
- [Groq API](https://groq.com/)
- [Django Documentation](https://docs.djangoproject.com/)

#### 📝 License
This project is open source and available under the MIT License.
