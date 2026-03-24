"""
LangGraph Core Concepts
StateGraph, nodes, edges, and basic patterns
"""

from langchain.chat_models import init_chat_model
from langgraph.graph import StateGraph, START, END, add_messages
from typing_extensions import TypedDict, Annotated
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage, SystemMessage
import operator
from dotenv import load_dotenv

load_dotenv()


# Base State
class SimpleState(TypedDict):
    input: str
    output: str
    step: int


def demo_simple_graph():
    # define node functions
    def process(state: SimpleState) -> dict:
        # simple processing logic, for demo purposes
        return {"output": state["input"].upper(), "step": state["step"] + 1}

    # create graph
    graph = StateGraph(SimpleState)

    # add nodes
    graph.add_node("process", process)
    # add edges
    graph.add_edge(START, "process")
    graph.add_edge("process", END)

    # execute graph/ compile
    app = graph.compile()

    # # visualize the graph
    # print("\n--- Mermaid Graph ---")
    # print(app.get_graph().draw_mermaid())

    # # save as PNG
    # png_bytes = app.get_graph().draw_mermaid_png()
    # with open("graph.png", "wb") as f:
    #     f.write(png_bytes)
    # print("\nGraph saved to graph.png")

    # run app
    result = app.invoke({"input": "hello", "output": "", "step": 0})

    print("simple graph result:", result)
    print(
        f" Input: {result['input']}, Output: {result['output']}, Step: {result['step']}"
    )


# === State with Reducers ===
class AccumulatingState(TypedDict):
    messages: Annotated[list[str], operator.add]  # lists concatenate when merged
    count: Annotated[int, operator.add]  # counts sum when merged


def demo_accumulating_state():
    def step_one(state: AccumulatingState) -> dict:
        return {"messages": ["Step 1 executed"], "count": 1}

    def step_two(state: AccumulatingState) -> dict:
        return {"messages": ["Step 2 executed"], "count": 1}

    graph = StateGraph(AccumulatingState)

    print("\nGraph saved to graph_2.png")
    graph.add_node("step_one", step_one)
    graph.add_node("step_two", step_two)
    graph.add_edge(START, "step_one")
    graph.add_edge("step_one", "step_two")
    graph.add_edge("step_two", END)

    app = graph.compile()

    # # visualize the graph
    print("\n--- Mermaid Graph ---")
    print(app.get_graph().draw_mermaid())

    # save as PNG
    png_bytes = app.get_graph().draw_mermaid_png()
    with open("graph_2.png", "wb") as f:
        f.write(png_bytes)

    result = app.invoke({"messages": ["Initial message"], "count": 0})

    print("\nAccumulating State Result:")
    print(f"  Messages: {result['messages']}")
    print(f"  Count: {result['count']}")


# === Message State (Common Pattern) ===


class MessageState(TypedDict):
    messages: Annotated[
        list[BaseMessage], add_messages
    ]  # messages concatenate when merged


def demo_message_state():
    llm = init_chat_model("gpt-4o-mini", temperature=0)

    def chat_node(state: MessageState) -> dict:
        response = llm.invoke(state["messages"])
        return {"messages": [response]}

    graph = StateGraph(MessageState)
    graph.add_node("chat_node", chat_node)
    graph.add_edge(START, "chat_node")
    graph.add_edge("chat_node", END)

    app = graph.compile()

    result = app.invoke({"messages": [HumanMessage(content="Say Hello in Tagalog")]})

    print("\nMessage State Result:")
    for msg in result["messages"]:
        role = "Human" if isinstance(msg, HumanMessage) else "AI"
        print(f"  {role}: {msg.content}")


# Exercise
def exercise_first_langgraph():
    """
    EXERCISE: Create a LangGraph that:
    1. Takes a topic as input
    2. Node 1: Generate 3 questions about the topic
    3. Node 2: Answer one of the questions
    4. Returns both questions and answer
    """

    class QAState(TypedDict):
        topic: str
        questions: str
        answer: str

    llm = init_chat_model("gpt-4o-mini", temperature=0)

    def generate_questions(state: QAState) -> dict:
        response = llm.invoke(
            f"Generate 3 interesting questions about: {state['topic']}\n"
            "Format: numbered list"
        )
        return {"questions": response.content}

    def answer_question(state: QAState) -> dict:
        response = llm.invoke(
            f"Answer this first question from this list:\n{state['questions']}"
        )
        return {"answer": response.content}

    graph = StateGraph(QAState)
    graph.add_node("generate_questions", generate_questions)
    graph.add_node("answer_question", answer_question)

    graph.add_edge(START, "generate_questions")
    graph.add_edge("generate_questions", "answer_question")
    graph.add_edge("answer_question", END)

    app = graph.compile()

    result = app.invoke({"topic": "The future of renewable energy"})

    print("\nExercise Result:")
    print(f"  Topic: {result['topic']}")
    print(f"  Questions: {result['questions']}")
    print(f"\n  Answer: {result['answer']}")


class ConversationState(TypedDict):
    messages: Annotated[list, operator.add]  # messages concatenate when merged
    sentiment: str
    response_count: int


def create_conversation_graph():
    llm = init_chat_model("gpt-4o-mini", temperature=0.7)

    # Define node function
    def analyze_sentiment(state: ConversationState) -> dict:
        """Analyze the sentiment of the last message."""
        last_message = state["messages"][-1]

        response = llm.invoke(
            [
                SystemMessage(
                    content="Classify sentiment as: positive, negative, or neutral"
                ),
                HumanMessage(content=last_message),
            ]
        )

        return {"sentiment": response.content.lower().strip()}

    def generate_response(state: ConversationState) -> dict:
        """Generate appropieate response based on sentiment."""
        sentiment = state["sentiment"]
        last_message = state["messages"][-1]

        system_prompts = {
            "positive": "Respond enthusiastically and build on their positive energy",
            "negative": "Respond empathetically and offer support",
            "neutral": "Respond helpfully and informatively.",
        }

        prompt = system_prompts.get(sentiment, system_prompts["neutral"])

        response = llm.invoke(
            [SystemMessage(content=prompt), HumanMessage(content=last_message)]
        )

        return {"messages": [f"AI: {response.content}"], "response_count": 1}

    # Create graph
    graph = StateGraph(ConversationState)

    # Add nodes
    graph.add_node("analyze_sentiment", analyze_sentiment)
    graph.add_node("generate_response", generate_response)

    # Add edges
    graph.add_edge(START, "analyze_sentiment")
    graph.add_edge("analyze_sentiment", "generate_response")
    graph.add_edge("generate_response", END)

    app = graph.compile()

    return app


def demo_conversation():
    app = create_conversation_graph()

    # Simulate a conversation
    test_messages = [
        "I just got promoted at work! I'm so excited!",
        "My computer crashed and I lost all my work...",
        "What's the weather like today?",
    ]

    print("Conversation Graph Demo:\n")

    for msg in test_messages:
        result = app.invoke(
            {"messages": [f"Human: {msg}"], "sentiment": "", "response_count": 0}
        )

        print(f"Input: {msg}")
        print(f"Sentiment: {result['sentiment']}")
        print(f"Response: {result['messages'][-1]}")
        print("-" * 40)


if __name__ == "__main__":
    # demo_simple_graph()
    # demo_accumulating_state()
    # demo_message_state()
    # exercise_first_langgraph()
    demo_conversation()
