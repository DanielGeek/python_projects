# 39 - AutoGen RoundRobin Agent Chat with LangChain Integration

## 📋 Overview

This project demonstrates a multi-agent conversation system using Microsoft AutoGen's `RoundRobinGroupChat` with LangChain tool integration. The system features a primary agent that searches for flight information and an evaluator agent that provides feedback and approval.

## 🎯 Key Features

- **Multi-Agent RoundRobin Conversation**: Alternating turns between primary and evaluator agents
- **LangChain Tool Integration**: Google Serper API for internet search capabilities
- **Iterative Feedback Loop**: Evaluator provides constructive feedback until response is approved
- **TextMentionTermination**: Automatic termination when evaluator responds with "APPROVE"
- **GPT-4o-mini Integration**: OpenAI model for intelligent agent responses

## 🏗️ Architecture

### Agents

1. **Primary Agent**: 
   - Searches for flight information using internet search
   - Incorporates feedback from evaluator
   - Formats responses according to user requirements

2. **Evaluator Agent**:
   - Provides constructive feedback on primary agent responses
   - Ensures information is well-organized and relevant
   - Approves responses when requirements are met

### Workflow

```
User Request → Primary Agent (Search) → Primary Agent (Response) 
→ Evaluator Agent (Feedback) → Primary Agent (Refine) 
→ Evaluator Agent (Approve) → TERMINATION
```

## 🚀 Getting Started

### Prerequisites

- Python 3.14+
- OpenAI API key
- Google Serper API key
- UV package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd 39-autogen_agent_chat_roundrobin
```

2. Install dependencies:
```bash
uv sync
```

3. Set up environment variables:
```bash
# Create .env file
OPENAI_API_KEY=your_openai_api_key
SERPER_API_KEY=your_serper_api_key
```

### Running the Project

```bash
uv run main.py
```

## 📊 Example Output

```
user:
Find a one-way non-stop flight from JFK to LHR in June 2026.

IMPORTANT: When you provide your answer, you MUST:
1. Focus ONLY on non-stop flights for June 2026
2. Organize the information in a clear, structured format with bullet points
...

primary:
[FunctionCall(id='call_...', arguments='{"query":"one-way non-stop flights JFK to LHR June 2026"}', name='internet_search')]

primary:
[FunctionExecutionResult(content='...')]

primary:
Cheap Flights from New York (JFK) to London (LHR) start at $205...

evaluator:
**Non-Stop Flights from JFK to LHR in June 2026:**
- **British Airways**: Starting at $518 (typical range: $500 - $760)
- **United Airlines**: Starting at $516 
- **Flight Duration**: Approximately 7-8 hours 

Please ensure to verify availability and final prices closer to your travel date, as they may vary.

primary:
**Non-Stop Flights from JFK to LHR in June 2026:**
- **British Airways**: Starting at $518 (typical range: $500 - $760)
- **United Airlines**: Starting at $516 
- **Flight Duration**: Approximately 7-8 hours 

*Please ensure to verify availability and final prices closer to your travel date, as they may vary.*

evaluator:
APPROVE
```

## 🔧 Configuration

### Agent Configuration

- **Model**: `gpt-4o-mini`
- **Max Turns**: 20
- **Termination Condition**: `TextMentionTermination("APPROVE")`

### Tool Integration

- **Search Tool**: Google Serper API via LangChain
- **Adapter**: `LangChainToolAdapter` for AutoGen compatibility

## 🎓 Key Learnings

1. **Prompt vs System Message**: Instructions in user prompt are more effective than system message when using tools
2. **Iterative Improvement**: Multi-turn conversations with feedback produce better results
3. **Termination Conditions**: `TextMentionTermination` works reliably for approval-based workflows
4. **Tool Integration**: LangChain tools can be seamlessly integrated with AutoGen agents

## 🐛 Troubleshooting

### Common Issues

1. **Agent not following instructions**: Put detailed instructions in the user prompt rather than system message
2. **Conversation stopping early**: Ensure termination condition is properly configured
3. **Tool not working**: Verify API keys are correctly set in environment variables

### Debug Mode

For debugging, you can add detailed logging:

```python
async def main():
    try:
        print("🚀 Starting RoundRobin team execution...")
        result = await team.run(task=prompt)
        print(f"✅ Team execution completed. Total messages: {len(result.messages)}")
        print(f"🏁 Termination reason: {result.termination_reason if hasattr(result, 'termination_reason') else 'Unknown'}")
        
        for i, message in enumerate(result.messages):
            print(f"--- Message {i+1} from {message.source} ---")
            print(f"{message.content}\n")
            
    except Exception as e:
        print(f"❌ Error during execution: {e}")
        import traceback
        traceback.print_exc()
```

## 🔗 Dependencies

- `autogen-agentchat`: Multi-agent framework
- `autogen-ext.models.openai`: OpenAI model integration
- `autogen-ext.tools.langchain`: LangChain tool adapter
- `langchain-community`: Community tools (Google Serper)
- `langchain-core`: Core LangChain functionality
- `python-dotenv`: Environment variable management

## 📝 Notes

- The system demonstrates effective human-AI collaboration patterns
- RoundRobin conversation ensures structured dialogue
- Feedback loops improve response quality iteratively
- Text-based termination provides clear approval workflows

## 🚀 Future Enhancements

1. Add more sophisticated evaluation criteria
2. Implement multiple search tools for better information gathering
3. Add memory capabilities for context retention across conversations
4. Implement concurrent tool usage for faster information gathering