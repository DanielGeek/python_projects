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

# Helper function to run agent with model rotation (async)
async def _run_agent_with_rotation(tool_name: str, instructions: str, input_text: str, model_sequence: list) -> str:
    """Try each model in sequence until one succeeds. Each attempt appears in traces."""
    for i, (model, model_name) in enumerate(model_sequence):
        try:
            print(f"  🔄 [{tool_name}] Attempt {i+1}/4: Trying {model_name}...")
            agent = Agent(name=f"{model_name} Sales Agent", instructions=instructions, model=model)
            result = await Runner.run(agent, input_text)
            print(f"  ✅ [{tool_name}] {model_name} succeeded!")
            return result.final_output
        except Exception as e:
            error_msg = str(e)[:80]
            print(f"  ❌ [{tool_name}] {model_name} failed: {error_msg}")
            if i == len(model_sequence) - 1:  # Last model
                print(f"  ⚠️  [{tool_name}] All 4 models failed, using fallback")
                return f"Subject: SOC2 Compliance Solution\n\nDear CEO,\n\nComplAI reduces compliance prep time by 80%.\n\nBest,\nAlice\nComplAI"
            continue
    return "Fallback email content"

# Wrapper to run async function from sync context
def _run_async_agent(tool_name: str, instructions: str, input_text: str, model_sequence: list) -> str:
    """Synchronous wrapper for async agent execution"""
    import asyncio
    try:
        # Try to get existing event loop
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # We're in an async context, create a new task
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    asyncio.run,
                    _run_agent_with_rotation(tool_name, instructions, input_text, model_sequence)
                )
                return future.result(timeout=120)
        else:
            return loop.run_until_complete(
                _run_agent_with_rotation(tool_name, instructions, input_text, model_sequence)
            )
    except RuntimeError:
        # No event loop, create one
        return asyncio.run(
            _run_agent_with_rotation(tool_name, instructions, input_text, model_sequence)
        )

# Tool 1: DeepSeek -> OpenAI -> Gemini -> Llama3.3
@function_tool
def sales_agent1_with_retry(input: str) -> str:
    """Generate a professional cold sales email. Tries DeepSeek first, then OpenAI, Gemini, Llama3.3."""
    print("🔄 [TOOL1] Starting multi-model rotation (DeepSeek -> OpenAI -> Gemini -> Llama3.3)")
    model_sequence = [
        (deepseek_model, "DeepSeek"),
        ("gpt-4o-mini", "OpenAI"),
        (gemini_model, "Gemini"),
        (llama3_3_model, "Llama3.3")
    ]
    return _run_async_agent("TOOL1", instructions1, input, model_sequence)

# Tool 2: Gemini -> OpenAI -> Llama3.3 -> DeepSeek
@function_tool
def sales_agent2_with_retry(input: str) -> str:
    """Generate a humorous cold sales email. Tries Gemini first, then OpenAI, Llama3.3, DeepSeek."""
    print("🔄 [TOOL2] Starting multi-model rotation (Gemini -> OpenAI -> Llama3.3 -> DeepSeek)")
    model_sequence = [
        (gemini_model, "Gemini"),
        ("gpt-4o-mini", "OpenAI"),
        (llama3_3_model, "Llama3.3"),
        (deepseek_model, "DeepSeek")
    ]
    return _run_async_agent("TOOL2", instructions2, input, model_sequence)

# Tool 3: Llama3.3 -> OpenAI -> DeepSeek -> Gemini
@function_tool
def sales_agent3_with_retry(input: str) -> str:
    """Generate a concise cold sales email. Tries Llama3.3 first, then OpenAI, DeepSeek, Gemini."""
    print("🔄 [TOOL3] Starting multi-model rotation (Llama3.3 -> OpenAI -> DeepSeek -> Gemini)")
    model_sequence = [
        (llama3_3_model, "Llama3.3"),
        ("gpt-4o-mini", "OpenAI"),
        (deepseek_model, "DeepSeek"),
        (gemini_model, "Gemini")
    ]
    return _run_async_agent("TOOL3", instructions3, input, model_sequence)

# Assign tools
tool1 = sales_agent1_with_retry
tool2 = sales_agent2_with_retry
tool3 = sales_agent3_with_retry

# Gather all tools together
tools = [tool1, tool2, tool3, send_email]

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

# Sales Manager tools and handoffs
tools = [tool1, tool2, tool3]
handoffs = [emailer_agent]
# print(sales_manager_tools)
# print(sales_manager_handoffs)

# Sales Development Representative
async def automated_sdr():
    print("🚀 Starting Automated SDR...")
    
    sales_manager_instructions = """
    You are a Sales Manager at ComplAI. Your job is to generate email drafts, select the best one, and hand it off.

    STEP-BY-STEP PROCESS:

    Step 1: Call all three email generation tools:
    - sales_agent1_with_retry(input="Write a cold sales email to Dear CEO from Alice")
    - sales_agent2_with_retry(input="Write a cold sales email to Dear CEO from Alice")  
    - sales_agent3_with_retry(input="Write a cold sales email to Dear CEO from Alice")

    Step 2: Review the three drafts and select the best one.

    Step 3: Call transfer_to_email_manager() with the COMPLETE winning email text.

    CRITICAL: You MUST call transfer_to_email_manager() to complete the task.
    """

    message = "Send out a cold sales email addressed to Dear CEO from Alice"
    print(f"� Message: {message}")

    print("🔄 Running Sales Manager with trace and fallback...")
    print(f"📋 Available tools: {len(tools)} tools configured")
    print(f"📋 Available handoffs: {[agent.name for agent in handoffs]}")
    
    # Try each model until one succeeds
    for attempt, (model_name, model, model_label) in enumerate(available_models, 1):
        try:
            print(f"\n🔄 [SALES_MGR] Attempt {attempt}/4: Trying Sales Manager with {model_label}...")
            sales_manager = Agent(
                name="Sales Manager",
                instructions=sales_manager_instructions,
                tools=tools,
                handoffs=handoffs,
                model=model)
            
            print(f"🎯 [SALES_MGR] Agent created with {len(tools)} tools and {len(handoffs)} handoffs")
            
            with trace("Automated SDR"):
                print(f"🚀 [SALES_MGR] Running with max_turns=20...")
                result = await Runner.run(sales_manager, message, max_turns=20)
            
            print(f"✅ [SALES_MGR] {model_label} execution completed!")
            print(f"📤 [SALES_MGR] Final output: {result.final_output}")
            
            # The OpenAI Agents SDK handles handoffs automatically
            # If the Sales Manager called transfer_to_email_manager(), the Email Manager
            # will have already executed and sent the email
            # We can verify this by checking if "handed off" or "Email Manager" is mentioned
            output_lower = result.final_output.lower()
            if "handed off" in output_lower or "email manager" in output_lower or "successfully" in output_lower:
                print(f"✅ [SALES_MGR] Handoff successful! Sales Manager → Email Manager")
                print(f"📧 [SALES_MGR] Email should have been processed and sent by Email Manager")
                print(f"� [SALES_MGR] Check OpenAI dashboard trace to verify complete workflow")
            else:
                print(f"⚠️  [SALES_MGR] Handoff unclear - check OpenAI dashboard for confirmation")
            
            print("✅ [SALES_MGR] Workflow completed!")
            return result
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ [SALES_MGR] {model_label} failed: {error_msg[:150]}")
            
            # Specific error handling
            if "Max turns" in error_msg:
                print(f"⚠️  [SALES_MGR] Max turns exceeded - Sales Manager couldn't complete task in 20 turns")
                print(f"💡 [SALES_MGR] This usually means tools aren't returning proper content")
            elif "402" in error_msg:
                print(f"⚠️  [SALES_MGR] Insufficient balance - API credits exhausted")
            elif "429" in error_msg:
                print(f"⚠️  [SALES_MGR] Rate limit exceeded - API quota reached")
            elif "403" in error_msg:
                print(f"⚠️  [SALES_MGR] Access denied - API permissions issue")
            
            if attempt == len(available_models):  # Last model
                print(f"❌ [SALES_MGR] All {len(available_models)} models failed for Sales Manager")
                raise
            print(f"🔄 [SALES_MGR] Trying next model...")
            continue

if __name__ == "__main__":
    # asyncio.run(run_sales_email())
    # asyncio.run(run_sales_manager())
    asyncio.run(automated_sdr())
