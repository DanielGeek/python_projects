# DataGen Agent - AI-Powered Sample Data Generator

An intelligent AI agent built with LangChain that generates realistic sample user data for applications and testing purposes. The agent uses Google's Gemini AI to understand natural language requests and generate structured JSON data with user profiles.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini 2.5 Flash for intelligent data generation
- 📊 **Structured Output**: Generates users with complete profiles including ID, name, email, username, age, and registration date
- 💾 **JSON Export**: Save generated data to JSON files with proper formatting
- 📖 **File Operations**: Read and manipulate existing JSON data files
- 🎯 **Natural Language**: Use conversational commands to specify data requirements
- 🔧 **Customizable**: Control age ranges, email domains, names, and more

## Prerequisites

- Python 3.14 or higher
- UV package manager (recommended) or pip
- Google AI API key

## Installation

### Using UV (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd 18-AI-agent
```

1. Install dependencies with UV:

```bash
uv sync
```

### Using pip

1. Clone the repository:

```bash
git clone <repository-url>
cd 18-AI-agent
```

1. Create virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

1. Install dependencies:

```bash
pip install -r requirements.txt
```

## Setup

1. Copy the environment file:

```bash
cp .env.example .env
```

1. Edit `.env` and add your Google AI API key:

```env
GOOGLE_API_KEY=your_google_ai_api_key_here
```

## Usage

### Running the Agent

```bash
# Using UV
uv run main.py

# Using pip/venv
python main.py
```

### Example Commands

Once the agent is running, you can use natural language commands:

#### Generate Random Users

```text
You: generate 5 random users
```

Output:

```json
{
  "count": 5,
  "users": [
    {
      "age": 29,
      "email": "alice.smith@example.com",
      "firstName": "Alice",
      "id": 1,
      "lastName": "Smith",
      "registeredAt": "2025-12-01T23:29:50.283518",
      "username": "alice430"
    },
    // ... more users
  ]
}
```

#### Generate with Specific Criteria

```text
You: make users aged 25-35 with company.com emails and save 3 of them to users.json
```

#### Generate with Specific Names

```text
You: generate users named John, Jane, Mike and save to users.json
```

#### Custom Age Range and Domains

```text
You: create users with last names Smith, Jones aged 30-40 with gmail.com emails
```

### File Operations

The agent can read and write JSON files:

#### Save Generated Data

```text
You: generate 3 users and save to employees.json
```

#### Read Existing Data

```text
You: what's in users.json?
```

#### Analyze Data

```text
You: what is the oldest user in users.json?
```

## Data Structure

Each generated user includes the following fields:

```json
{
  "id": 1,                           // Auto-incremented ID
  "firstName": "Alice",               // First name
  "lastName": "Smith",                // Last name
  "email": "alice.smith@domain.com",  // Email address
  "username": "alice123",             // Unique username
  "age": 29,                          // Random age within specified range
  "registeredAt": "2025-12-01T23:29:50.283518"  // ISO registration date
}
```

## Available Tools

The agent has access to three main tools:

1. **generate_sample_users**: Creates user data with specified parameters
2. **write_json**: Saves data to JSON files with pretty formatting
3. **read_json**: Reads and displays contents of JSON files

## Configuration

### System Prompt

The agent uses a system prompt that:

- Automatically fills in required parameters without asking
- Generates appropriate names, domains, and age ranges based on context
- Handles file operations seamlessly
- Maintains conversation context

### Model Configuration

- **Model**: Google Gemini 2.5 Flash
- **Temperature**: Default (balanced creativity)
- **Recursion Limit**: 50 (for complex tool chains)

## Sample Session

```text
============================================================
DataGen Agent - Sample Data Generator
============================================================
Generate sample user data and save to JSON files.

Examples:
  - Generate users named John, Jane, Mike and save to users.json
  - Create users with last names Smith, Jones
  - Make users aged 25-35 with company.com emails

Commands: 'quit' or 'exit' to end
============================================================
You: generate 5 random users
Agent: [{'type': 'text', 'text': 'Here are 5 randomly generated users:', 'extras': {...}}]

You: make users aged 25-35 with company.com emails and save 3 of them to users.json
Agent: ["I've generated 3 users aged between 25-35 with 'company.com' emails and saved them to 'users.json'."]

You: what is the oldest user in users.json?
Agent: [{'type': 'text', 'text': 'The oldest user in users.json is Alice Smith, aged 32.', 'extras': {...}}]
```

## File Output Examples

### users.json

```json
{
  "count": 3,
  "users": [
    {
      "username": "alice408",
      "registeredAt": "2025-05-01T23:31:35.803819",
      "age": 32,
      "lastName": "Smith",
      "firstName": "Alice",
      "email": "alice.smith@company.com",
      "id": 1
    },
    {
      "id": 2,
      "registeredAt": "2024-12-25T23:31:35.803829",
      "firstName": "Bob",
      "username": "bob196",
      "lastName": "Jones",
      "age": 25,
      "email": "bob.jones@company.com"
    },
    {
      "age": 25,
      "firstName": "Charlie",
      "registeredAt": "2025-07-08T23:31:35.803832",
      "id": 3,
      "email": "charlie.williams@company.com",
      "lastName": "Williams",
      "username": "charlie783"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Import Error with AgentExecutor**
   - The code has been updated to work with the latest LangChain version
   - If you encounter import errors, ensure you have the latest LangChain version

2. **Pydantic V1 Compatibility Warning**
   - This is a deprecation warning and doesn't affect functionality
   - It will be resolved in future LangChain updates

3. **API Key Issues**
   - Ensure your Google AI API key is correctly set in the `.env` file
   - Make sure the API key has the necessary permissions

### Dependencies

Key dependencies include:

- `langchain` - Core framework
- `langchain-google-genai` - Google AI integration
- `langchain-core` - Core components
- `python-dotenv` - Environment variable management
- `pydantic` - Data validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [License Name].

## Support

For issues and questions:

- Check the troubleshooting section
- Review the example commands
- Open an issue on the repository

---

**Note**: This agent is designed for generating sample data for testing and development purposes. Do not use the generated data for production user accounts or real authentication systems.
