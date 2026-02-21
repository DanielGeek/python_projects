from dataclasses import dataclass
from autogen_core import AgentId, MessageContext, RoutedAgent, message_handler
from autogen_core import SingleThreadedAgentRuntime
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient
from dotenv import load_dotenv

load_dotenv(override=True)


@dataclass
class Message:
    content: str


class SimpleAgent(RoutedAgent):
    def __init__(self) -> None:
        super().__init__("Simple")

    @message_handler
    async def on_my_message(self, message: Message, ctx: MessageContext) -> Message:
        return Message(
            content=f"This is {self.id.type}-{self.id.key}. You said '{message.content}' and I disagree."
        )


async def main():
    runtime = SingleThreadedAgentRuntime()
    await SimpleAgent.register(runtime, "simple_agent", lambda: SimpleAgent())

    runtime.start()

    agent_id = AgentId("simple_agent", "default")
    response = await runtime.send_message(Message("Well hi there!"), agent_id)
    print(">>>", response.content)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
