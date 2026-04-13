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

# Check if vector DB already exists
if os.path.exists(persist_directory):
    print("Loading existing vector database...")
    vectordb = Chroma(
        persist_directory=persist_directory,
        embedding_function=embedding,
    )
else:
    print("Creating new vector database...")
    vectordb = Chroma.from_documents(
        documents=documents_split,
        embedding=embedding,
        persist_directory=persist_directory,
    )  # This will create the Chroma object and persist it to disk


# Now we can query the Chroma object for similar sentences
retriever = vectordb.as_retriever()

# res_docs = retriever.invoke("How much did microsoft raise?", k=2)
# print(res_docs)


# Helper function to format retrieved documents
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


system_prompt = """You are an assistant for question-answering tasks.
Use the following pieces of retrieved context to answer the question.
If you don't know the answer, say that you don't know.
Use three sentences maximum and keep the answer concise.

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

response = rag_chain.invoke("talk about databricks news")

print("==== Answer ====")
print(response)
