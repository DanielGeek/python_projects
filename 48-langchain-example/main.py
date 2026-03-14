from dotenv import load_dotenv
from importlib.metadata import version
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

load_dotenv()

try:
    lg_version = version("langgraph")
    core_version = version("langchain-core")
except Exception:
    lg_version = "unknown"
    core_version = "unknown"

print(f"langchain-core version: {core_version}")
print(f"langgraph version: {lg_version}")


def main():
    # Test OpenAI LLM
    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
    response = llm.invoke("Say 'setup complete!' in one word")
    print(f"Response from ChatOpenAI: {response}")

    # Test Anthropic LLM
    llm_anthropic = ChatAnthropic(
        model_name="claude-sonnet-4-5-20250929", temperature=0
    )
    response_anthropic = llm_anthropic.invoke("Say 'setup complete!' in one word")
    print(f"Response from ChatAnthropic: {response_anthropic}")

    print("Setup complete!")


if __name__ == "__main__":
    main()
