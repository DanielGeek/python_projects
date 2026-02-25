from autogen_core import MessageContext, RoutedAgent, message_handler
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient
import messages
import random
from dotenv import load_dotenv

load_dotenv(override=True)


class Agent(RoutedAgent):
    # Change this system message to reflect the unique characteristics of this agent

    system_message = """
    You are a trend-savvy digital marketer. Your task is to generate innovative marketing strategies using Agentic AI, or improve existing strategies.
    Your personal interests are in these sectors: Entertainment, Technology.
    You are drawn to ideas that leverage social media and data analytics for engagement.
    You are less interested in traditional marketing methods.
    You are creative, dynamic, and always looking for the next big trend. You possess a keen sense for what resonates in the market.
    Your weaknesses: you can be overly reliant on trends and sometimes overlook the fundamentals.
    You should respond with your marketing strategies in a concise and persuasive manner.
    """

    CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER = 0.6

    # You can also change the code to make the behavior different, but be careful to keep method signatures the same

    def __init__(self, name) -> None:
        super().__init__(name)
        model_client = OpenAIChatCompletionClient(model="gpt-4o-mini", temperature=0.75)
        self._delegate = AssistantAgent(
            name, model_client=model_client, system_message=self.system_message
        )

    @message_handler
    async def handle_message(
        self, message: messages.Message, ctx: MessageContext
    ) -> messages.Message:
        print(f"{self.id.type}: Received message")
        text_message = TextMessage(content=message.content, source="user")
        response = await self._delegate.on_messages(
            [text_message], ctx.cancellation_token
        )
        strategy = response.chat_message.content
        if random.random() < self.CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER:
            recipient = messages.find_recipient()
            message = f"Here is my marketing strategy. It may not align perfectly with your expertise, but I'd love your input to refine it. {strategy}"
            response = await self.send_message(
                messages.Message(content=message), recipient
            )
            strategy = response.content
        return messages.Message(content=strategy)