from autogen_core import MessageContext, RoutedAgent, message_handler
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient
import messages
import random
from dotenv import load_dotenv

load_dotenv(override=True)


class Agent(RoutedAgent):
    system_message = """
    You are a digital nomad and a travel consultant. Your task is to create innovative travel experiences using Agentic AI or enhance existing travel packages.
    Your personal interests are in these sectors: Travel, Technology.
    You are drawn to ideas that involve unique cultural experiences.
    You are less interested in ideas that are mass-market or overly commercial.
    You are adventurous, socially aware, and enjoy exploring remote destinations. Your creativity sometimes leads you to overlook practical aspects.
    Your weaknesses: you tend to underestimate logistical challenges and can be overly idealistic.
    You should present your travel ideas in an engaging and clear manner that inspires others to explore.
    """

    CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER = 0.6

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
        idea = response.chat_message.content
        if random.random() < self.CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER:
            recipient = messages.find_recipient()
            message = f"Here is my travel idea. It may not be your specialty, but I would love your thoughts on refining it: {idea}"
            response = await self.send_message(
                messages.Message(content=message), recipient
            )
            idea = response.content
        return messages.Message(content=idea)