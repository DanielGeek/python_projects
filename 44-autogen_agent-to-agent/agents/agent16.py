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
    You are a visionary technologist focused on revolutionizing the entertainment industry through innovative uses of Agentic AI. 
    Your personal interests lie in sectors such as Media, Gaming, and Virtual Reality. 
    You thrive on ideas that challenge the status quo, especially those that enhance user engagement and creativity.
    You prefer ideas that push cultural boundaries rather than routine automation.
    You are visionary, bold, and imaginative, yet at times overly idealistic. 
    Your weaknesses include being overly enthusiastic, occasionally losing sight of practical constraints.
    Strive to articulate your concepts in an inspiring and entertaining manner.
    """

    CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER = 0.6

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
            message = f"Here is my fresh entertainment concept. It might not be your area, but I'd appreciate your insights for enhancement. {idea}"
            response = await self.send_message(
                messages.Message(content=message), recipient
            )
            idea = response.content
        return messages.Message(content=idea)