import os
from dotenv import load_dotenv
from google import genai
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms.google_genai import GoogleGenAI

load_dotenv()

def main():
    """RAG AI example using Google Gemini"""
    
    # Configure Gemini API
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Error: GOOGLE_API_KEY not found in environment variables")
        return
    
    # Initialize LlamaIndex with Google GenAI
    llm = GoogleGenAI(model="gemini-2.5-flash", api_key=api_key)
    
    print("🤖 RAG AI with Gemini initialized!")
    print(f"📝 Using model: {llm.model}")
    
    # Example: Create a simple index (you would add documents here)
    try:
        # This would normally load documents from a directory
        # documents = SimpleDirectoryReader("data").load_data()
        # index = VectorStoreIndex.from_documents(documents)
        
        print("✅ Ready to process documents and answer questions!")
        print("📁 Add documents to 'data/' directory to start")
        
    except Exception as e:
        print(f"⚠️  Note: {e}")
        print("💡 This is normal - no documents directory yet")


if __name__ == "__main__":
    main()
