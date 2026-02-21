from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.tools.langchain import LangChainToolAdapter
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv(override=True)

serper = GoogleSerperAPIWrapper()


@tool
def internet_search(query: str) -> str:
    """Useful for when you need to search the internet."""
    return serper.run(query)


autogen_serper = LangChainToolAdapter(internet_search)

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

prompt = """Find a one-way non-stop flight from JFK to LHR in June 2026.

IMPORTANT: When you provide your answer, you MUST:
1. Focus ONLY on non-stop flights for June 2026
2. Organize the information in a clear, structured format with bullet points
3. List airlines with their specific prices (e.g., British Airways: $518, United: $516)
4. Remove any irrelevant information about other dates or flights with stops
5. Present the information professionally, NOT as raw search results
6. Include only the most relevant details: airline names, prices, and flight duration

Example format:
**Non-Stop Flights from JFK to LHR in June 2026:**
- **British Airways**: Starting at $518 (typical range: $500-$760)
- **United Airlines**: Starting at $516
- **Flight Duration**: Approximately 7-8 hours"""

primary_agent = AssistantAgent(
    "primary",
    model_client=model_client,
    tools=[autogen_serper],
    system_message="You are a helpful AI research assistant who looks for promising deals on flights. Incorporate any feedback you receive.",
)

evaluation_agent = AssistantAgent(
    "evaluator",
    model_client=model_client,
    system_message="Provide constructive feedback. Respond with 'APPROVE' when your feedback is addressed.",
)

text_termination = TextMentionTermination("APPROVE")

team = RoundRobinGroupChat(
    [primary_agent, evaluation_agent],
    termination_condition=text_termination,
    max_turns=20,
)


async def main():
    result = await team.run(task=prompt)
    for message in result.messages:
        print(f"{message.source}:\n{message.content}\n\n")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
