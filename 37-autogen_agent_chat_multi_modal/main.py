from io import BytesIO
import requests
from autogen_agentchat.messages import TextMessage, MultiModalMessage
from autogen_core import Image as AGImage
from PIL import Image
from dotenv import load_dotenv
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_core import CancellationToken
from IPython.display import display, Markdown
from pydantic import BaseModel, Field
from typing import Literal
import textwrap

load_dotenv(override=True)

url = "https://edwarddonner.com/wp-content/uploads/2024/10/from-software-engineer-to-AI-DS.jpeg"

pil_image = Image.open(BytesIO(requests.get(url).content))
img = AGImage(pil_image)

multi_modal_message = MultiModalMessage(content=["Describe the content of this image in detail", img], source="User")

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

class ImageDescription(BaseModel):
    scene: str = Field(description="Briefly, the overall scene of the image")
    message: str = Field(description="The point that the image is trying to convey")
    style: str = Field(description="The artistic style of the image")
    orientation: Literal["portrait", "landscape", "square"] = Field(description="The orientation of the image")

# Example 1:
# describer = AssistantAgent(
#     name="description_agent",
#     model_client=model_client,
#     system_message="You are good at describing images in detail",
# )

# Example 2:
describer = AssistantAgent(
    name="description_agent",
    model_client=model_client,
    system_message="You are good at describing images in detail",
    output_content_type=ImageDescription, # optional type of the output
)

async def main():
    # print(img)
    response = await describer.on_messages([multi_modal_message], cancellation_token=CancellationToken())
    reply = response.chat_message.content
    # example 1
    # print("\n" + "="*50)
    # print("📝 IMAGE DESCRIPTION:")
    # print("="*50)
    # print(reply)
    # display(Markdown(reply)) # notebooks Jupyter
    # print("="*50)

    print(f"Scene:\n{textwrap.fill(reply.scene)}\n\n")
    print(f"Message:\n{textwrap.fill(reply.message)}\n\n")
    print(f"Style:\n{textwrap.fill(reply.style)}\n\n")
    print(f"Orientation:\n{textwrap.fill(reply.orientation)}\n\n")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
