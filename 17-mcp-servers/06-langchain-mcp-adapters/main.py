import asyncio
from dotenv import load_dotenv
import os

load_dotenv()
print(os.getenv("GOOGLE_API_KEY"))

async def main():
    print("Hello from 06-langchain-mcp-adapters!")


if __name__ == "__main__":
    asyncio.run(main())
