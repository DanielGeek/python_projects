# OpenAI Agent Project

This project demonstrates using OpenAI Agents with Python.

## Features

- AI-powered email generation
- Streaming responses
- Resend email integration
- Hot reloading for development

## Setup

1. Install dependencies: `uv sync`
2. Set up environment variables in `.env`:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `RESEND_API_KEY`: Your Resend API key (optional, for email sending)
3. Run with hot reloading: `uv run watchmedo auto-restart --patterns="*.py" --recursive -- uv run main.py`

## Commands

- `uv run main.py`: Run the main script
- `uv run test_resend.py`: Test Resend email functionality
- `uv run watchmedo auto-restart --patterns="*.py" --recursive -- uv run main.py`: Run with hot reloading

## License

MIT
