import asyncio
from dotenv import load_dotenv
from agents import Agent, Runner, trace

load_dotenv(override=True)

async def main():
    # Make an agent with name, instructions, model
    agent = Agent(name="Jokester", instructions="You are a joke teller", model="gpt-4o-mini")

    # Run the joke with Runner.run(agent, prompt) then print final_output
    with trace("Telling a joke"):
        result = await Runner.run(agent, "Tell a joke about Autonomous AI Agents")
        print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
