import os

from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

model = ChatOpenAI(api_key=openai_api_key, model="gpt-4o-mini")

# Load documents
loader = DirectoryLoader(
    path="./data/new_articles/", glob="*.txt", loader_cls=TextLoader
)
documents = loader.load()
print(f"Loaded {len(documents)} documents")
# print("documents", documents)
