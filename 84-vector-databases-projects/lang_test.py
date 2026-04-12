import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")

messages = [
    SystemMessage(content="Translate the following from English to Spanish:"),
    HumanMessage(content="hi, how are you?"),
]

response = model.invoke(messages)
print(response.content)
