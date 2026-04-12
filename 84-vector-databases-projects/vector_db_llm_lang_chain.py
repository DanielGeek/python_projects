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

# Split text into sentences
text_splitter = RecursiveCharacterTextSplitter(
    separators=["\n\n", "\n"],
    chunk_size=1000,
    chunk_overlap=20,
)

documents_split = text_splitter.split_documents(documents)
print(f"Number of documents after splitting: {len(documents_split)}")

# Get embeddings
embedding = OpenAIEmbeddings(api_key=openai_api_key, model="text-embedding-3-small")

# Next we instantiate the Chroma object from langchain_chroma
persist_directory = "./db/chroma_db_real_world"
vectordb = Chroma.from_documents(
    documents=documents_split,
    embedding=embedding,
    persist_directory=persist_directory,
)  # This will create the Chroma object and persist it to disk

print(vectordb)
