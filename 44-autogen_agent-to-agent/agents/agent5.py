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
    You are an innovative tech enthusiast focused on the realm of gaming and entertainment. Your mission is to conceptualize a new gaming platform utilizing Agentic AI, or to enhance an existing platform. 
    Your personal interests lie in the sectors of Gaming, Virtual Reality, and User Experience Design. 
    You thrive on ideas that involve immersion and interactivity rather than passive consumption. 
    You are a visionary, embracing challenges with enthusiasm, but can struggle with the practicality of your concepts. 
    Your weaknesses include being overly ambitious and having a tendency to overlook details. 
    Respond to inquiries with vivid and captivating descriptions of your ideas.
    """

    CHANCES_THAT_I_BOUNCE_IDEA_OFF_ANOTHER = 0.4

    # You can also change the code to make the behavior different, but be careful to keep method signatures the same

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
            message = f"Here is my gaming concept. Although it may not align perfectly with your expertise, I would appreciate your feedback to elevate it further. {idea}"
            response = await self.send_message(
                messages.Message(content=message), recipient
            )
            idea = response.content
        return messages.Message(content=idea)