from dotenv import load_dotenv
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.models.ollama import OllamaChatCompletionClient
from autogen_agentchat.messages import TextMessage
from autogen_agentchat.agents import AssistantAgent
from autogen_core import CancellationToken
import os
import sqlite3

load_dotenv(override=True)

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
ollamamodel_client = OllamaChatCompletionClient(model="llama3.2")

message = TextMessage(content="I'd like to go to London", source="user")
print(message)

agent = AssistantAgent(
    name="airline_agent",
    model_client=model_client,
    system_message="You are a helpful assistant for an airline. You give short, humorous answers.",
    model_client_stream=True
)

DATABASE_NAME: str = "tickets.db"

def init_database():
    # Delete existing database file if it exists

    if os.path.exists(DATABASE_NAME):
        os.remove(DATABASE_NAME)

    # Create the database and the table
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute("CREATE TABLE cities (city_name TEXT PRIMARY KEY, round_trip_price REAL)")
    conn.commit()
    conn.close()

# Populate our database
def save_city_price(city_name, round_trip_price):
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute("REPLACE INTO cities (city_name, round_trip_price) VALUES (?, ?)", (city_name.lower(), round_trip_price))
    conn.commit()
    conn.close()

# Method to get price for a city
def get_city_price(city_name: str) -> float | None:
    """ Get the roundtrip ticket price to travel to the city """
    conn = sqlite3.connect(DATABASE_NAME)
    c = conn.cursor()
    c.execute("SELECT round_trip_price FROM cities WHERE city_name = ?", (city_name.lower(),))
    result = c.fetchone()
    conn.close()
    return result[0] if result else None

smart_agent = AssistantAgent(
    name="smart_airline_agent",
    model_client=model_client,
    system_message="You are a helpful assistant for an airline. You give short, humorous answers, including the price of a roundtrip ticket.",
    model_client_stream=True,
    tools=[get_city_price],
    reflect_on_tool_use=True
)

async def main():
    response = await agent.on_messages([message], cancellation_token=CancellationToken())
    print(response.chat_message.content)
    init_database()
    # Some cities!
    save_city_price("London", 299)
    save_city_price("Paris", 399)
    save_city_price("Rome", 499)
    save_city_price("Madrid", 550)
    save_city_price("Barcelona", 580)
    save_city_price("Berlin", 525)
    price = get_city_price("Rome")
    print(f"The price for a round trip to Rome is {price}")

    response = await smart_agent.on_messages([message], cancellation_token=CancellationToken())
    for inner_message in response.inner_messages:
        print(inner_message.content)
    print(response.chat_message.content)
    

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())