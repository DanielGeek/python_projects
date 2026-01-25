from typing import Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from dotenv import load_dotenv
from IPython.display import Image, display
import gradio as gr
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
import random

nouns = ["Cabbages", "Unicorns", "Toasters", "Penguins", "Bananas", "Zombies", "Rainbows", "Eels", "Pickles", "Muffins"]
adjectives = ["outrageous", "smelly", "pedantic", "existential", "moody", "sparkly", "untrustworthy", "sarcastic", "squishy", "haunted"]

load_dotenv(override=True)

class State(BaseModel):
    messages: Annotated[list, add_messages]

graph_builder = StateGraph(State)

def our_first_node(old_state: State) -> State:
    
    reply = f"{random.choice(nouns)} are {random.choice(adjectives)}"
    messages = [{"role": "assistant", "content": reply}]

    new_state = State(messages=messages)

    return new_state

graph_builder.add_node("first_node", our_first_node)
graph_builder.add_edge(START, "first_node")
graph_builder.add_edge("first_node", END)

graph = graph_builder.compile()

def save_graph_image():
    # Generate graph PNG data
    png_data = graph.get_graph().draw_mermaid_png()
    
    # Save to file
    with open("graph.png", "wb") as f:
        f.write(png_data)
    print("🖼️ Graph saved as 'graph.png'")
    
    # Print graph as Mermaid diagram (console-friendly)
    print("\n📊 Graph Structure (Mermaid):")
    print(graph.get_graph().draw_mermaid())
    
    # Print graph information
    print("\n🔍 Graph Details:")
    print(f"Nodes: {list(graph.get_graph().nodes.keys())}")
    print(f"Edges: {list(graph.get_graph().edges)}")
    
    # Also display in console (if supported)
    try:
        display(Image(png_data))
    except:
        print("Display not available in console mode")

def chat(user_input: str, history):
    message = {"role": "user", "content": user_input}
    messages = [message]
    state = State(messages=messages)
    result = graph.invoke(state)
    print(result)
    return result["messages"][-1].content

def main():
    # save_graph_image()
    gr.ChatInterface(chat).launch()

if __name__ == "__main__":
    main()
