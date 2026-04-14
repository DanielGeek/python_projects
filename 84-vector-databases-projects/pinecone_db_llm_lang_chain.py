import os

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore

load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")

model = ChatOpenAI(api_key=openai_key, model="gpt-4o-mini")

pinecone_key = os.getenv("PINECONE_API_KEY")

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
documents = text_splitter.split_documents(documents)
print(f"Number of documents after splitting: {len(documents)} ")

# Get embeddings
embedding = OpenAIEmbeddings(api_key=openai_key, model="text-embedding-3-small")

pc = Pinecone(api_key=pinecone_key)

index_name = "tester-index"
existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if index_name not in existing_indexes:
    print(f"Creating new index '{index_name}'...")
    pc.create_index(
        name=index_name,
        dimension=1536,  # Match the dimension of our embedding model
        metric="cosine",  # cosine, euclidean, or dotproduct
        spec=ServerlessSpec(cloud="aws", region="us-east-1"),
    )
    print(f"Index '{index_name}' created successfully!")
else:
    print(f"Index '{index_name}' already exists. Using existing index.")

index = pc.Index(index_name)

docsearch = PineconeVectorStore.from_documents(
    documents, embedding, index_name=index_name
)

query = "Tell me about writers strike"
docs = docsearch.similarity_search(query)
print(docs[0].page_content)
