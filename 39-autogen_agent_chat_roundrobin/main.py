import asyncio
import logging
import os
import sys

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.tools.langchain import LangChainToolAdapter
from dotenv import load_dotenv
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.tools import tool

load_dotenv(override=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Initialize Serper globally for the tool
serper = GoogleSerperAPIWrapper()


@tool
def internet_search(query: str) -> str:
    """Useful for when you need to search the internet."""
    try:
        logger.info(f"Executing internet search for query: {query}")
        return serper.run(query)
    except Exception as e:
        logger.error(f"Error during internet search: {e}", exc_info=True)
        return f"Error executing search: {str(e)}"


class FlightResearchSystem:
    """A system that manages agents to research flight deals using Serper and OpenAI."""

    def __init__(self, model_name: str = "gpt-4o-mini", max_turns: int = 20) -> None:
        """
        Initialize the FlightResearchSystem.

        Args:
            model_name: The OpenAI model to use for the agents.
            max_turns: Maximum number of conversation turns before termination.
        """
        self._validate_environment()
        self.model_name = model_name
        self.max_turns = max_turns
        self.model_client = OpenAIChatCompletionClient(model=self.model_name)
        self.team = self._setup_team()

    @staticmethod
    def _validate_environment() -> None:
        """Validate required environment variables."""
        required_vars = ["OPENAI_API_KEY", "SERPER_API_KEY"]
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        
        if missing_vars:
            error_msg = f"Missing required environment variables: {', '.join(missing_vars)}"
            logger.error(error_msg)
            raise EnvironmentError(error_msg)
        
        logger.info("Environment validation successful.")

    def _setup_team(self) -> RoundRobinGroupChat:
        """
        Configure the agents and the group chat team.

        Returns:
            RoundRobinGroupChat: The configured multi-agent team.
        """
        autogen_serper = LangChainToolAdapter(internet_search)

        primary_agent = AssistantAgent(
            "primary",
            model_client=self.model_client,
            tools=[autogen_serper],
            system_message=(
                "You are a helpful AI research assistant who looks for promising deals on flights. "
                "Incorporate any feedback you receive."
            ),
        )

        evaluation_agent = AssistantAgent(
            "evaluator",
            model_client=self.model_client,
            system_message="Provide constructive feedback. Respond with 'APPROVE' when your feedback is addressed.",
        )

        text_termination = TextMentionTermination("APPROVE")

        return RoundRobinGroupChat(
            [primary_agent, evaluation_agent],
            termination_condition=text_termination,
            max_turns=self.max_turns,
        )

    async def run(self, task_prompt: str) -> None:
        """
        Execute the research task.

        Args:
            task_prompt: The prompt describing the research task.
        """
        logger.info("Starting the research task...")
        try:
            result = await self.team.run(task=task_prompt)
            logger.info("Task completed. Printing results:")
            print("\n" + "="*50 + "\n")
            for message in result.messages:
                print(f"[{message.source.upper()}]:\n{message.content}\n")
            print("="*50 + "\n")
        except Exception as e:
            logger.error(f"An error occurred during task execution: {e}", exc_info=True)
            raise


async def main() -> None:
    prompt = (
        "Find a one-way non-stop flight from JFK to LHR in June 2026.\n\n"
        "IMPORTANT: When you provide your answer, you MUST:\n"
        "1. Focus ONLY on non-stop flights for June 2026\n"
        "2. Organize the information in a clear, structured format with bullet points\n"
        "3. List airlines with their specific prices (e.g., British Airways: $518, United: $516)\n"
        "4. Remove any irrelevant information about other dates or flights with stops\n"
        "5. Present the information professionally, NOT as raw search results\n"
        "6. Include only the most relevant details: airline names, prices, and flight duration\n\n"
        "Example format:\n"
        "**Non-Stop Flights from JFK to LHR in June 2026:**\n"
        "- **British Airways**: Starting at $518 (typical range: $500-$760)\n"
        "- **United Airlines**: Starting at $516\n"
        "- **Flight Duration**: Approximately 7-8 hours"
    )

    try:
        system = FlightResearchSystem()
        await system.run(task_prompt=prompt)
    except Exception as e:
        logger.critical(f"Application failed to start: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
