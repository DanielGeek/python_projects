# 🤖 Sistema de Reuniones con IA (100% Python)

Sistema completo en **solo 2 archivos Python** para grabar, transcribir y procesar reuniones de Zoom/Google Meet/Teams.

## 📁 Archivos

```
├── MCP_SERVER.py      # Servidor de procesamiento con IA (transcripción, resúmenes, etc.)
├── MEETING_API.py     # API completa (OAuth, webhooks, bot recorder con Playwright)
└── .env              # Variables de entorno (API keys)
```

## 🚀 Instalación

```bash
# 1. Instalar dependencias
uv add fastapi uvicorn requests python-dotenv openai starlette websockets fastmcp playwright

# 2. Instalar navegador Chromium para Playwright
uv run playwright install chromium

# 3. Configurar API key de OpenAI
cp .env.example .env
nano .env  # Agregar tu OPENAI_API_KEY
```

## ▶️ Ejecutar

```bash
# Terminal 1: MCP Server (procesamiento IA)
uv run MCP_SERVER.py

# Terminal 2: Meeting API (orquestador)
uv run MEETING_API.py
```

## 🎯 Cómo Funciona

### 1. **MCP_SERVER.py** - Procesamiento con IA
- Transcribe audio/video con OpenAI Whisper
- Genera resúmenes con GPT-4
- Extrae acciones y tareas
- Analiza sentimiento
- Traduce a español

### 2. **MEETING_API.py** - Orquestador Completo
- **OAuth:** Conecta con Zoom/Google/Teams
- **Webhooks:** Recibe notificaciones de reuniones
- **Bot Recorder:** Se une a reuniones con Playwright
  - Abre navegador automáticamente
  - Hace clic en "Join from Browser"
  - Graba video/audio
  - Transcribe en tiempo real
- **Almacenamiento:** Guarda grabaciones y resultados
- **WebSockets:** Transcripción en tiempo real

## 🔵 ¿Necesito Zoom SDK?

**NO.** Playwright es suficiente porque:
- ✅ Abre el navegador y va a la URL de Zoom
- ✅ Hace clic automáticamente en botones
- ✅ Graba video/audio directamente
- ✅ No necesita permisos especiales de Zoom
- ✅ Funciona igual para Zoom, Google Meet y Teams

El Zoom SDK solo sería necesario para integración nativa con la app de Zoom, pero para un bot que graba, **Playwright es la mejor opción**.

## 📝 Endpoints Principales

### Bot Recorder
```bash
# Unir bot a reunión
POST /bot/join
{
  "user_id": "user_123",
  "meeting_url": "https://zoom.us/j/123456789",
  "title": "Mi Reunión"
}

# Detener bot
POST /bot/stop?meeting_id=123

# Listar bots activos
GET /bot/list
```

### OAuth
```bash
# Iniciar OAuth con Zoom
GET /auth/zoom

# Callback OAuth
GET /auth/zoom/callback?code=xxx
```

### Webhooks
```bash
# Webhook de Zoom
POST /webhook/zoom

# Webhook de Google
POST /webhook/google
```

### Consultas
```bash
# Reuniones de usuario
GET /meetings/{user_id}

# Detalles de reunión
GET /meeting/{meeting_id}

# Transcripción
GET /transcript/{meeting_id}

# WebSocket transcripción en tiempo real
WS /ws/transcript/{meeting_id}
```

## 🔑 Variables de Entorno Requeridas

```bash
# OBLIGATORIO
OPENAI_API_KEY=sk-proj-xxx...

# OPCIONAL (para OAuth)
ZOOM_CLIENT_ID=xxx
ZOOM_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

## 🧪 Probar

### Opción 1: Con Postman/Thunder Client (Recomendado)

```
POST http://localhost:8001/test/mcp/summarize
Content-Type: application/json

{
  "text": "Esta es una reunión de prueba donde discutimos el proyecto de IA. Acordamos usar FastMCP y Playwright."
}
```

```
POST http://localhost:8001/test/mcp/translate
Content-Type: application/json

{
  "text": "Hello, this is a test meeting",
  "target_language": "es"
}
```

### Opción 2: Con curl

```bash
# Test resumen con MCP
curl -X POST http://localhost:8001/test/mcp/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "Reunión de prueba sobre IA"}'

# Test Meeting API
curl http://localhost:8001/

# Documentación interactiva
open http://localhost:8001/docs
```

**Nota:** El MCP Server está diseñado para ser llamado desde `MEETING_API.py`, no directamente. El flujo correcto es:

1. Usuario/Postman → `MEETING_API.py` (endpoints REST)
2. `MEETING_API.py` → `MCP_SERVER.py` (procesamiento IA)
3. `MCP_SERVER.py` → OpenAI → Resultados

## 🏗️ Arquitectura

```
┌──────────────────────────┐     ┌──────────────────────────┐
│   MEETING_API.py         │     │    MCP_SERVER.py         │
│   (Puerto 8001)          │◄────►    (Puerto 8000)         │
│                          │     │                          │
│  • OAuth                 │     │  • Transcripción         │
│  • Webhooks              │     │  • Resúmenes             │
│  • Bot con Playwright    │     │  • Acciones              │
│  • Grabación             │     │  • Sentimiento           │
│  • Almacenamiento        │     │  • Traducción            │
└──────────────────────────┘     └──────────────────────────┘
         ▲
         │
    ┌────┴─────┐
    │  Zoom    │
    │  Meet    │
    │  Teams   │
    └──────────┘
```

## 💡 Características

- ✅ **100% Python** (sin Node.js)
- ✅ **Solo 2 archivos** principales
- ✅ **Playwright** para automatización de navegador
- ✅ **OpenAI Whisper** para transcripción
- ✅ **GPT-4** para resúmenes e IA
- ✅ **FastAPI** para API moderna
- ✅ **WebSockets** para tiempo real
- ✅ **Production-ready**

## 📚 Documentación

### Meeting API (Puerto 8001)
- **Swagger UI:** http://localhost:8001/docs
- **ReDoc:** http://localhost:8001/redoc

### MCP Server (Puerto 8000)
- **Endpoint:** `POST http://localhost:8000/mcp`
- **Protocolo:** JSON-RPC 2.0
- **Nota:** MCP no tiene Swagger automático (usa JSON-RPC, no REST)
- **Documentación:** Ver ejemplos abajo

---

**Sistema completo de reuniones con IA en solo 2 archivos Python.** 🚀
