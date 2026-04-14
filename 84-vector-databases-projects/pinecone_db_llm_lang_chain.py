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
from utils import format_docs

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

# Check if index already has vectors
index_stats = index.describe_index_stats()
total_vectors = index_stats.get("total_vector_count", 0)

if total_vectors == 0:
    print(f"Index is empty. Upserting {len(documents)} documents...")
    # Use from_documents to populate the index
    docsearch = PineconeVectorStore.from_documents(
        documents, embedding, index_name=index_name
    )
    print(f"Successfully upserted {len(documents)} documents!")
else:
    print(f"Index already has {total_vectors} vectors. Using existing data.")
    # Connect to existing index
    docsearch = PineconeVectorStore(index=index, embedding=embedding)

retriever = docsearch.as_retriever()


system_prompt = """You are a helpful question-answering assistant.
You have been given context documents. Your job is to summarize and answer using ONLY that context.

STRICT RULES:
1. Read the context carefully and extract relevant information to answer the question.
2. Even if the question is broad (e.g. "tell me about AI"), summarize what the context says about it.
3. NEVER say "I don't know" or "I don't have information" if the context contains ANY related content.
4. Respond in the same language as the question.
5. Keep your answer to 3 sentences maximum.

Context:
{context}
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{question}"),
    ]
)

# Build RAG chain using LCEL (LangChain Expression Language)
rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

question = "Tell me more about AI and ML news"
response = rag_chain.invoke(question)
print("==== Answer ====")
print(response)

# pc.delete_index(index_name)
