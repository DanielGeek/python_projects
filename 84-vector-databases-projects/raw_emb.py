from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = client.embeddings.create(model="text-embedding-3-small", input="Hello world")

print(response)
