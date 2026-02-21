# 37-AutoGen-Agent-Chat-Multi-Modal

A sophisticated multi-modal AI system built with Microsoft AutoGen that can analyze and describe images using structured outputs with Pydantic models.

## 🎯 Overview

This project demonstrates advanced multi-modal AI capabilities by creating an intelligent image description system that can:
- Analyze images from URLs using OpenAI's vision capabilities
- Generate structured descriptions with Pydantic models
- Extract specific attributes (scene, message, style, orientation)
- Provide detailed, organized image analysis
- Support both structured and unstructured output formats

## 🏗️ Architecture

### Components

1. **Multi-Modal Agent** - AI agent with vision capabilities
2. **Pydantic Models** - Structured output validation
3. **Image Processing** - URL-based image loading and conversion
4. **Structured Output** - Type-safe response handling

### Key Features

- ✅ **Multi-Modal Processing**: Image + Text input handling
- ✅ **Structured Outputs**: Pydantic model validation
- ✅ **Vision Analysis**: OpenAI GPT-4o-mini vision capabilities
- ✅ **Type Safety**: Strong typing with Literal types
- ✅ **Formatted Display**: Clean output with text wrapping
- ✅ **Flexible Output**: Both structured and unstructured modes

## 📦 Installation

### Prerequisites

- Python 3.14+
- uv package manager
- OpenAI API key with vision capabilities

### Setup

1. **Clone and navigate to project:**
```bash
cd 37-autogen_agent_chat_multi_modal
```

2. **Install dependencies:**
```bash
uv sync
```

3. **Configure environment variables:**
```bash
# Create .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

## 🚀 Usage

### Running the Application

```bash
uv run main.py
```

### Expected Output

```
Scene:
A professional headshot of a man in a business setting, wearing a collared shirt and looking directly at the camera with a confident expression

Message:
The image conveys professionalism and expertise, representing a software engineer's transition to AI/ML roles, showing career growth and adaptability in the tech industry

Style:
Professional corporate photography with clean lighting and neutral background, typical of LinkedIn-style professional portraits

Orientation:
portrait
```

## 🔧 Configuration

### Structured Output Model

The project uses a Pydantic model for structured image analysis:

```python
class ImageDescription(BaseModel):
    scene: str = Field(description="Briefly, the overall scene of the image")
    message: str = Field(description="The point that the image is trying to convey")
    style: str = Field(description="The artistic style of the image")
    orientation: Literal["portrait", "landscape", "square"] = Field(description="The orientation of the image")
```

### Agent Configuration

Two configuration options are available:

#### Option 1: Basic Description Agent
```python
describer = AssistantAgent(
    name="description_agent",
    model_client=model_client,
    system_message="You are good at describing images in detail",
)
```

#### Option 2: Structured Output Agent (Recommended)
```python
describer = AssistantAgent(
    name="description_agent",
    model_client=model_client,
    system_message="You are good at describing images in detail",
    output_content_type=ImageDescription,  # Structured output
)
```

## 🛠️ Development

### Project Structure

```
37-autogen_agent_chat_multi_modal/
├── main.py              # Multi-modal agent implementation
├── pyproject.toml       # Project dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

### Key Components

#### Multi-Modal Message Creation

```python
# Load image from URL
pil_image = Image.open(BytesIO(requests.get(url).content))
img = AGImage(pil_image)

# Create multi-modal message
multi_modal_message = MultiModalMessage(
    content=["Describe the content of this image in detail", img], 
    source="User"
)
```

#### Structured Output Processing

```python
response = await describer.on_messages([multi_modal_message], cancellation_token=CancellationToken())
reply = response.chat_message.content

# Access structured fields
print(f"Scene:\n{textwrap.fill(reply.scene)}\n\n")
print(f"Message:\n{textwrap.fill(reply.message)}\n\n")
print(f"Style:\n{textwrap.fill(reply.style)}\n\n")
print(f"Orientation:\n{textwrap.fill(reply.orientation)}\n\n")
```

## 🔍 How It Works

1. **Image Loading**: Downloads image from URL using requests
2. **Format Conversion**: Converts PIL Image to AutoGen Image format
3. **Multi-Modal Message**: Combines text prompt with image data
4. **Agent Processing**: Sends to OpenAI GPT-4o-mini for analysis
5. **Structured Output**: Returns validated Pydantic model
6. **Formatted Display**: Clean output with text wrapping

## 📚 Dependencies

```toml
dependencies = [
    "autogen-ext>=0.7.5",        # AutoGen extensions
    "autogen-agentchat>=0.0.1",  # Agent chat framework
    "openai>=1.0.0",             # OpenAI client with vision
    "python-dotenv>=1.2.1",      # Environment variables
    "tiktoken>=0.5.0",           # Tokenization
    "pydantic>=2.0.0",           # Structured data validation
    "pillow>=10.0.0",            # Image processing
    "requests>=2.31.0",          # HTTP requests
]
```

## 🎓 Learning Resources

- [Microsoft AutoGen Documentation](https://microsoft.github.io/autogen/)
- [AutoGen Multi-Modal Capabilities](https://microsoft.github.io/autogen/docs/topics/multi-modal/)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Pillow Image Processing](https://pillow.readthedocs.io/)

## 🚀 Extensions

### Possible Enhancements

1. **Multiple Image Analysis**: Process multiple images in one request
2. **Custom Image Upload**: Local file upload support
3. **Different Output Formats**: JSON, XML, custom templates
4. **Batch Processing**: Process multiple URLs sequentially
5. **Image Metadata**: Extract EXIF data and technical details
6. **Comparison Analysis**: Compare two or more images

### Adding New Analysis Fields

```python
class EnhancedImageDescription(BaseModel):
    scene: str = Field(description="Briefly, the overall scene of the image")
    message: str = Field(description="The point that the image is trying to convey")
    style: str = Field(description="The artistic style of the image")
    orientation: Literal["portrait", "landscape", "square"] = Field(description="The orientation of the image")
    colors: List[str] = Field(description="Dominant colors in the image")
    objects: List[str] = Field(description="Main objects detected")
    mood: str = Field(description="Emotional mood of the image")
```

### Local Image Support

```python
def load_local_image(image_path: str) -> AGImage:
    """Load image from local file system"""
    pil_image = Image.open(image_path)
    return AGImage(pil_image)

# Usage
local_img = load_local_image("path/to/image.jpg")
message = MultiModalMessage(content=["Analyze this image", local_img], source="User")
```

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI Vision Access**:
   - Ensure your API key has vision capabilities enabled
   - Check GPT-4o-mini model availability in your region

2. **Image Loading Errors**:
   - Verify the image URL is accessible
   - Check image format compatibility (JPEG, PNG, WebP, GIF)
   - Ensure image size is within OpenAI limits (20MB)

3. **Structured Output Validation**:
   - Ensure the model response matches Pydantic schema
   - Check field descriptions are clear and specific

4. **Import Errors**:
   - Run `uv sync` to ensure all dependencies are installed
   - Check Python version is 3.14+

### Debug Mode

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Print raw response
response = await describer.on_messages([multi_modal_message], cancellation_token=CancellationToken())
print("Raw response:", response.chat_message.content)
```

## 📄 License

This project is for educational purposes to demonstrate AutoGen multi-modal capabilities.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This is an educational project demonstrating Microsoft AutoGen's multi-modal agent capabilities with structured outputs and vision analysis.
