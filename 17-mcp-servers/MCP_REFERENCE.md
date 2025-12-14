# Model Context Protocol (MCP) - Reference Guide

> **Complete reference for building MCP servers and clients**
> 
> Protocol Revision: 2025-11-25
> 
> Source: https://modelcontextprotocol.io/docs

---

## 📋 Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Core Architecture](#core-architecture)
3. [Three Main Primitives](#three-main-primitives)
4. [Transports](#transports)
5. [Lifecycle](#lifecycle)
6. [Security Best Practices](#security-best-practices)
7. [Authorization with OAuth 2.1](#authorization-with-oauth-21)
8. [Tools Deep Dive](#tools-deep-dive)
9. [Resources Deep Dive](#resources-deep-dive)
10. [Prompts Deep Dive](#prompts-deep-dive)
11. [Advanced Features](#advanced-features)
12. [Implementation Guidelines](#implementation-guidelines)
13. [MCP CLI Tools](#mcp-cli-tools)

---

## What is MCP?

**MCP (Model Context Protocol)** is an open-source standard for connecting AI applications to external systems.

### Key Concept
Think of MCP like a **USB-C port for AI applications**. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems.

### What MCP Enables
- **Data Sources**: Local files, databases, APIs
- **Tools**: Search engines, calculators, external services
- **Workflows**: Specialized prompts, automation

### Use Cases
AI applications like Claude or ChatGPT can connect to:
- File systems for document access
- Databases for data queries
- GitHub for code management
- Slack for team communication
- Calendar systems for scheduling
- Weather APIs for forecasts
- And much more...

---

## Core Architecture

### Components

```
┌─────────────────────────────────────────────────┐
│                    HOST                         │
│  (Claude Desktop, IDEs, AI Applications)        │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │            MCP CLIENT                    │  │
│  │  - Manages connections                   │  │
│  │  - Handles protocol negotiation          │  │
│  │  - Routes requests                       │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      │
                      │ JSON-RPC 2.0
                      │ (stdio or HTTP)
                      │
┌─────────────────────────────────────────────────┐
│              MCP SERVER                         │
│  - Exposes capabilities                         │
│  - Implements protocol                          │
│  - Provides context to AI                       │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Tools   │  │Resources │  │ Prompts  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                      │
                      │
                      ▼
            External Systems
        (APIs, Databases, Files)
```

### Design Principles
1. **Servers as context providers**: Servers expose data and capabilities
2. **Clients as coordinators**: Clients manage server connections and user interactions
3. **Protocol-based communication**: Standardized JSON-RPC 2.0 messages
4. **Capability negotiation**: Clients and servers agree on supported features

---

## Three Main Primitives

MCP servers provide three fundamental building blocks:

| Primitive | Control | Description | Example |
|-----------|---------|-------------|---------|
| **Prompts** | User-controlled | Interactive templates invoked by user choice | Slash commands, menu options |
| **Resources** | Application-controlled | Contextual data attached and managed by the client | File contents, git history |
| **Tools** | Model-controlled | Functions exposed to the LLM to take actions | API POST requests, file writing |

### Control Hierarchy

```
User → Prompts → LLM → Tools → External Systems
         ↑                ↓
         └── Resources ───┘
```

---

## Transports

MCP uses **JSON-RPC 2.0** to encode messages. All messages **MUST** be UTF-8 encoded.

### 1. stdio (Standard Input/Output)

**Most common transport for local servers.**

#### Characteristics:
- Communication over stdin/stdout
- Simple and lightweight
- Works with any language
- Ideal for local development

#### Critical Rules:
- ❌ **NEVER write to stdout** (corrupts JSON-RPC messages)
- ❌ **NO `print()` in Python**
- ❌ **NO `console.log()` in JavaScript**
- ✅ **Use logging libraries** that write to stderr or files

#### Example (Python):
```python
# ❌ BAD - Corrupts stdio communication
print("Processing request")

# ✅ GOOD - Writes to stderr
import logging
logging.basicConfig(level=logging.INFO)
logging.info("Processing request")
```

### 2. Streamable HTTP

**For remote servers and production deployments.**

#### Characteristics:
- HTTP-based communication
- Supports multiple connections
- Resumability and redelivery
- Better for remote/cloud deployments

#### Usage:
- Standard output logging is fine (doesn't interfere with HTTP)
- Requires proper session management
- Supports Server-Sent Events (SSE) for server-to-client messages

### 3. Custom Transports

Clients and servers can implement custom transports in a pluggable fashion.

---

## Lifecycle

MCP defines a rigorous lifecycle for client-server connections:

### Phases

```mermaid
sequenceDiagram
    participant Client
    participant Server

    Note over Client,Server: 1. Initialization Phase
    Client->>Server: initialize request
    Server-->>Client: initialize response
    Client--)Server: initialized notification

    Note over Client,Server: 2. Operation Phase
    rect rgb(200, 220, 250)
        note over Client,Server: Normal protocol operations
        Client->>Server: tools/list
        Server-->>Client: tools list
        Client->>Server: tools/call
        Server-->>Client: tool result
    end

    Note over Client,Server: 3. Shutdown
    Client--)Server: Disconnect
    Note over Client,Server: Connection closed
```

### 1. Initialization

**Capability negotiation and protocol version agreement**

```json
// Client sends initialize request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-11-25",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {}
    },
    "clientInfo": {
      "name": "ExampleClient",
      "version": "1.0.0"
    }
  }
}

// Server responds with capabilities
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-11-25",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {}
    },
    "serverInfo": {
      "name": "ExampleServer",
      "version": "1.0.0"
    }
  }
}

// Client confirms initialization
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized"
}
```

### 2. Operation

Normal protocol communication:
- List available tools/resources/prompts
- Call tools
- Read resources
- Get prompts
- Handle notifications

### 3. Shutdown

Graceful termination:
- Client disconnects
- Server cleans up resources
- Connection closed

---

## Security Best Practices

### Key Principles

1. **Least Privilege**: Grant minimal necessary permissions
2. **Input Validation**: Validate all inputs from clients and LLMs
3. **Authentication**: Verify client identity when needed
4. **Authorization**: Control access to sensitive operations
5. **Audit Logging**: Track all operations for security review

### Common Attacks and Mitigations

#### 1. Confused Deputy Problem

**Problem**: Server performs actions on behalf of a client without proper authorization.

**Mitigation**:
- Implement proper authorization checks
- Use OAuth 2.0 for user authentication
- Validate token audience and scope
- Never blindly trust client requests

#### 2. Token Passthrough

**Problem**: Passing tokens between services without validation.

**Mitigation**:
- Validate tokens at each service boundary
- Use token binding to prevent theft
- Implement proper token audience validation

#### 3. Session Hijacking

**Problem**: Attacker steals session credentials.

**Mitigation**:
- Use secure transport (HTTPS for HTTP transport)
- Implement session timeouts
- Rotate credentials regularly
- Use secure session storage

#### 4. Local MCP Server Compromise

**Problem**: Malicious local server exploits client trust.

**Mitigation**:
- Implement server verification
- Use sandboxing for untrusted servers
- Require user approval for sensitive operations
- Audit server behavior

### Scope Minimization

Always request the minimum necessary scope:

```json
// ❌ BAD - Too broad
{
  "scope": "read write delete admin"
}

// ✅ GOOD - Minimal necessary
{
  "scope": "read:weather"
}
```

---

## Authorization with OAuth 2.1

**Secure access to MCP servers using OAuth 2.1 authorization flows.**

### When to Use Authorization

Authorization is **optional** but strongly recommended when:

- Your server accesses user-specific data (emails, documents, databases)
- You need to audit who performed which actions
- Your server grants access to APIs requiring user consent
- Building for enterprise environments with strict access controls
- Implementing rate limiting or usage tracking per user

### Authorization Flow Overview

```mermaid
sequenceDiagram
    participant Client
    participant MCP Server
    participant Auth Server
    
    Client->>MCP Server: Connect request
    MCP Server-->>Client: 401 + PRM location
    Client->>MCP Server: Fetch PRM document
    MCP Server-->>Client: Resource metadata
    Client->>Auth Server: Fetch AS metadata
    Auth Server-->>Client: OAuth endpoints
    Client->>Auth Server: Register (DCR)
    Auth Server-->>Client: Client credentials
    Client->>Auth Server: Authorization request
    Auth Server-->>Client: Authorization code
    Client->>Auth Server: Exchange code for token
    Auth Server-->>Client: Access token
    Client->>MCP Server: Request + Bearer token
    MCP Server-->>Client: Protected resource
```

### Key Steps

#### 1. Initial Handshake (401 Unauthorized)

Server responds with Protected Resource Metadata (PRM) location:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="mcp",
  resource_metadata="https://your-server.com/.well-known/oauth-protected-resource"
```

#### 2. Protected Resource Metadata Discovery

Client fetches PRM document:

```json
{
  "resource": "https://your-server.com/mcp",
  "authorization_servers": ["https://auth.your-server.com"],
  "scopes_supported": ["mcp:tools", "mcp:resources"]
}
```

#### 3. Authorization Server Discovery

Client discovers AS capabilities via OIDC Discovery or OAuth 2.0 AS Metadata:

```json
{
  "issuer": "https://auth.your-server.com",
  "authorization_endpoint": "https://auth.your-server.com/authorize",
  "token_endpoint": "https://auth.your-server.com/token",
  "registration_endpoint": "https://auth.your-server.com/register"
}
```

#### 4. Client Registration

**Pre-registration** or **Dynamic Client Registration (DCR)**:

```json
{
  "client_name": "My MCP Client",
  "redirect_uris": ["http://localhost:3000/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"]
}
```

#### 5. User Authorization

OAuth 2.1 authorization code with PKCE flow:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "def502...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

#### 6. Authenticated Requests

```http
GET /mcp HTTP/1.1
Host: your-server.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

### Python Implementation with FastMCP

```python
from pydantic import AnyHttpUrl
from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.server.auth.settings import AuthSettings
from mcp.server.fastmcp import FastMCP

class SimpleTokenVerifier(TokenVerifier):
    """Token verifier implementation."""
    
    async def verify_token(self, token: str) -> AccessToken | None:
        # Implement token validation logic
        # Options:
        # 1. Token introspection (RFC 7662)
        # 2. JWT validation with public keys
        # 3. Third-party library validation
        pass

# Create FastMCP server with authorization
mcp = FastMCP(
    "Protected Server",
    json_response=True,
    token_verifier=SimpleTokenVerifier(),
    auth=AuthSettings(
        issuer_url=AnyHttpUrl("https://auth.example.com"),
        resource_server_url=AnyHttpUrl("http://localhost:3000"),
        required_scopes=["mcp:tools"],
    ),
)

@mcp.tool()
async def protected_tool(data: str) -> str:
    """Tool requiring authentication."""
    return f"Processed: {data}"
```

### Token Introspection Example

```python
import httpx
from mcp.server.auth.provider import AccessToken, TokenVerifier
from mcp.shared.auth_utils import check_resource_allowed

class IntrospectionTokenVerifier(TokenVerifier):
    """Verify tokens via OAuth 2.0 Token Introspection (RFC 7662)."""
    
    def __init__(
        self,
        introspection_endpoint: str,
        server_url: str,
        client_id: str,
        client_secret: str,
    ):
        self.introspection_endpoint = introspection_endpoint
        self.server_url = server_url
        self.client_id = client_id
        self.client_secret = client_secret
    
    async def verify_token(self, token: str) -> AccessToken | None:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.introspection_endpoint,
                data={
                    "token": token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            if response.status_code != 200:
                return None
            
            data = response.json()
            
            if not data.get("active", False):
                return None
            
            # Validate audience
            aud = data.get("aud")
            if not aud:
                return None
            
            audiences = [aud] if isinstance(aud, str) else aud
            allowed = any(
                check_resource_allowed(self.server_url, a)
                for a in audiences
            )
            
            if not allowed:
                return None
            
            return AccessToken(
                token=token,
                client_id=data.get("client_id", "unknown"),
                scopes=data.get("scope", "").split() if data.get("scope") else [],
                expires_at=data.get("exp"),
                resource=data.get("aud"),
            )
```

### Security Best Practices for Authorization

#### Critical Rules

1. **Use well-tested libraries** - Don't implement token validation from scratch
2. **Short-lived access tokens** - Minimize exposure window if stolen
3. **Always validate tokens** - Verify signature, expiration, audience, scopes
4. **Secure token storage** - Encrypted storage with proper access controls
5. **HTTPS in production** - Never accept tokens over plain HTTP (except localhost dev)
6. **Least-privilege scopes** - Split access per tool/capability, verify per route
7. **Never log credentials** - Scrub `Authorization` headers, tokens, secrets
8. **Separate credentials** - Don't reuse server client secret for user flows
9. **Proper 401 challenges** - Include `WWW-Authenticate` with `Bearer` and `resource_metadata`
10. **Audience validation** - Require audience to match your configured server URL

#### Common Pitfalls

- **DCR without controls** - Unauthenticated DCR allows anyone to register clients
- **Multi-tenant mix-ups** - Pin to single issuer/tenant, reject tokens from other realms
- **Generic audiences** - Don't accept `api` or unrelated resources as audience
- **Error detail leakage** - Return generic messages to clients, log details internally
- **Session ID as auth** - Never tie authorization to `Mcp-Session-Id`

### Testing with Keycloak

```bash
# Start Keycloak container for testing
docker run -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak start-dev
```

Access at `http://localhost:8080` and configure:

1. Create `mcp:tools` scope
2. Set scope type to **Default**
3. Enable **Include in token scope**
4. Add **Audience** mapper with your server URL
5. Configure **Trusted Hosts** for DCR
6. Create server client for token introspection

### Related Standards

- **[OAuth 2.1](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-13)** - Core authorization framework
- **[RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414)** - Authorization Server Metadata
- **[RFC 7591](https://datatracker.ietf.org/doc/html/rfc7591)** - Dynamic Client Registration
- **[RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728)** - Protected Resource Metadata
- **[RFC 8707](https://datatracker.ietf.org/doc/html/rfc8707)** - Resource Indicators
- **[RFC 7662](https://datatracker.ietf.org/doc/html/rfc7662)** - Token Introspection

---

## Tools Deep Dive

**Tools enable models to interact with external systems.**

### Characteristics

- Uniquely identified by name
- Include metadata describing schema
- Can be called by language models
- Require user approval for execution

### Tool Definition

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool(name="get-weather")
async def get_weather(latitude: float, longitude: float) -> str:
    """Get weather forecast for coordinates.
    
    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
    
    Returns:
        Weather forecast as formatted text
    """
    # Implementation
    return "Sunny, 72°F"
```

### Tool Naming Convention

**Use kebab-case for tool names:**
- ✅ `get-weather`
- ✅ `search-database`
- ✅ `send-email`
- ❌ `getWeather` (camelCase)
- ❌ `get_weather` (snake_case)

### Protocol Messages

#### List Tools

```json
// Request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get-weather",
        "description": "Get weather forecast for coordinates",
        "inputSchema": {
          "type": "object",
          "properties": {
            "latitude": {
              "type": "number",
              "description": "Latitude of the location"
            },
            "longitude": {
              "type": "number",
              "description": "Longitude of the location"
            }
          },
          "required": ["latitude", "longitude"]
        }
      }
    ]
  }
}
```

#### Call Tool

```json
// Request
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "get-weather",
    "arguments": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Sunny, 72°F with light winds"
      }
    ],
    "isError": false
  }
}
```

### Best Practices

1. **Clear naming**: Use descriptive, action-oriented names
2. **Good descriptions**: Explain what the tool does and when to use it
3. **Proper schemas**: Define input parameters with JSON Schema
4. **Error handling**: Return meaningful error messages
5. **Idempotency**: Make tools safe to retry when possible

---

## Resources Deep Dive

**Resources allow servers to share data that provides context to language models.**

### Characteristics

- Uniquely identified by URI
- Can be files, database schemas, or application-specific data
- Provide context without requiring tool execution
- Support subscriptions for real-time updates

### Resource Types

1. **Text Resources**: Plain text, code, documentation
2. **Binary Resources**: Images, PDFs, other binary data
3. **Structured Data**: JSON, XML, database schemas

### URI Schemes

Common URI schemes for resources:

- `file://` - Local files
- `https://` - Remote HTTP resources
- `git://` - Git repositories
- Custom schemes for application-specific resources

### Protocol Messages

#### List Resources

```json
// Request
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list"
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "resources": [
      {
        "uri": "file:///home/user/document.txt",
        "name": "document.txt",
        "description": "User document",
        "mimeType": "text/plain"
      }
    ]
  }
}
```

#### Read Resource

```json
// Request
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "file:///home/user/document.txt"
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "contents": [
      {
        "uri": "file:///home/user/document.txt",
        "mimeType": "text/plain",
        "text": "Document content here..."
      }
    ]
  }
}
```

### Resource Subscriptions

Clients can subscribe to resource updates:

```json
// Subscribe
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/subscribe",
  "params": {
    "uri": "file:///home/user/document.txt"
  }
}

// Server sends notification when resource changes
{
  "jsonrpc": "2.0",
  "method": "notifications/resources/updated",
  "params": {
    "uri": "file:///home/user/document.txt"
  }
}
```

---

## Prompts Deep Dive

**Prompts provide structured messages and instructions for interacting with language models.**

### Characteristics

- Pre-defined templates
- Can accept arguments for customization
- User-controlled invocation
- Help guide model interactions

### Prompt Definition

```python
@mcp.prompt(name="code-review")
async def code_review_prompt(language: str, code: str) -> str:
    """Generate a code review prompt.
    
    Args:
        language: Programming language
        code: Code to review
    """
    return f"""Please review this {language} code:

```{language}
{code}
```

Provide feedback on:
1. Code quality
2. Best practices
3. Potential bugs
4. Performance improvements
"""
```

### Protocol Messages

#### List Prompts

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "prompts/list"
}
```

#### Get Prompt

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "prompts/get",
  "params": {
    "name": "code-review",
    "arguments": {
      "language": "python",
      "code": "def hello(): print('hi')"
    }
  }
}
```

---

## Advanced Features

### Context Object

The Context object provides access to MCP capabilities in tools and resources:

```python
from mcp.server.fastmcp import Context, FastMCP
from mcp.server.session import ServerSession

mcp = FastMCP("my-server")

@mcp.tool()
async def advanced_tool(data: str, ctx: Context[ServerSession, None]) -> str:
    """Tool with context access."""
    
    # Logging
    await ctx.info("Processing data")
    await ctx.debug(f"Data: {data}")
    await ctx.warning("This is experimental")
    await ctx.error("Error example")
    
    # Progress reporting
    await ctx.report_progress(progress=0.5, total=1.0, message="Half done")
    
    # Read resources
    resource = await ctx.read_resource("file://data.txt")
    
    # Access FastMCP instance
    server_name = ctx.fastmcp.name
    
    # Access session
    await ctx.session.send_resource_list_changed()
    
    return f"Processed: {data}"
```

### Lifespan Context

Initialize resources at startup and share them across tools:

```python
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass

from mcp.server.fastmcp import Context, FastMCP

class Database:
    @classmethod
    async def connect(cls) -> "Database":
        return cls()
    
    async def disconnect(self) -> None:
        pass
    
    def query(self, sql: str) -> str:
        return f"Result for: {sql}"

@dataclass
class AppContext:
    db: Database

@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    """Manage application lifecycle."""
    db = await Database.connect()
    try:
        yield AppContext(db=db)
    finally:
        await db.disconnect()

mcp = FastMCP("My App", lifespan=app_lifespan)

@mcp.tool()
def query_db(sql: str, ctx: Context) -> str:
    """Query database using shared connection."""
    db = ctx.request_context.lifespan_context.db
    return db.query(sql)
```

### Elicitation

Request additional information from users:

```python
from pydantic import BaseModel, Field

class UserPreferences(BaseModel):
    confirm: bool = Field(description="Confirm action?")
    reason: str = Field(description="Reason for action")

@mcp.tool()
async def sensitive_operation(action: str, ctx: Context) -> str:
    """Operation requiring user confirmation."""
    
    # Request user input with validation
    result = await ctx.elicit(
        message=f"Confirm {action}?",
        schema=UserPreferences,
    )
    
    if result.action == "accept" and result.data:
        if result.data.confirm:
            return f"Executed: {action} - {result.data.reason}"
        return "Cancelled by user"
    
    return "Operation cancelled"
```

### URL Elicitation

Direct users to external URLs for OAuth, payments, etc:

```python
import uuid
from mcp.shared.exceptions import UrlElicitationRequiredError
from mcp.types import ElicitRequestURLParams

@mcp.tool()
async def oauth_connect(service: str, ctx: Context) -> str:
    """Connect to service requiring OAuth."""
    
    elicitation_id = str(uuid.uuid4())
    
    # Throw error pattern for required authorization
    raise UrlElicitationRequiredError([
        ElicitRequestURLParams(
            mode="url",
            message=f"Authorization required for {service}",
            url=f"https://{service}.example.com/oauth?id={elicitation_id}",
            elicitationId=elicitation_id,
        )
    ])
```

### Sampling (LLM Interaction)

Tools can interact with LLMs:

```python
from mcp.types import SamplingMessage, TextContent

@mcp.tool()
async def generate_content(topic: str, ctx: Context[ServerSession, None]) -> str:
    """Generate content using LLM sampling."""
    
    result = await ctx.session.create_message(
        messages=[
            SamplingMessage(
                role="user",
                content=TextContent(type="text", text=f"Write about {topic}"),
            )
        ],
        max_tokens=200,
    )
    
    if result.content.type == "text":
        return result.content.text
    
    return str(result.content)
```

### Structured Output

Return validated, typed data:

```python
from pydantic import BaseModel, Field
from typing import TypedDict

# Using Pydantic models
class WeatherData(BaseModel):
    temperature: float = Field(description="Temperature in Celsius")
    condition: str
    humidity: float

@mcp.tool()
def get_weather(city: str) -> WeatherData:
    """Returns structured, validated weather data."""
    return WeatherData(
        temperature=22.5,
        condition="sunny",
        humidity=65.0
    )

# Using TypedDict
class LocationInfo(TypedDict):
    latitude: float
    longitude: float
    name: str

@mcp.tool()
def get_location(address: str) -> LocationInfo:
    """Returns location coordinates."""
    return LocationInfo(
        latitude=51.5074,
        longitude=-0.1278,
        name="London, UK"
    )

# Using dict[str, T]
@mcp.tool()
def get_stats(data_type: str) -> dict[str, float]:
    """Returns statistics."""
    return {"mean": 42.5, "median": 40.0, "std_dev": 5.2}
```

### Icons

Add icons for better UI display:

```python
from mcp.server.fastmcp import Icon

icon = Icon(
    src="icon.png",
    mimeType="image/png",
    sizes="64x64"
)

# Server with icon
mcp = FastMCP(
    "My Server",
    website_url="https://example.com",
    icons=[icon]
)

# Tool with icon
@mcp.tool(icons=[icon])
def my_tool() -> str:
    """Tool with icon."""
    return "result"

# Resource with icon
@mcp.resource("demo://resource", icons=[icon])
def my_resource() -> str:
    """Resource with icon."""
    return "content"
```

### Images

Handle image data automatically:

```python
from PIL import Image as PILImage
from mcp.server.fastmcp import Image

@mcp.tool()
def create_thumbnail(image_path: str) -> Image:
    """Create thumbnail from image."""
    img = PILImage.open(image_path)
    img.thumbnail((100, 100))
    return Image(data=img.tobytes(), format="png")
```

### Completions

Provide argument completion suggestions:

```python
@mcp.resource("repo://{owner}/{repo}")
async def get_repo(owner: str, repo: str) -> str:
    """Get repository information."""
    return f"Repository: {owner}/{repo}"

# Completions are automatically provided based on:
# - Previously resolved values
# - Context from other arguments
# - Server-side logic
```

### Production Configuration

Recommended settings for production:

```python
mcp = FastMCP(
    "Production Server",
    stateless_http=True,      # Better scalability
    json_response=True,        # JSON instead of SSE
    host="0.0.0.0",           # Listen on all interfaces
    port=8000,
    debug=False,              # Disable debug mode
)

@mcp.tool()
def production_tool(data: str) -> str:
    """Production-ready tool."""
    return f"Processed: {data}"

if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

---

## Implementation Guidelines

### Python with FastMCP

```python
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize server
mcp = FastMCP("my-server")

# Define a tool
@mcp.tool(name="my-tool")
async def my_tool(param: str) -> str:
    """Tool description."""
    return f"Result: {param}"

# Define a resource
@mcp.resource("file://data.txt")
async def get_data() -> str:
    """Resource description."""
    return "Resource content"

# Define a prompt
@mcp.prompt(name="my-prompt")
async def my_prompt(arg: str) -> str:
    """Prompt description."""
    return f"Prompt template with {arg}"

# Run server
if __name__ == "__main__":
    mcp.run(transport="stdio")
```

### TypeScript with MCP SDK

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "my-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Define a tool
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "my-tool",
    description: "Tool description",
    inputSchema: {
      type: "object",
      properties: {
        param: { type: "string" }
      }
    }
  }]
}));

server.setRequestHandler("tools/call", async (request) => {
  // Tool implementation
  return {
    content: [{
      type: "text",
      text: "Result"
    }]
  };
});

// Run server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Configuration for Claude Desktop

```json
{
  "mcpServers": {
    "my-server": {
      "command": "/path/to/executable",
      "args": ["arg1", "arg2"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

### Configuration for Windsurf

```json
{
  "mcpServers": {
    "my-server": {
      "command": "executable",
      "args": ["--directory", "/path/to/project"],
      "disabled": false
    }
  }
}
```

---

## Testing MCP Servers

### MCP Inspector

```bash
# Install
npm install -g @modelcontextprotocol/inspector

# Test Python server
mcp-inspector uv run python server.py

# Test TypeScript server
mcp-inspector node build/index.js
```

### Local Test Script (Python)

```python
import json
import subprocess

def test_mcp_server():
    process = subprocess.Popen(
        ["python", "server.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Send initialize request
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2025-11-25",
            "capabilities": {},
            "clientInfo": {"name": "test", "version": "1.0"}
        }
    }
    
    process.stdin.write(json.dumps(request) + "\n")
    process.stdin.flush()
    
    # Read response
    response = process.stdout.readline()
    print(json.loads(response))
```

---

## Common Patterns

### Error Handling

```python
@mcp.tool(name="safe-operation")
async def safe_operation(param: str) -> str:
    """Operation with proper error handling."""
    try:
        # Operation logic
        result = perform_operation(param)
        return result
    except ValueError as e:
        return f"Invalid input: {str(e)}"
    except Exception as e:
        logging.error(f"Operation failed: {e}")
        return "Operation failed. Please try again."
```

### Async Operations

```python
import asyncio
import httpx

@mcp.tool(name="fetch-data")
async def fetch_data(url: str) -> str:
    """Fetch data from external API."""
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=30.0)
        response.raise_for_status()
        return response.text
```

### Progress Notifications

```python
@mcp.tool(name="long-operation")
async def long_operation(items: list[str]) -> str:
    """Long-running operation with progress."""
    total = len(items)
    for i, item in enumerate(items):
        # Send progress notification
        progress = (i + 1) / total
        # Process item
        await process_item(item)
    return f"Processed {total} items"
```

---

## Quick Reference

### Protocol Versions
- Current: `2025-11-25`
- Always negotiate version during initialization

### Message Format
- Protocol: JSON-RPC 2.0
- Encoding: UTF-8
- Transport: stdio or HTTP

### Key Methods
- `initialize` - Start connection
- `tools/list` - List available tools
- `tools/call` - Execute a tool
- `resources/list` - List resources
- `resources/read` - Read resource content
- `prompts/list` - List prompts
- `prompts/get` - Get prompt template

### Status Codes
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## MCP CLI Tools

The MCP Python SDK includes powerful CLI tools for development, testing, and deployment.

### Installation

```bash
# Install MCP with CLI tools
uv add "mcp[cli]"

# Or with pip
pip install "mcp[cli]"
```

### Development Mode (MCP Inspector)

Test and debug your server interactively:

```bash
# Basic usage
uv run mcp dev server.py

# With additional dependencies
uv run mcp dev server.py --with pandas --with numpy

# Mount local code for development
uv run mcp dev server.py --with-editable .

# Specify transport
uv run mcp dev server.py --transport stdio
uv run mcp dev server.py --transport streamable-http
```

The MCP Inspector provides:
- Interactive testing interface
- Real-time request/response viewing
- Tool execution testing
- Resource browsing
- Prompt testing

### Install to Claude Desktop

Automatically configure your server in Claude Desktop:

```bash
# Basic installation
uv run mcp install server.py

# Custom server name
uv run mcp install server.py --name "My Analytics Server"

# With environment variables
uv run mcp install server.py -v API_KEY=abc123 -v DB_URL=postgres://...

# From .env file
uv run mcp install server.py -f .env

# Specify transport
uv run mcp install server.py --transport stdio
```

This command:
1. Creates/updates `claude_desktop_config.json`
2. Configures server with proper paths
3. Sets up environment variables
4. Validates configuration

### Direct Execution

Run your server directly:

```bash
# Run with uv
uv run mcp run server.py

# Or directly with Python
python server.py

# With specific transport
uv run mcp run server.py --transport streamable-http
```

### Testing with MCP Inspector (npm)

For more advanced testing:

```bash
# Install globally
npm install -g @modelcontextprotocol/inspector

# Test Python server
mcp-inspector uv run python server.py

# Test TypeScript server
mcp-inspector node build/index.js

# Test with specific port
mcp-inspector --port 5173 uv run python server.py
```

### Configuration Files

#### Claude Desktop Config Location

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### Example Configuration

```json
{
  "mcpServers": {
    "my-server": {
      "command": "/path/to/uv",
      "args": [
        "run",
        "--directory",
        "/path/to/project",
        "python",
        "server.py"
      ],
      "env": {
        "API_KEY": "your-key",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### Debugging Tips

1. **Check server logs:**
   ```bash
   # Enable debug logging
   export LOG_LEVEL=debug
   uv run mcp dev server.py
   ```

2. **Validate configuration:**
   ```bash
   # Check if server starts
   uv run python server.py
   
   # Test with inspector
   mcp-inspector uv run python server.py
   ```

3. **Common issues:**
   - Server not showing in Claude: Restart Claude Desktop completely
   - Tool calls failing: Check server logs for errors
   - Connection issues: Verify paths in config are absolute

### Best Practices

1. **Development workflow:**
   ```bash
   # 1. Develop with inspector
   uv run mcp dev server.py
   
   # 2. Test thoroughly
   # Use inspector to test all tools/resources
   
   # 3. Install to Claude
   uv run mcp install server.py --name "Production Server"
   ```

2. **Environment management:**
   ```bash
   # Use .env files for secrets
   uv run mcp install server.py -f .env
   
   # Never commit secrets to git
   echo ".env" >> .gitignore
   ```

3. **Production deployment:**
   ```python
   # Use production-ready configuration
   mcp = FastMCP(
       "Production Server",
       stateless_http=True,
       json_response=True,
       debug=False,
   )
   
   if __name__ == "__main__":
       mcp.run(transport="streamable-http")
   ```

---

## Additional Resources

- **Official Docs**: <https://modelcontextprotocol.io/docs>
- **Specification**: <https://modelcontextprotocol.io/specification>
- **GitHub**: <https://github.com/modelcontextprotocol>
- **Python SDK**: <https://github.com/modelcontextprotocol/python-sdk>
- **TypeScript SDK**: <https://github.com/modelcontextprotocol/typescript-sdk>
- **MCP Inspector**: <https://github.com/modelcontextprotocol/inspector>

---

**Last Updated**: December 2025
**Protocol Revision**: 2025-11-25
