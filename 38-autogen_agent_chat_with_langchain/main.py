# AutoGen's wrapper:
from autogen_ext.tools.langchain import LangChainToolAdapter

# LangChain tools:
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_community.agent_toolkits import FileManagementToolkit
# from langchain.agents import Tool # previous version
from langchain_core.tools import tool
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_core import CancellationToken
from IPython.display import display, Markdown
from dotenv import load_dotenv
load_dotenv(override=True)

prompt = """Your task is to find a one-way non-stop flight from JFK to LHR in June 2026.
First search online for promising deals.
Next, write all the deals to a file called flights.md with full details.
Finally, select the one you think is best and reply with a short summary.
Reply with the selected flight only, and only after you have written the details to the file."""


serper = GoogleSerperAPIWrapper()

@tool
def internet_search(query: str) -> str:
    """Useful for when you need to search the internet."""
    return serper.run(query)

autogen_serper = LangChainToolAdapter(internet_search)
autogen_tools = [autogen_serper]

langchain_file_management_tools = FileManagementToolkit(root_dir="sandbox").get_tools()
for toolFileManagement in langchain_file_management_tools:
    autogen_tools.append(LangChainToolAdapter(toolFileManagement))

for toolFileManagement in autogen_tools:
    print("toolFileManagement", toolFileManagement.name, toolFileManagement.description)

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
agent = AssistantAgent(name="searcher", model_client=model_client, tools=autogen_tools, reflect_on_tool_use=True)



async def main():
    message = TextMessage(content=prompt, source="user")
    result = await agent.on_messages([message], cancellation_token=CancellationToken())
    for inner_message in result.inner_messages:
        print(inner_message.content)
    print("\n" + "="*50)
    print("📝 RESULT:")
    print("="*50)
    print(result.chat_message.content)
    # display(Markdown(result.chat_message.content)) # notebooks Jupyter

    message = TextMessage(content="OK proceed", source="user")

    result = await agent.on_messages([message], cancellation_token=CancellationToken())
    for message in result.inner_messages:
        print(message.content)
    # display(Markdown(result.chat_message.content)) # notebooks Jupyter
    print("\n" + "="*50)
    print("📝 RESULT:")
    print("="*50)
    print(result.chat_message.content)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
