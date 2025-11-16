# 🚀 Adventure AI Backend

Welcome to the backend of Adventure AI, a powerful AI-powered application built with modern Python technologies. This backend provides the core functionality for an interactive AI experience, leveraging cutting-edge natural language processing and database capabilities.

## 🌟 Features

- **FastAPI** - High-performance web framework for building APIs with Python 3.7+
- **LangChain** - Framework for developing applications powered by language models
- **OpenAI Integration** - Seamless connection to advanced AI models
- **PostgreSQL Database** - Robust and scalable database support via SQLAlchemy ORM
- **Environment Management** - Easy configuration with python-dotenv
- **ASGI Server** - Lightning-fast Uvicorn server for production deployment

## 🛠️ Tech Stack

- **Framework**: FastAPI
- **AI Integration**: LangChain, OpenAI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Server**: Uvicorn
- **Package Management**: uv
- **Environment**: python-dotenv

## 🚀 Getting Started

### Prerequisites

- Python 3.7+
- PostgreSQL
- OpenAI API key
- uv package manager

### Installation

1. Clone the repository

2. Install dependencies:

   ```bash
   uv add fastapi[all] langchain langchain-openai python-dotenv sqlalchemy uvicorn psycopg2-binary
   ```

3. Set up your environment variables in a `.env` file

4. Run the development server:

   ```bash
   uvicorn main:app --reload
   ```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:

- **Interactive API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative API Docs (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the Adventure AI team
