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
from typing import Literal
from dotenv import load_dotenv

load_dotenv()

llm = init_chat_model("gpt-4o-mini", temperature=0.0)


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


class RouterState(TypedDict):
    query: str
    query_type: str
    response: str


def demo_basic_routing():

    def classify_query(state: RouterState) -> dict:
        response = llm.invoke(
            f"Classify this query as 'question' or 'command', or 'statement'. "
            f"Reply with just the word.\n\n{state['query']}"
        )
        return {"query_type": response.content.lower().strip()}

    def handle_question(state: RouterState) -> dict:
        response = llm.invoke(f"Answer this question: {state['query']}")
        return {"response": f"[Answer] {response.content}"}

    def handle_command(state: RouterState) -> dict:
        return {"response": f"[Executing] I'll help you with: {state['query']}"}

    def handle_statement(state: RouterState) -> dict:
        return {"response": f"[Acknowledged] Thanks for sharing: {state['query']}"}

    def route_by_type(
        state: RouterState,
    ) -> Literal["question", "command", "statement"]:
        qt = state["query_type"]
        if "question" in qt:
            return "question"
        elif "command" in qt:
            return "command"
        else:
            return "statement"

    graph = StateGraph(RouterState)

    graph.add_node("classify", classify_query)
    graph.add_node("handle_question", handle_question)
    graph.add_node("handle_command", handle_command)
    graph.add_node("handle_statement", handle_statement)

    graph.add_edge(START, "classify")
    graph.add_conditional_edges(
        "classify",  # source node
        route_by_type,  # function that determines which edge to take based on the state
        {
            "question": "handle_question",
            "command": "handle_command",
            "statement": "handle_statement",
        },
    )

    graph.add_edge("handle_question", END)
    graph.add_edge("handle_command", END)
    graph.add_edge("handle_statement", END)

    app = graph.compile()

    # visualize the graph
    print("\n--- Mermaid Graph ---")
    print(app.get_graph().draw_mermaid())

    # save as PNG
    png_bytes = app.get_graph().draw_mermaid_png()
    with open("graph_3.png", "wb") as f:
        f.write(png_bytes)
    print("\nGraph saved to graph_3.png")

    # Example usage
    queries = [
        "What is the capital of Venezuela?",
        "Send an email to John",
        "I love programming",
    ]

    for query in queries:
        result = app.invoke({"query": query})
        print(f"Query: {query}")
        print(f"Type: {result['query_type']}")
        print(f"Response: {result['response']}")
        print("-" * 40)


class QualityState(TypedDict):
    content: str
    quality_score: int
    feedback: str
    final_content: str
    iteration: int


def demo_conditional_loop():

    def evaluate_quality(state: QualityState) -> dict:
        response = llm.invoke(
            f"Rate this content quality from 1-10. Reploy with just the number.\n\n"
            f"Content: {state['content']}"
        )
        try:
            score = int(response.content.strip())
        except:
            score = 5
        return {"quality_score": score}

    def improve_content(state: QualityState) -> dict:
        response = llm.invoke(
            f"Improve this content to be more engaging and clear:\n\n{state['content']}"
        )
        return {
            "content": response.content,
            "iteration": state["iteration"] + 1,
        }

    def finalize_content(state: QualityState) -> dict:
        return {
            "final_content": state["content"],
            "feedback": f"Approved after {state['iteration']} iterations with score {state['quality_score']}",
        }

    def should_continue(state: QualityState) -> Literal["improve", "finalize"]:
        if state["quality_score"] >= 7:
            return "finalize"
        elif state["iteration"] >= 3:
            return "finalize"  # Max iterations
        else:
            return "improve"

    graph = StateGraph(QualityState)

    graph.add_node("evaluate", evaluate_quality)
    graph.add_node("improve", improve_content)
    graph.add_node("finalize", finalize_content)

    graph.add_edge(START, "evaluate")
    graph.add_conditional_edges(
        "evaluate", should_continue, {"improve": "improve", "finalize": "finalize"}
    )

    graph.add_edge("improve", "evaluate")  # Loop back!
    graph.add_edge("finalize", END)

    app = graph.compile()

    # visualize the graph
    print("\n--- Mermaid Graph ---")
    print(app.get_graph().draw_mermaid())

    # save as PNG
    png_bytes = app.get_graph().draw_mermaid_png()
    with open("graph_4.png", "wb") as f:
        f.write(png_bytes)
    print("\nGraph saved to graph_4.png")

    # Example usage
    print("\nConditional Loop Demo:\n")

    result = app.invoke(
        {
            "content": "AI is cool",
            "quality_score": 0,
            "feedback": "",
            "final_content": "",
            "iteration": 0,
        }
    )

    print("Original: AI is cool")
    print(f"Final: {result['final_content'][:200]}...")
    print(f"Feedback: {result['feedback']}")


def demo_multi_path_routing():
    class TaskState(TypedDict):
        task: str
        urgency: str
        complexity: str
        handler: str
        result: str

    def analyze_task(state: TaskState) -> dict:
        # Analyze urgency
        urgency_response = llm.invoke(
            f"Is this task urgent? Reply 'urgent' or 'normal'.\nTask: {state['task']}"
        )

        # Analyze complexity
        complexity_response = llm.invoke(
            f"Is this task complex? Reply 'complex' or 'simple'.\nTask: {state['task']}"
        )

        return {
            "urgency": urgency_response.content.lower().strip(),
            "complexity": complexity_response.content.lower().strip(),
        }

    def urgent_complex_handler(state: TaskState) -> dict:
        return {
            "handler": "Senior Team",
            "result": "Escalated to senior team for immediate action",
        }

    def urgent_simple_handler(state: TaskState) -> dict:
        return {
            "handler": "Quick Response",
            "result": "Handled immediately by available agent",
        }

    def normal_complex_handler(state: TaskState) -> dict:
        return {
            "handler": "Specialist",
            "result": "Assigned to specialist for thorough handling",
        }

    def normal_simple_handler(state: TaskState) -> dict:
        return {
            "handler": "Standard",
            "result": "Added to standard queue",
        }

    def route_task(state: TaskState) -> str:
        is_urgent = "urgent" in state["urgency"]
        is_complex = "complex" in state["complexity"]

        if is_urgent and is_complex:
            return "urgent_complex"
        elif is_urgent:
            return "urgent_simple"
        elif is_complex:
            return "normal_complex"
        else:
            return "normal_simple"

    graph = StateGraph(TaskState)

    graph.add_node("analyze", analyze_task)
    graph.add_node("urgent_complex", urgent_complex_handler)
    graph.add_node("urgent_simple", urgent_simple_handler)
    graph.add_node("normal_complex", normal_complex_handler)
    graph.add_node("normal_simple", normal_simple_handler)

    graph.add_edge(START, "analyze")
    graph.add_conditional_edges(
        "analyze",
        route_task,
        {
            "urgent_complex": "urgent_complex",
            "urgent_simple": "urgent_simple",
            "normal_complex": "normal_complex",
            "normal_simple": "normal_simple",
        },
    )

    for node in ["urgent_complex", "urgent_simple", "normal_complex", "normal_simple"]:
        graph.add_edge(node, END)

    app = graph.compile()

    # visualize the graph
    print("\n--- Mermaid Graph ---")
    print(app.get_graph().draw_mermaid())

    # save as PNG
    png_bytes = app.get_graph().draw_mermaid_png()
    with open("graph_5.png", "wb") as f:
        f.write(png_bytes)
    print("\nGraph saved to graph_5.png")

    print("\nMulti-Path Routing Demo:\n")

    tasks = [
        "Server is down! Need immediate fix!",
        "Update the documentation for the API",
        "Redesing the entire database schema",
        "Fix the typo on the homepage",
    ]

    for task in tasks:
        result = app.invoke({"task": task})
        print(f"Task: {task}")
        print(f"Urgency: {result['urgency']} | Complexity: {result['complexity']}")
        print(f"Handler: {result['handler']}")
        print(f"Result: {result['result']}")
        print("-" * 40)


if __name__ == "__main__":
    # demo_simple_graph()
    # demo_accumulating_state()
    # demo_message_state()
    # exercise_first_langgraph()
    # demo_conversation()
    # demo_basic_routing()
    # demo_conditional_loop()
    demo_multi_path_routing()
