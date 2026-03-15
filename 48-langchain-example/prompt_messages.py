from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from langchain.chat_models import init_chat_model
from langchain_core.messages import (
    AIMessage,
    ChatMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)

load_dotenv()

# # chatprompttemplate
# prompt = ChatPromptTemplate.from_template("Tell me a {adjective} joke about {topic}.")

# # format and inspect
# messages = prompt.format_messages(adjective="funny", topic="chickens")

# print(messages)

# multi-message template
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant that translates {input_language} to {output_language}",
        ),
        ("human", "Translate the following text: {text}"),
    ]
)

messages = prompt.format_messages(
    input_language="English", output_language="Spanish", text="I love programming."
)

# print(messages)

# model = init_chat_model(model="gpt-4o-mini", temperature=0)
# response = model.invoke(messages)
# print(response.content)

# Message Types:
messages = [
    HumanMessage(content="Hello"),
    AIMessage(content="Hi there! How can I assit your today?"),
    SystemMessage(content="This is a system message."),
    ToolMessage(content="Tool executed successfully.", tool_call_id="1"),
    ChatMessage(content="This is a general chat message.", role="user"),
]

examples = [
    {"input": "happy", "output": "sad"},
    {"input": "tall", "output": "short"},
]

example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)

fewshot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "Give the opposite of each word."),
        fewshot_prompt,
        ("human", "{input}"),
    ]
)

# model = init_chat_model(model="gpt-4o-mini", temperature=0)
# response = model.invoke(final_prompt.format_messages(input="happy"))
# print(response.content)

# Reusable components
system_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a {role}."),
    ]
)

user_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{question}"),
    ]
)

# Combine
full_prompt = system_prompt + user_prompt

fin = full_prompt.format_messages(role="helpfull assistant", question="What is AI?")

print(fin)
