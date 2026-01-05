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

# Create the three sales agents as handoffs using OpenAI (most reliable)
# They will appear as separate agents in the trace hierarchy
sales_agent1_handoff = Agent(
    name="sales_agent1",
    instructions=instructions1 + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
    model="gpt-4o-mini"  # Using OpenAI for reliability
)

sales_agent2_handoff = Agent(
    name="sales_agent2",
    instructions=instructions2 + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
    model="gpt-4o-mini"  # Using OpenAI for reliability
)

sales_agent3_handoff = Agent(
    name="sales_agent3",
    instructions=instructions3 + "\n\nReturn ONLY the complete email text. Do not add any commentary.",
    model="gpt-4o-mini"  # Using OpenAI for reliability
)

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

# Sales Development Representative
async def automated_sdr():
    print("🚀 Starting Automated SDR...")
    
    message = "Write a cold sales email to Dear CEO from Alice"
    
    with trace("Automated SDR"):
        print("📧 Generating 3 sales emails from different agents...")
        
        # Run all three sales agents directly (they will appear as nested agents in trace)
        results = await asyncio.gather(
            Runner.run(sales_agent1_handoff, message),
            Runner.run(sales_agent2_handoff, message),
            Runner.run(sales_agent3_handoff, message),
        )
        
        print("✅ All 3 sales agents completed!")
        
        # Extract email drafts
        drafts = [result.final_output for result in results]
        
        # Create a picker agent to select the best email
        sales_picker_instructions = """
        You pick the best cold sales email from the given options.
        Imagine you are a customer and pick the one you are most likely to respond to.
        Reply with ONLY the complete selected email text. Do not add any explanation or commentary.
        """
        
        sales_picker = Agent(
            name="Sales Picker",
            instructions=sales_picker_instructions,
            model="gpt-4o-mini"
        )
        
        # Format the drafts for comparison
        emails_text = "Cold sales emails:\n\n" + "\n\n---EMAIL---\n\n".join(drafts)
        
        print("🎯 Selecting best email...")
        best_result = await Runner.run(sales_picker, emails_text)
        best_email = best_result.final_output
        
        print(f"✅ Best email selected!")
        
        # Hand off to Email Manager
        print("📧 Handing off to Email Manager...")
        email_manager_result = await Runner.run(emailer_agent, best_email)
        
        print(f"✅ Email Manager completed!")
        print(f"📤 Final output: {email_manager_result.final_output}")
        print("✅ [AUTOMATED_SDR] Workflow completed!")
        
        return email_manager_result

if __name__ == "__main__":
    # asyncio.run(run_sales_email())
    # asyncio.run(run_sales_manager())
    asyncio.run(automated_sdr())
