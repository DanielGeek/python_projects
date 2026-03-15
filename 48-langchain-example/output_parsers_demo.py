"""
Output Parsers in LangChain V.1
"""

from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_core.messages import (
    SystemMessage,
    HumanMessage,
    AIMessage,
)
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from langchain_core.output_parsers import (
    StrOutputParser,
    JsonOutputParser,
    PydanticOutputParser,
)
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model

load_dotenv()

parser = StrOutputParser()

prompt = ChatPromptTemplate.from_template("write a short poem about {topic}")

llm = init_chat_model(model="gpt-4o-mini", temperature=0)

chain = prompt | llm | parser

response = chain.invoke({"topic": "nature"})

print(type(response))

# JsonOutputParser example
parser = JsonOutputParser()

prompt = ChatPromptTemplate.from_template(
    "Return a JSON object with 'name' and 'age' for: {description}"
)

chain = prompt | llm | parser

response = chain.invoke({"description": "A 25-year-old developer named Alex"})

print(response)


class Person(BaseModel):
    name: str = Field(description="The person's name")
    age: int = Field(description="The age of the person")
    occupation: str = Field(description="The person's occupation")


parser = PydanticOutputParser(pydantic_object=Person)

prompt = ChatPromptTemplate.from_template(
    "Return a JSON object with 'name', 'age', and 'occupation' for: {description}"
).partial(format_instructions=parser.get_format_instructions())

chain = prompt | llm | parser

result = chain.invoke({"description": "A 30-year-old artist named Maria"})

print(result)


# Structured Output
class MoviewReview(BaseModel):
    title: str = Field(description="The title of the movie")
    review: str = Field(description="The review of the movie")
    rating: int = Field(description="The rating of the movie out of 10")


# Bind the schema to the model
structured_model = llm.with_structured_output(MoviewReview)

result = structured_model.invoke("Review: Inception is a mind-binding thriller. 9/10")
print(result)
