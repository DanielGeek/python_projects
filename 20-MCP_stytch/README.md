# MCP Stytch Integration Project

Complete MCP (Model Context Protocol) server with Stytch authentication, featuring both backend MCP tools and a React frontend integration.

## 🏗️ Architecture

### Backend (FastMCP + Stytch)

- **FastMCP Server**: HTTP transport with JWT authentication
- **Stytch Integration**: OAuth 2.0 + Email Magic Links
- **Database**: SQLAlchemy with SQLite for notes persistence
- **Authentication**: JWT verification with Stytch JWKS

### Frontend (React + Stytch)

- **React 19**: Modern React with Vite
- **Stytch React SDK**: Email Magic Links authentication
- **Environment Variables**: Secure token management

## 🚀 Quick Start

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
uv sync
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your Stytch credentials
```

3. **Start the server**:
```bash
uv run main.py
```

Server runs on: `http://127.0.0.1:8000/mcp`

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your Stytch public token
```

3. **Start the development server**:
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 🔐 Authentication

### Stytch Configuration

1. **Create Stytch Project**:
   - Go to [Stytch Dashboard](https://stytch.com/dashboard)
   - Create new project: "notes-mcp"

2. **Configure OAuth**:
   - Enable OAuth products
   - Add redirect URLs:
     - `http://localhost:5173` (frontend)
     - `http://127.0.0.1:8765/auth/callback` (MCP server)

3. **Get Credentials**:
   - Project ID, Secret, and Public Token
   - Domain: `https://test.stytch.com`

### Environment Variables

**Backend (.env)**:
```env
STYTCH_PROJECT_ID=project-test-...
STYTCH_SECRET=secret-test-...
STYTCH_DOMAIN=https://test.stytch.com
```

**Frontend (.env)**:
```env
VITE_STYTCH_PUBLIC_TOKEN=public-token-test-...
```

## 🛠️ MCP Tools

### Available Tools

1. **`get_my_notes()`**
   - Get all notes for authenticated user
   - Returns formatted list with IDs

2. **`add_note(content: str)`**
   - Add a new note for authenticated user
   - Returns confirmation with note content

### Windsurf Configuration

Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcp-stytch": {
    "disabled": false,
    "type": "http",
    "url": "http://127.0.0.1:8000/mcp"
  }
}
```

## 📊 Database Schema

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL
);
```

## 🔌 API Endpoints

### MCP Endpoints
- **Base URL**: `http://127.0.0.1:8000/mcp`
- **Transport**: HTTP
- **Authentication**: Bearer JWT

### OAuth Endpoints
- **Metadata**: `/.well-known/oauth-protected-resource`
- **Callback**: `/auth/callback` (for MCP clients)

## 🧪 Testing

### MCP Inspector
```bash
mcp-inspector uv run python main.py
```

### Direct API Testing
```bash
curl -X POST http://127.0.0.1:8000/mcp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_my_notes","arguments":{}}}'
```

## 📁 Project Structure

```
20-MCP_stytch/
├── backend/
│   ├── main.py              # FastMCP server
│   ├── database.py          # SQLAlchemy models
│   ├── .env.example         # Environment template
│   ├── pyproject.toml       # Python dependencies
│   └── README.md            # Backend documentation
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   └── main.jsx         # React entry point
│   ├── .env.example         # Environment template
│   ├── package.json         # Node dependencies
│   └── README.md            # Frontend documentation
└── README.md                # This file
```

## 🔧 Development

### Backend Development
- **Framework**: FastMCP 2.14.1
- **Database**: SQLAlchemy with SQLite
- **Auth**: JWT verification with Stytch JWKS
- **CORS**: Enabled for all origins

### Frontend Development
- **Framework**: React 19 + Vite
- **UI**: Stytch React components
- **Auth**: Email Magic Links
- **Environment**: Vite env variables

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Install dependencies: `uv sync --production`
3. Run: `uv run main.py`

### Frontend Deployment
1. Build: `npm run build`
2. Deploy static files to web server
3. Configure production Stytch redirect URLs

## 🤝 Integration Examples

### MCP Client Integration
- **Windsurf**: Use MCP configuration above
- **Claude Desktop**: Similar MCP config
- **Custom Clients**: Use HTTP transport with JWT auth

### Frontend Integration
- **Email Magic Links**: User authentication
- **Session Management**: Automatic token handling
- **OAuth Flow**: For MCP clients

## 📝 Notes

- Database persists in `database.db` file
- JWT tokens validated against Stytch JWKS
- CORS enabled for development convenience
- Sessions expire after 60 minutes
- All operations are user-scoped

## 🐛 Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check JWT token validity
2. **OAuth redirect errors**: Verify redirect URLs in Stytch dashboard
3. **Database errors**: Ensure SQLite file permissions
4. **CORS issues**: Check allowed origins in production

### Debug Commands
```bash
# Check MCP server health
curl http://127.0.0.1:8000/.well-known/oauth-protected-resource

# Verify JWT claims
echo "JWT_TOKEN" | cut -d. -f2 | base64 -d | jq .

# Test database connection
python -c "from database import NotesRepository; print('DB OK')"
```

---

**Built with ❤️ using FastMCP, Stytch, React, and SQLAlchemy**
