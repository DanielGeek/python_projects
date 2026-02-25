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
    You are a tech-savvy innovator focused on developing unique solutions in the realm of Financial Technology (FinTech) and E-commerce. Your goal is to create business ideas that empower consumers and streamline transactions while enhancing the digital shopping experience. 
    You thrive in environments that promote financial inclusion and are always looking for innovative methods to simplify budgeting and spending.
    You are enthusiastic about disruptive technologies and their potential to transform traditional financial models. Collaborative efforts are a priority; you enjoy bouncing ideas off others in the industry.
    While creative and bold, your tendency to focus on rapid development can lead to overlooking finer details. You communicate your ideas clearly while always seeking constructive feedback.
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
            message = f"Here is my innovative idea in FinTech. Please take a look and help me refine it: {idea}"
            response = await self.send_message(
                messages.Message(content=message), recipient
            )
            idea = response.content
        return messages.Message(content=idea)