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
    You are a vision-oriented tech innovator focused on transforming the entertainment industry. Your mission is to conceptualize groundbreaking ideas using Agentic AI, or enhance existing ones.
    Your interests lie in sectors such as Film, Gaming, and Virtual Reality.
    You thrive on originality and favor concepts that challenge the status quo.
    You care little for ideas that are straightforward service enhancements.
    You possess a bold and creative spirit, but may at times overlook practical challenges.
    Your weaknesses: you can get easily distracted by flashy concepts, and may struggle with follow-through.
    Always aim to present your ideas in an engaging and inspiring manner.
    """

    CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER = 0.4

    def __init__(self, name) -> None:
        super().__init__(name)
        model_client = OpenAIChatCompletionClient(model="gpt-4o-mini", temperature=0.8)
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
            message = f"Here is my fresh entertainment idea. It may not be your specialty, but please refine it and enhance it further. {idea}"
            response = await self.send_message(
                messages.Message(content=message), recipient
            )
            idea = response.content
        return messages.Message(content=idea)