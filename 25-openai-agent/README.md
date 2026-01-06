# OpenAI Agent Project - Automated SDR System

This project demonstrates an advanced multi-model AI agent system for automated sales development representative (SDR) workflows using OpenAI Agents SDK.

## Features

- **Multi-Model AI Agents**: Uses DeepSeek, Gemini, Llama3.3, and OpenAI models with intelligent fallback
- **Automated Email Generation**: Three different email styles (professional, humorous, concise)
- **Smart Model Rotation**: If primary model fails, automatically rotates through backup models
- **Email Workflow**: Complete pipeline from generation → subject writing → HTML conversion → sending
- **Input Guardrails**: Name detection and validation for security
- **Resend Integration**: Professional email delivery with HTML formatting
- **Real-time Tracing**: Full visibility into agent execution and model attempts
- **Error Handling**: Graceful handling of API failures (402, 403, 429 errors)

## Architecture

### Agent System
- **Sales Agents**: 3 specialized agents with different email writing styles
- **Sales Manager**: Coordinates email generation, selection, and handoff
- **Email Manager**: Handles subject writing, HTML conversion, and sending
- **Guardrail Agent**: Validates input for personal information

### Model Fallback Strategy
Each sales agent attempts models in this order:
1. Primary model (DeepSeek/Gemini/Llama3.3)
2. OpenAI gpt-4o-mini
3. Remaining models in rotation
4. Final fallback if all fail

## Setup

1. Install dependencies: `uv sync`
2. Set up environment variables in `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   GOOGLE_API_KEY=AI...
   DEEPSEEK_API_KEY=sk-...
   GROQ_API_KEY=gsk_...
   RESEND_API_KEY=re_...
   FROM_EMAIL=your-email@example.com
   TO_EMAIL=recipient@example.com
   ```
3. Run with hot reloading: `uv run watchmedo auto-restart --patterns="*.py" --recursive -- uv run main.py`

## Commands

- `uv run main.py`: Run the complete automated SDR workflow
- `uv run test_resend.py`: Test Resend email functionality
- `uv run watchmedo auto-restart --patterns="*.py" --recursive -- uv run main.py`: Run with hot reloading

## Workflow

1. **Input Validation**: Guardrail agent checks for personal information
2. **Email Generation**: 3 sales agents create different email drafts
3. **Model Rotation**: Each agent tries multiple models until one succeeds
4. **Selection**: Sales Manager selects the best email draft
5. **Formatting**: Subject writing and HTML conversion
6. **Delivery**: Email sent via Resend API

## Error Handling

- **402 Insufficient Balance**: Rotates to next model
- **403 Access Denied**: Rotates to next model  
- **429 Rate Limit**: Rotates to next model
- **Max Turns Exceeded**: Fallback to next Sales Manager model

## Monitoring

- Full OpenAI dashboard tracing for all model attempts
- Console logging of each model rotation attempt
- Success/failure tracking for each agent
- Email delivery confirmation

## License

MIT
