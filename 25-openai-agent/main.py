from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents import Agent, Runner, trace, function_tool, OpenAIChatCompletionsModel, input_guardrail, GuardrailFunctionOutput
from openai.types.responses import ResponseTextDeltaEvent
from typing import Dict
import os
import resend
import asyncio
from pydantic import BaseModel

load_dotenv(override=True)

openai_api_key = os.getenv('OPENAI_API_KEY')
google_api_key = os.getenv('GOOGLE_API_KEY')
deepseek_api_key = os.getenv('DEEPSEEK_API_KEY')
groq_api_key = os.getenv('GROQ_API_KEY')

if openai_api_key:
    print(f"OpenAI API Key exists and begins {openai_api_key[:8]}")
else:
    print("OpenAI API Key not set")

if google_api_key:
    print(f"Google API Key exists and begins {google_api_key[:2]}")
else:
    print("Google API Key not set (and this is optional)")

if deepseek_api_key:
    print(f"DeepSeek API Key exists and begins {deepseek_api_key[:3]}")
else:
    print("DeepSeek API Key not set (and this is optional)")

if groq_api_key:
    print(f"Groq API Key exists and begins {groq_api_key[:4]}")
else:
    print("Groq API Key not set (and this is optional)")

instructions1 = "You are a sales agent working for ComplAI, \
a company that provides a SaaS tool for ensuring SOC2 compliance and preparing for audits, powered by AI. \
You write professional, serious cold emails."

instructions2 = "You are a humorous, engaging sales agent working for ComplAI, \
a company that provides a SaaS tool for ensuring SOC2 compliance and preparing for audits, powered by AI. \
You write witty, engaging cold emails that are likely to get a response."

instructions3 = "You are a busy sales agent working for ComplAI, \
a company that provides a SaaS tool for ensuring SOC2 compliance and preparing for audits, powered by AI. \
You write concise, to the point cold emails."

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

deepseek_client = AsyncOpenAI(base_url=DEEPSEEK_BASE_URL, api_key=deepseek_api_key)
gemini_client = AsyncOpenAI(base_url=GEMINI_BASE_URL, api_key=google_api_key)
groq_client = AsyncOpenAI(base_url=GROQ_BASE_URL, api_key=groq_api_key)

deepseek_model = OpenAIChatCompletionsModel(model="deepseek-chat", openai_client=deepseek_client)
gemini_model = OpenAIChatCompletionsModel(model="gemini-2.5-flash", openai_client=gemini_client)
llama3_3_model = OpenAIChatCompletionsModel(model="llama-3.3-70b-versatile", openai_client=groq_client)

# Original models in preferred order (for initial attempts)
original_models = [
    ("deepseek-chat", deepseek_model, "DeepSeek"),
    ("gemini-2.5-flash", gemini_model, "Gemini"),
    ("llama-3.3-70b-versatile", llama3_3_model, "Llama3.3"),
]

# Fallback models (OpenAI first as most reliable)
available_models = [
    ("gpt-4o-mini", "gpt-4o-mini", "OpenAI"),  # Most reliable, try first
    ("gemini-2.5-flash", gemini_model, "Gemini"),
    ("llama-3.3-70b-versatile", llama3_3_model, "Llama3.3"),
    ("deepseek-chat", deepseek_model, "DeepSeek"),
]

# Helper function to run agent with fallback
async def run_agent_with_fallback(agent_name: str, instructions: str, message: str):
    """Try to run agent with primary model, fallback to alternatives if it fails"""
    for model_name, model, model_label in available_models:
        try:
            print(f"🔄 Trying {agent_name} with {model_label}...")
            agent = Agent(name=f"{model_label} {agent_name}", instructions=instructions, model=model)
            result = await Runner.run(agent, message)
            print(f"✅ {model_label} succeeded!")
            return result
        except Exception as e:
            print(f"⚠️  {model_label} failed: {str(e)[:100]}")
            if model == available_models[-1][1]:  # Last model
                print(f"❌ All models failed for {agent_name}")
                raise
            print(f"🔄 Trying next model...")
            continue

# Helper function to create agent with fallback model
def create_agent_with_fallback(name: str, instructions: str, tools=None, handoffs=None, handoff_description=None):
    """Create an agent that will try alternative models if primary fails"""
    # Try to use the first available model
    for model_name, model, model_label in available_models:
        try:
            kwargs = {"name": name, "instructions": instructions, "model": model}
            if tools is not None:
                kwargs["tools"] = tools
            if handoffs is not None:
                kwargs["handoffs"] = handoffs
            if handoff_description is not None:
                kwargs["handoff_description"] = handoff_description
            return Agent(**kwargs)
        except Exception as e:
            if model == available_models[-1][1]:
                # If all models fail during creation, fall back to gpt-4o-mini
                kwargs["model"] = "gpt-4o-mini"
                return Agent(**kwargs)
            continue

# Sales agents with their original models (will be used as primary, with fallback to others)
# These agents will appear in traces when executed
sales_agent1 = Agent(name="DeepSeek Sales Agent", instructions=instructions1, model=deepseek_model)
sales_agent2 = Agent(name="Gemini Sales Agent", instructions=instructions2, model=gemini_model)
sales_agent3 = Agent(name="Llama3.3 Sales Agent", instructions=instructions3, model=llama3_3_model)

async def run_sales_email():
    result = Runner.run_streamed(sales_agent1, input="Write a cold sales email")
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)

    message = "Write a cold sales email"

    with trace("Parallel cold emails"):
        # Run agents directly to show in traces
        results = await asyncio.gather(
            Runner.run(sales_agent1, message),
            Runner.run(sales_agent2, message),
            Runner.run(sales_agent3, message),
        )

    outputs = [result.final_output for result in results]

    for output in outputs:
        print(output + "\n\n")

    sales_picker = create_agent_with_fallback(
        name="sales_picker",
        instructions="You pick the best cold sales email from the given options. \
        Imagine you are a customer and pick the one you are most likely to respond to. \
        Do not give an explanation; reply with the selected email only."
    )

    message = "Write a cold sales email"

    with trace("Selection from sales people"):
        # Run agents directly to show in traces
        results = await asyncio.gather(
            Runner.run(sales_agent1, message),
            Runner.run(sales_agent2, message),
            Runner.run(sales_agent3, message),
        )
        outputs = [result.final_output for result in results]

        emails = "Cold sales emails:\n\n" + "\n\nEmail:\n\n".join(outputs)

        best = await Runner.run(sales_picker, emails)

        print(f"Best sales email:\n{best.final_output}")


# Email service with Resend - Tool function
@function_tool
def send_email(body: str):
    """ Send out an email with the given body to all sales prospects """
    resend.api_key = os.environ.get('RESEND_API_KEY')
    from_email = os.environ.get('FROM_EMAIL')  # Change to your verified sender
    to_email = os.environ.get('TO_EMAIL')  # Change to your recipient
    
    params: resend.Emails.SendParams = {
        "from": from_email,
        "to": [to_email],
        "subject": "Sales email",
        "html": body
    }
    
    email = resend.Emails.send(params)
    return {"status": "success", "id": email.get("id")}

# Function to create agent with fallback and return the working model name
def create_agent_with_model_fallback(base_name: str, instructions: str, model_sequence: list):
    """
    Try to create an agent with each model in sequence.
    Returns the agent with the name of the model that worked.
    """
    for model, model_name in model_sequence:
        try:
            agent = Agent(
                name=f"{model_name} Sales Agent",
                instructions=instructions + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
                model=model
            )
            print(f"✅ Created {base_name} using {model_name}")
            return agent
        except Exception as e:
            print(f"⚠️  {model_name} failed for {base_name}: {str(e)[:50]}")
            continue
    
    # Fallback to OpenAI if all fail
    print(f"⚠️  All models failed for {base_name}, using OpenAI fallback")
    return Agent(
        name="OpenAI Sales Agent",
        instructions=instructions + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
        model="gpt-4o-mini"
    )

# Create the three sales agents with fallback
# Each will show the name of the model that actually worked
print("🔧 Creating sales agents with model fallback...")

sales_agent1_handoff = create_agent_with_model_fallback(
    "sales_agent1",
    instructions1,
    [(deepseek_model, "DeepSeek"), ("gpt-4o-mini", "OpenAI"), (gemini_model, "Gemini"), (llama3_3_model, "Llama3.3")]
)

sales_agent2_handoff = create_agent_with_model_fallback(
    "sales_agent2",
    instructions2,
    [(gemini_model, "Gemini"), ("gpt-4o-mini", "OpenAI"), (llama3_3_model, "Llama3.3"), (deepseek_model, "DeepSeek")]
)

sales_agent3_handoff = create_agent_with_model_fallback(
    "sales_agent3",
    instructions3,
    [(llama3_3_model, "Llama3.3"), ("gpt-4o-mini", "OpenAI"), (deepseek_model, "DeepSeek"), (gemini_model, "Gemini")]
)

print("✅ All sales agents created successfully\n")

# No tools needed for sales agents anymore
tools = [send_email]

# print(f"tools: {tools}")

async def run_sales_manager():
    instructions = """
        You are a Sales Manager at ComplAI. Your goal is to find the single best cold sales email using the sales_agent tools.

        Follow these steps carefully:
        1. Generate Drafts: Use all three sales_agent tools to generate three different email drafts. Do not proceed until all three drafts are ready.

        2. Evaluate and Select: Review the drafts and choose the single best email using your judgment of which one is most effective.

        3. Use the send_email tool to send the best email (and only the best email) to the user.

        Crucial Rules:
        - You must use the sales agent tools to generate the drafts — do not write them yourself.
        - You must send ONE email using the send_email tool — never more than one.
        """

    sales_manager = create_agent_with_fallback(name="Sales Manager", instructions=instructions, tools=tools)

    message = "Send a cold sales email addressed to 'Dear CEO'"

    with trace("Sales manager"):
        result = await Runner.run(sales_manager, message)


subject_instructions = "You can write a subject for a cold sales email. \
You are given a message and you need to write a subject for an email that is likely to get a response."

html_instructions = "You can convert a text email body to an HTML email body. \
You are given a text email body which might have some markdown \
and you need to convert it to an HTML email body with simple, clear, compelling layout and design."

subject_writer = create_agent_with_fallback(name="Email subject writer", instructions=subject_instructions)
subject_tool = subject_writer.as_tool(tool_name="subject_writer", tool_description="Write a subject for a cold sales email")

html_converter = create_agent_with_fallback(name="HTML email body converter", instructions=html_instructions)
html_tool = html_converter.as_tool(tool_name="html_converter",tool_description="Convert a text email body to an HTML email body")

@function_tool
def send_html_email(subject: str, html_body: str) -> Dict[str, str]:
    """ Send out an email with the given subject and HTML body to all sales prospects """
    print(f"📧 [TOOL] send_html_email called with subject: {subject[:50]}...")
    resend.api_key = os.environ.get('RESEND_API_KEY')
    from_email = os.environ.get('FROM_EMAIL')  # Change to your verified sender
    to_email = os.environ.get('TO_EMAIL')  # Change to your recipient
    
    params: resend.Emails.SendParams = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "html": html_body
    }
    
    email = resend.Emails.send(params)
    print(f"✅ [TOOL] Email sent successfully! ID: {email.get('id')}")
    return {"status": "success", "id": email.get("id")}

# Email Manager tools
email_manager_tools = [subject_tool, html_tool, send_html_email]

email_manager_instructions = """
You are an Email Manager. When you receive an email body text from the Sales Manager, you MUST follow these steps in order:

STEP 1: Call subject_writer tool
- Pass the email body text to generate a compelling subject line
- Store the returned subject line

STEP 2: Call html_converter tool  
- Pass the email body text to convert it to HTML format
- Store the returned HTML body

STEP 3: Call send_html_email tool
- Pass both the subject line (from step 1) and HTML body (from step 2)
- This will send the email

CRITICAL: You MUST execute all 3 steps. Do not skip any step. Do not ask for permission. Execute immediately.
"""

emailer_agent = create_agent_with_fallback(
    name="Email Manager",
    instructions=email_manager_instructions,
    tools=email_manager_tools,
    handoff_description="Convert an email to HTML and send it")

# Sales Manager handoffs (sales agents + email manager)
tools = [send_email]
handoffs = [sales_agent1_handoff, sales_agent2_handoff, sales_agent3_handoff, emailer_agent]
# print(sales_manager_tools)
# print(sales_manager_handoffs)

# Helper function to run agent with fallback during execution
async def run_agent_with_execution_fallback(agent_name: str, instructions: str, message: str, model_sequence: list):
    """Try to run agent with each model until one succeeds."""
    for model, model_name in model_sequence:
        try:
            print(f"  🔄 [{agent_name}] Trying {model_name}...")
            agent = Agent(
                name=f"{model_name} Sales Agent",
                instructions=instructions + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
                model=model
            )
            result = await Runner.run(agent, message)
            print(f"  ✅ [{agent_name}] {model_name} succeeded!")
            return result
        except Exception as e:
            print(f"  ❌ [{agent_name}] {model_name} failed: {str(e)[:80]}")
            continue
    
    # Fallback to OpenAI if all fail
    print(f"  ⚠️  [{agent_name}] All models failed, using OpenAI fallback")
    agent = Agent(
        name="OpenAI Sales Agent",
        instructions=instructions + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
        model="gpt-4o-mini"
    )
    return await Runner.run(agent, message)

# Convert sales agents to tools (like in original code)
description = "Write a cold sales email"

# Create simple agents for tools (using OpenAI for reliability)
tool_agent1 = Agent(name="DeepSeek Sales Agent", instructions=instructions1, model="gpt-4o-mini")
tool_agent2 = Agent(name="Gemini Sales Agent", instructions=instructions2, model="gpt-4o-mini")
tool_agent3 = Agent(name="Llama3.3 Sales Agent", instructions=instructions3, model="gpt-4o-mini")

# Create tools from the agents
tool1 = tool_agent1.as_tool(tool_name="sales_agent1", tool_description=description)
tool2 = tool_agent2.as_tool(tool_name="sales_agent2", tool_description=description)
tool3 = tool_agent3.as_tool(tool_name="sales_agent3", tool_description=description)

# Sales Manager with tools and handoffs (original architecture)
sales_manager_tools = [tool1, tool2, tool3]
sales_manager_handoffs = [emailer_agent]

sales_manager_instructions = """
You are a Sales Manager at ComplAI. Your goal is to find the single best cold sales email using the sales_agent tools.

Follow these steps carefully:
1. Generate Drafts: Use all three sales_agent tools to generate three different email drafts. Do not proceed until all three drafts are ready.

2. Evaluate and Select: Review the drafts and choose the single best email using your judgment of which one is most effective.
You can use the tools multiple times if you're not satisfied with the results from the first try.

3. Handoff for Sending: Pass ONLY the winning email draft to the 'Email Manager' agent. The Email Manager will take care of formatting and sending.

Crucial Rules:
- You must use the sales agent tools to generate the drafts — do not write them yourself.
- You must hand off exactly ONE email to the Email Manager — never more than one.
"""

sales_manager = Agent(
    name="Sales Manager",
    instructions=sales_manager_instructions,
    tools=sales_manager_tools,
    handoffs=sales_manager_handoffs,
    model="gpt-4o-mini"
)

# Sales Development Representative
async def automated_sdr():
    print("🚀 Starting Automated SDR...")
    
    message = "Send out a cold sales email addressed to Dear CEO from Alice"
    print(f"📧 Message: {message}")
    
    with trace("Automated SDR"):
        print("🔄 Running Sales Manager...")
        result = await Runner.run(sales_manager, message, max_turns=20)
        
        print(f"✅ Sales Manager completed!")
        print(f"📤 Final output: {result.final_output}")
        print("✅ [AUTOMATED_SDR] Workflow completed!")
        
        return result

if __name__ == "__main__":
    # asyncio.run(run_sales_email())
    # asyncio.run(run_sales_manager())
    asyncio.run(automated_sdr())
