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
gemini_model = OpenAIChatCompletionsModel(model="gemini-2.0-flash", openai_client=gemini_client)
llama3_3_model = OpenAIChatCompletionsModel(model="llama-3.3-70b-versatile", openai_client=groq_client)

sales_agent1 = Agent(name="DeepSeek Sales Agent", instructions=instructions1, model=deepseek_model)
sales_agent2 =  Agent(name="Gemini Sales Agent", instructions=instructions2, model=gemini_model)
sales_agent3  = Agent(name="Llama3.3 Sales Agent",instructions=instructions3,model=llama3_3_model)

async def run_sales_email():
    result = Runner.run_streamed(sales_agent1, input="Write a cold sales email")
    async for event in result.stream_events():
        if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
            print(event.data.delta, end="", flush=True)

    message = "Write a cold sales email"

    with trace("Parallel cold emails"):
        results = await asyncio.gather(
            Runner.run(sales_agent1, message),
            Runner.run(sales_agent2, message),
            Runner.run(sales_agent3, message),
        )

    outputs = [result.final_output for result in results]

    for output in outputs:
        print(output + "\n\n")

    sales_picker = Agent(
        name="sales_picker",
        instructions="You pick the best cold sales email from the given options. \
        Imagine you are a customer and pick the one you are most likely to respond to. \
        Do not give an explanation; reply with the selected email only.",
        model="gpt-4o-mini"
    )

    message = "Write a cold sales email"

    with trace("Selection from sales people"):
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

# print(send_email)

# Convert Agents to tools
description = "Write a cold sales email"

tool1 = sales_agent1.as_tool(tool_name="sales_agent1", tool_description=description)
tool2 = sales_agent2.as_tool(tool_name="sales_agent2", tool_description=description)
tool3 = sales_agent3.as_tool(tool_name="sales_agent3", tool_description=description)

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

    sales_manager = Agent(name="Sales Manager", instructions=instructions, tools=tools, model="gpt-4o-mini")

    message = "Send a cold sales email addressed to 'Dear CEO'"

    with trace("Sales manager"):
        result = await Runner.run(sales_manager, message)


subject_instructions = "You can write a subject for a cold sales email. \
You are given a message and you need to write a subject for an email that is likely to get a response."

html_instructions = "You can convert a text email body to an HTML email body. \
You are given a text email body which might have some markdown \
and you need to convert it to an HTML email body with simple, clear, compelling layout and design."

subject_writer = Agent(name="Email subject writer", instructions=subject_instructions, model="gpt-4o-mini")
subject_tool = subject_writer.as_tool(tool_name="subject_writer", tool_description="Write a subject for a cold sales email")

html_converter = Agent(name="HTML email body converter", instructions=html_instructions, model="gpt-4o-mini")
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

tools = [subject_tool, html_tool, send_html_email]
# print(tools)

instructions ="You are an email formatter and sender. You receive the body of an email to be sent. \
You first use the subject_writer tool to write a subject for the email, then use the html_converter tool to convert the body to HTML. \
Finally, you use the send_html_email tool to send the email with the subject and HTML body."


emailer_agent = Agent(
    name="Email Manager",
    instructions=instructions,
    tools=tools,
    model="gpt-4o-mini",
    handoff_description="Convert an email to HTML and send it")

tools = [tool1, tool2, tool3]
handoffs = [emailer_agent]
# print(tools)
# print(handoffs)

# Sales Development Representative
async def automated_sdr():
    print("🚀 Starting Automated SDR...")
    
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

    print("📋 Creating Sales Manager agent...")
    sales_manager = Agent(
        name="Sales Manager",
        instructions=sales_manager_instructions,
        tools=tools,
        handoffs=handoffs,
        model="gpt-4o-mini")

    message = "Send out a cold sales email addressed to Dear CEO from Alice"
    print(f"📧 Message: {message}")

    print("🔄 Running Sales Manager with trace...")
    with trace("Automated SDR"):
        result = await Runner.run(sales_manager, message)
    
    print(f"📤 Sales Manager result: {result.final_output}")
    
    # Check if handoff occurred and continue with Email Manager
    if result.handoffs and len(result.handoffs) > 0:
        print("🔄 Handoff detected! Continuing with Email Manager...")
        handoff_agent = result.handoffs[0].agent
        handoff_result = await Runner.run(handoff_agent, result.final_output)
        print(f"✅ Email Manager result: {handoff_result.final_output}")
        return handoff_result
    else:
        print("❌ No handoff occurred")
        return result

if __name__ == "__main__":
    asyncio.run(run_sales_email())
    asyncio.run(run_sales_manager())
    asyncio.run(automated_sdr())
