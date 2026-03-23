"""
Section 2 Project: AI Research Assistant
Complete RAG system with conversation memory
"""

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import (
    InMemoryChatMessageHistory,
    BaseChatMessageHistory,
)
from langchain_core.documents import Document
from langchain_core.messages import HumanMessage, AIMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_classic.retrievers.multi_query import MultiQueryRetriever
from langchain_classic.retrievers import ContextualCompressionRetriever
from langchain_classic.retrievers.document_compressors import LLMChainExtractor
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv
import json
import shutil
import os


load_dotenv()

default_db_dir = "./db/research_db"


# ============================================================
# Data Models
# ============================================================
class ResearchResponse(BaseModel):
    """Structured response from the research assistant."""

    answer: str = Field(description="The answer to the research question")
    confidence: str = Field(description="high, medium, or low based on source quality")
    sources: List[str] = Field(description="List of source documents used")
    key_quotes: List[str] = Field(
        description="Revelant quotes from sources", default=[]
    )
    follow_up_questions: List[str] = Field(description="Suggested follow-up questions")


# ============================================================
# Research Assistant Class
# ============================================================
class AIResearchAssistant:
    """AI Research Assistant with document ingestion and retrieval."""

    def __init__(
        self,
        persist_directory: str = default_db_dir,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        self.persist_directory = persist_directory

        # 1. Embeddings - turns text into vectors
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

        # 2. Splitter - breaks big docs into chunks
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ", ", " ", ""],
        )

        # 3. Vector Store - stores searches embeddings
        self.vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=self.embeddings,
            collection_name="research_docs",
        )

        self.session_store: Dict[str, InMemoryChatMessageHistory] = {}

        print("Research Assistant initialized")
        print(f"  Vector store: {persist_directory}")
        print(f"  Documents indexed: {self.vectorstore._collection.count()}")

    def add_documents(
        self,
        documents: List[Document],
        source_name: Optional[str] = None,
    ) -> int:
        """Add documents to the research database."""

        # Tag with source name
        if source_name:
            for doc in documents:
                doc.metadata["source"] = source_name

        # Split into chunks
        chunks = self.splitter.split_documents(documents)

        # Timestamp each chunk
        for chunk in chunks:
            chunk.metadata["indexed_at"] = datetime.now().isoformat()

        # Store in vector DB
        self.vectorstore.add_documents(chunks)

        print(f"Added {len(chunks)} chunks from {len(documents)} documents")
        return len(chunks)

    def add_text(self, text: str, source: str, metadata: dict = None) -> int:
        """Add a single text string as a document."""
        doc = Document(
            page_content=text, metadata={"source": source, **(metadata or {})}
        )
        return self.add_documents([doc])

    def add_texts(self, texts: List[str], source: str) -> int:
        """Add multiple text strings from the same source."""
        docs = [Document(page_content=t, metadata={"source": source}) for t in texts]
        return self.add_documents(docs)

    def get_document_count(self) -> int:
        """Get total number of indexed chunks."""
        return self.vectorstore._collection.count()

    def list_sources(self) -> List[str]:
        """List all unique sources in the database."""
        results = self.vectorstore._collection.get()
        sources = set()
        for metadata in results.get("metadatas", []):
            if metadata and "source" in metadata:
                sources.add(metadata["source"])
        return sorted(list(sources))

    def _build_retriever(self):
        """Build a basic similarity retriever."""
        return self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4},
        )

    def _format_docs_for_context(self, docs) -> str:
        """Format retrieved documents into a string for the prompt."""
        if not docs:
            return "No relevant documents found."

        formatted = []
        for i, doc in enumerate(docs):
            source = doc.metadata.get("source", "unknown")
            formatted.append(f"[Source {i + 1}: {source}]\n{doc.page_content}")
        return "\n\n---\n\n".join(formatted)

    def _get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        """Get or create session history."""
        if session_id not in self.session_store:
            self.session_store[session_id] = InMemoryChatMessageHistory()
        return self.session_store[session_id]

    def ask(self, question: str, session_id: str = "default") -> str:
        """Ask a question againts the research documents."""

        history = self._get_session_history(session_id)

        # Step 1: Retrieve relevant chunks
        retriever = self._build_retriever()
        docs = retriever.invoke(question)

        # Step 2: Format into context string
        context = self._format_docs_for_context(docs)

        # Step 3: Build the prompt
        promtp = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """You are an AI Research Assistant. Answer questions
                        based ONLY on the provided context documents.

                        Rules:
                        1. Only use information from the context below
                        2. If the context doesn't have the answer, say so
                        3. Cite which sources you used (e.g. "According to Source 1...")
                        4. Rate your confidence: high, medium, or low""",
                ),
                MessagesPlaceholder(variable_name="history"),
                (
                    "human",
                    """Context documents:
                        {context}

                        Question: {question}

                        Provide a clear answer with source citations.""",
                ),
            ]
        )

        # Step 4: Build and run the chain
        chain = promtp | self.llm | StrOutputParser()

        response = chain.invoke(
            {
                "context": context,
                "question": question,
                "history": history.messages[-10:],  # Last 10 messages for context
            }
        )

        # save this Q&A to history
        history.add_message(HumanMessage(content=question))
        history.add_message(AIMessage(content=response))

        return response

    def clear_session(self, session_id: str) -> None:
        """Clear conversation history for a session."""
        if session_id in self.session_store:
            self.session_store[session_id].clear()
            print(f"Cleared session: {session_id}")

    def get_session_history_display(self, session_id: str) -> list:
        """Get conversation history as readable dicts."""
        if session_id not in self.session_store:
            return []
        return [
            {
                "role": "human" if isinstance(m, HumanMessage) else "assistant",
                "content": m.content,
            }
            for m in self.session_store[session_id].messages
        ]


if __name__ == "__main__":
    # Clean start
    shutil.rmtree(default_db_dir, ignore_errors=True)

    # Initialize
    assistant = AIResearchAssistant()

    # history = assistant._get_session_history("test")
    # print(type(history))
    # print(history.messages)

    # history.add_message(HumanMessage(content="Hello"))
    # history.add_message(AIMessage(content="Hi there!"))
    # print(history.messages)

    # Add research content
    assistant.add_text(
        """
        Attention Mechanisms in Neural Networks

        The attention mechanism was introduced in "Attention Is All You Need"
        by Vaswani et al. (2017). It allows models to focus on relevant parts
        of the input when generating output.

        Key concepts:
        - Query, Key, Value (QKV) triplets
        - Scaled dot-product attention
        - Multi-head attention for parallel processing

        The transformer architecture has become the foundation for modern NLP
        models including BERT, GPT, and T5.
        """,
        source="attention_mechanisms.pdf",
    )

    assistant.add_text(
        """
        Retrieval-Augmented Generation (RAG)

        RAG combines retrieval system with generative models. First introduced
        by Lewis et al. (2020), RAG addresses the limitation of LLMs being
        limited to their training data.

        Components of a RAG system:
        1. Document store with vector embeddings
        2. Retriever to find relevant documents
        3. Generator (LLM) to produce responses

        Benefits include reduce hallucination, up-to-date information,
        and source attribution.
        """,
        source="rag_survey.pdf",
    )

    assistant.add_text(
        """
        LangChain and LangGraph Framework Overview

        LangChain is an open-source framework for building LLM applications.
        Key features include modular components, integration with 50+ LLM
        providers, and built-in RAG utilities.

        LangGraph extends LangChain for stateful applications with
        graph-based state management, support for cycles and loops,
        and human-in-the-loop workflows.
        """,
        source="langchain_docs.md",
    )

    # Prove it worked
    print(f"\nIndexed: {assistant.get_document_count()} chunks")
    print(f"Sources: {assistant.list_sources()}")

    session = "demo"

    # --- Question 1 ---
    print("\n" + "=" * 60)
    print("QUESTION 1")
    print("=" * 60)

    q1 = "What is RAG and what are its main components?"
    print(f"\nUser: {q1}")
    print(f"\nAssistant: {assistant.ask(q1, session)}")

    # --- Question 2: Follow-up (FAILED in previous lesson, works now) ---
    print("\n" + "=" * 60)
    print("QUESTION 2: Follow-up -- this FAILED last lesson!")
    print("=" * 60)

    q2 = "Can you expand on the second component you just mentioned?"
    print(f"\nUser: {q2}")
    print(f"\nAssistant: {assistant.ask(q2, session)}")

    # --- Question 3: References both prior answers ---
    print("\n" + "=" * 60)
    print("QUESTION 3: References the whole conversation")
    print("=" * 60)

    q3 = "How does what we discussed connect to the attention mechanism?"
    print(f"\nUser: {q3}")
    print(f"\nAssistant: {assistant.ask(q3, session)}")

    # --- Show the history ---
    print("\n" + "=" * 60)
    print("CONVERSATION HISTORY (proof it's tracked)")
    print("=" * 60)

    for i, msg in enumerate(assistant.get_session_history_display(session)):
        role = "USER" if msg["role"] == "human" else "AI"
        content = (
            msg["content"][:120] + "..."
            if len(msg["content"]) > 120
            else msg["content"]
        )
        print(f"\n.  {i + 1}. [{role}]: {content}")

    # --- Prove sessions are isolated ---
    print("\n" + "=" * 60)
    print("SESSION ISOLATION")
    print("=" * 60)

    q4 = "What did we discuss so far?"
    print(f"\nUser (session='demo'):   {assistant.ask(q4, 'demo')[:150]}...")
    print(f"\nUser (session='new'):   {assistant.ask(q4, 'new')[:150]}...")
    print("\n'new' session has no idea -- different memory!")

    # Cleanup
    shutil.rmtree(default_db_dir, ignore_errors=True)
