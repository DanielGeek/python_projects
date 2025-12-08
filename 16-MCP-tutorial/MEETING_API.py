#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
MEETING API - API para Sistema de Reuniones con IA (100% Python)
═══════════════════════════════════════════════════════════════════════════════

API Gateway completo para sistema de reuniones con IA:
1. OAuth con Zoom, Google Meet, Teams
2. Webhooks para recibir notificaciones de reuniones
3. Bot Recorder que se une automáticamente a reuniones
4. Procesamiento de grabaciones con MCP Server
5. Almacenamiento de datos y resultados

Componentes principales:
- FastAPI: Framework web moderno
- OAuth: Autenticación con plataformas de reuniones
- Bot Recorder: Grabación automática con Playwright (100% Python)
  * Playwright abre navegador y se une a la reunión
  * Graba video/audio automáticamente
  * NO necesita Zoom SDK ni Node.js
  * Funciona con Zoom, Google Meet y Teams
- Base de datos: Diccionarios en memoria (desarrollo) / PostgreSQL (producción)
- WebSockets: Transcripción en tiempo real

Requerimientos (100% Python):
- fastapi
- uvicorn
- requests
- python-dotenv
- openai
- starlette
- websockets
- playwright (automatización de navegador)

IMPORTANTE: NO necesitas Zoom SDK ni Node.js
Playwright es suficiente para grabar reuniones de cualquier plataforma.
"""

import os
import sys
import json
import time
import uuid
import asyncio
import subprocess
import logging
import requests
import signal
import tempfile
from typing import Dict, List, Optional, Union
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, Request, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi import HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("meeting_api.log")
    ]
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════════════════

# Credenciales OAuth
ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
TEAMS_CLIENT_ID = os.getenv("TEAMS_CLIENT_ID")
TEAMS_CLIENT_SECRET = os.getenv("TEAMS_CLIENT_SECRET")

# URLs
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8001/mcp")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Bot Recorder
BOT_EMAIL = os.getenv("BOT_EMAIL", "bot@tuempresa.com")
STORAGE_TYPE = os.getenv("STORAGE_TYPE", "local")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///meetings.db")

# Crear app FastAPI
app = FastAPI(
    title="Meeting API - Sistema de Reuniones con IA",
    description="API Gateway completo para sistema de reuniones con IA",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: especificar dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════════════════
# MODELOS DE DATOS
# ═══════════════════════════════════════════════════════════════════════════

class OAuthCallback(BaseModel):
    code: str
    state: Optional[str] = None

class MeetingInvite(BaseModel):
    user_id: str
    meeting_url: str
    title: Optional[str] = None
    platform: Optional[str] = None
    auto_stop_after: Optional[int] = None  # minutos

class MeetingStatus(BaseModel):
    meeting_id: str
    status: str

# ═══════════════════════════════════════════════════════════════════════════
# BASE DE DATOS (Simulada con diccionarios - usar SQLAlchemy en prod)
# ═══════════════════════════════════════════════════════════════════════════

# En producción: usar SQLAlchemy + PostgreSQL
# Aquí usamos diccionarios para simplificar el ejemplo

USERS_DB = {}  # {user_id: {email, platform, access_token, refresh_token}}
MEETINGS_DB = {}  # {meeting_id: {host_id, topic, status, start_time, etc}}
PROCESSED_MEETINGS_DB = {}  # {meeting_id: {transcript, summary, actions, etc}}

def save_user_credentials(user_id: str, email: str, platform: str, 
                          access_token: str, refresh_token: str):
    """Guardar credenciales de usuario en BD"""
    USERS_DB[user_id] = {
        "email": email,
        "platform": platform,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "created_at": datetime.now().isoformat()
    }
    logger.info(f"💾 Usuario guardado: {email}")

def save_meeting_started(meeting_id: str, host_id: str, topic: str, platform: str):
    """Guardar que reunión comenzó"""
    MEETINGS_DB[meeting_id] = {
        "host_id": host_id,
        "topic": topic,
        "platform": platform,
        "status": "in_progress",
        "start_time": datetime.now().isoformat()
    }
    logger.info(f"💾 Reunión iniciada: {meeting_id}")

def save_recording_url(meeting_id: str, recording_url: str):
    """Guardar URL de grabación"""
    if meeting_id in MEETINGS_DB:
        MEETINGS_DB[meeting_id]["recording_url"] = recording_url
        logger.info(f"💾 URL de grabación guardada: {meeting_id}")

def update_meeting_status(meeting_id: str, status: str):
    """Actualizar estado de reunión"""
    if meeting_id in MEETINGS_DB:
        MEETINGS_DB[meeting_id]["status"] = status
        MEETINGS_DB[meeting_id]["updated_at"] = datetime.now().isoformat()
        logger.info(f"📝 Estado actualizado: {meeting_id} → {status}")

def save_processed_meeting(meeting_id: str, host_id: str, platform: str,
                           recording_url: str, transcript: str, translated: str,
                           summary: str, actions: str, sentiment: str):
    """Guardar reunión procesada"""
    PROCESSED_MEETINGS_DB[meeting_id] = {
        "meeting_id": meeting_id,
        "host_id": host_id,
        "platform": platform,
        "recording_url": recording_url,
        "transcript": transcript,
        "translated": translated,
        "summary": summary,
        "actions": actions,
        "sentiment": sentiment,
        "processed_at": datetime.now().isoformat()
    }
    logger.info(f"💾 Reunión procesada guardada: {meeting_id}")

def get_meetings_from_db(user_id: str) -> List[Dict]:
    """Obtener reuniones de un usuario"""
    meetings = []
    for meeting_id, data in PROCESSED_MEETINGS_DB.items():
        if data.get("host_id") == user_id:
            meeting_info = MEETINGS_DB.get(meeting_id, {})
            meetings.append({
                "meeting_id": meeting_id,
                "topic": meeting_info.get("topic"),
                "summary": data.get("summary"),
                "processed_at": data.get("processed_at")
            })
    return meetings

def get_meeting_from_db(meeting_id: str) -> Optional[Dict]:
    """Obtener detalles de una reunión"""
    return PROCESSED_MEETINGS_DB.get(meeting_id)

def save_manual_meeting(user_id: str, meeting_url: str, title: str, platform: str) -> str:
    """Guardar reunión invitada manualmente"""
    meeting_id = f"manual_{int(datetime.now().timestamp())}"
    MEETINGS_DB[meeting_id] = {
        "host_id": user_id,
        "topic": title or "Reunión sin título",
        "platform": platform or detect_platform(meeting_url),
        "meeting_url": meeting_url,
        "status": "pending",
        "start_time": datetime.now().isoformat()
    }
    return meeting_id

def notify_user(user_id: str, meeting_id: str, message: str):
    """Enviar notificación a usuario"""
    user = USERS_DB.get(user_id)
    if user:
        logger.info(f"📧 Notificando a {user['email']}: {message}")
        # En producción: enviar email con SendGrid/AWS SES

# ═══════════════════════════════════════════════════════════════════════════
# UTILIDADES DE DETECCIÓN
# ═══════════════════════════════════════════════════════════════════════════

def detect_platform(meeting_url: str) -> str:
    """
    Detectar plataforma de reunión a partir de URL
    
    Args:
        meeting_url: URL de la reunión
    
    Returns:
        str: Nombre de la plataforma ("zoom", "google_meet", "teams")
    """
    if "zoom.us" in meeting_url:
        return "zoom"
    elif "meet.google.com" in meeting_url:
        return "google_meet"
    elif "teams.microsoft.com" in meeting_url:
        return "teams"
    else:
        return "unknown"

def extract_meeting_id(meeting_url: str, platform: Optional[str] = None) -> str:
    """
    Extraer ID de reunión de la URL
    
    Args:
        meeting_url: URL de la reunión
        platform: Plataforma (opcional, si no se especifica se detecta)
    
    Returns:
        str: ID de la reunión
    """
    if not platform:
        platform = detect_platform(meeting_url)
    
    if platform == "zoom":
        # Formatos posibles:
        # - https://zoom.us/j/123456789
        # - https://zoom.us/meeting/register/123456789
        if "/j/" in meeting_url:
            return meeting_url.split("/j/")[1].split("?")[0]
        elif "/meeting/" in meeting_url:
            return meeting_url.split("/")[-1].split("?")[0]
    
    elif platform == "google_meet":
        # Formato: https://meet.google.com/abc-defg-hij
        return meeting_url.split("/")[-1].split("?")[0]
    
    elif platform == "teams":
        # Formato complejo, usar UUID
        return str(uuid.uuid4())
    
    # ID genérico si no se puede extraer
    return f"meeting_{int(datetime.now().timestamp())}"

def download_file(url: str, output_path: str) -> bool:
    """
    Descargar archivo desde URL
    
    Args:
        url: URL del archivo
        output_path: Ruta de destino
    
    Returns:
        bool: True si éxito, False si error
    """
    try:
        logger.info(f"📥 Descargando archivo: {url}")
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        logger.info(f"✅ Archivo descargado: {output_path}")
        return True
    except Exception as e:
        logger.error(f"❌ Error descargando archivo: {str(e)}")
        return False

def upload_to_storage(file_path: str, meeting_id: str) -> str:
    """
    Subir archivo a almacenamiento (local, S3, etc.)
    
    Args:
        file_path: Ruta local del archivo
        meeting_id: ID de reunión (para nombre)
    
    Returns:
        str: URL del archivo subido
    """
    if not os.path.exists(file_path):
        logger.error(f"❌ Archivo no existe: {file_path}")
        return ""
    
    logger.info(f"📤 Subiendo archivo: {file_path}")
    
    try:
        if STORAGE_TYPE == "local":
            # Crear directorio media si no existe
            media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media")
            os.makedirs(media_dir, exist_ok=True)
            
            # Nombre de archivo: platform_meeting_id.ext
            filename = os.path.basename(file_path)
            destination = os.path.join(media_dir, f"{meeting_id}_{filename}")
            
            # Copiar archivo
            import shutil
            shutil.copy2(file_path, destination)
            
            # URL local
            return f"file://{destination}"
            
        elif STORAGE_TYPE == "s3":
            # Subir a S3
            import boto3
            
            s3_client = boto3.client(
                's3',
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY
            )
            
            # Nombre del archivo en S3
            filename = os.path.basename(file_path)
            key = f"meetings/{meeting_id}/{filename}"
            
            # Subir
            s3_client.upload_file(
                file_path,
                S3_BUCKET_NAME,
                key
            )
            
            # URL de S3
            return f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{key}"
        
        else:
            logger.error(f"❌ Tipo de almacenamiento no soportado: {STORAGE_TYPE}")
            return f"file://{file_path}"
    
    except Exception as e:
        logger.error(f"❌ Error subiendo archivo: {str(e)}")
        return ""

# ═══════════════════════════════════════════════════════════════════════════
# INTEGRACIÓN CON MCP SERVER
# ═══════════════════════════════════════════════════════════════════════════

async def call_mcp_tool(tool_name: str, arguments: Dict) -> Any:
    """
    Llamar herramienta del MCP Server
    
    Args:
        tool_name: Nombre de la herramienta
        arguments: Argumentos para la herramienta
    
    Returns:
        Any: Resultado de la herramienta
    """
    logger.info(f"🔧 Llamando herramienta MCP: {tool_name}")
    
    # Generar ID de sesión único
    import uuid
    session_id = str(uuid.uuid4())
    
    # Configurar headers con todas las variantes posibles de session ID
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",  # Ambos tipos son requeridos
        "X-Session-Id": session_id,
        "Session-Id": session_id,
        "session-id": session_id
    }
    
    # Configurar payload con session_id incluido para asegurar
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": tool_name,
            "arguments": arguments
        },
        "session_id": session_id  # Incluir aquí también
    }
    
    try:
        # Hacer POST al servidor MCP
        logger.info(f"Enviando solicitud a {MCP_SERVER_URL} con session_id: {session_id}")
        logger.info(f"Headers: {headers}")
        logger.info(f"Payload: {payload}")
        
        # Intentar otra forma de pasar el ID de sesión
        # FastMCP puede esperar que el ID de sesión se pase de otra manera
        cookies = {"sessionid": session_id}
        
        # Aumentar el timeout para herramientas que pueden tomar tiempo
        response = requests.post(
            MCP_SERVER_URL, 
            headers=headers, 
            json=payload, 
            cookies=cookies,
            timeout=300
        )
        
        logger.info(f"Respuesta: {response.status_code}")
        
        # Procesar respuesta
        if response.status_code == 200:
            # La respuesta puede venir como SSE (Server-Sent Events)
            response_text = response.text
            logger.info(f"Respuesta raw: {response_text[:200]}...")
            
            # Si la respuesta es SSE, parsearla
            if response_text.startswith("event:") or "data:" in response_text:
                # Parsear SSE
                lines = response_text.strip().split("\n")
                for line in lines:
                    if line.startswith("data:"):
                        json_str = line[5:].strip()  # Remover "data:" prefix
                        try:
                            result = json.loads(json_str)
                            logger.info(f"Respuesta parseada: {result.keys()}")
                            
                            # Extraer texto del resultado
                            if "result" in result:
                                if "content" in result["result"]:
                                    content = result["result"]["content"]
                                    if isinstance(content, list) and len(content) > 0:
                                        return content[0].get("text", "")
                                return result["result"]
                            
                            return result
                        except json.JSONDecodeError as e:
                            logger.error(f"Error parseando JSON de SSE: {e}")
                            continue
            else:
                # Respuesta JSON normal
                result = response.json()
                logger.info(f"Respuesta exitosa: {result.keys()}")
                
                # Extraer texto del resultado
                if "result" in result:
                    if "content" in result["result"]:
                        content = result["result"]["content"]
                        if isinstance(content, list) and len(content) > 0:
                            return content[0].get("text", "")
                    return result["result"]
                
                return result
        else:
            error_msg = f"❌ Error MCP ({response.status_code}): {response.text}"
            logger.error(error_msg)
            return {"error": error_msg}
            
    except requests.exceptions.Timeout:
        error_msg = f"⏲️ Timeout llamando MCP tool: {tool_name}"
        logger.error(error_msg)
        return {"error": error_msg}
    except Exception as e:
        error_msg = f"❌ Error general llamando MCP: {str(e)}"
        logger.error(error_msg)
        return {"error": error_msg}

async def process_meeting_with_mcp(meeting_id: str, recording_url: str, host_id: str):
    """
    Procesar grabación con MCP Server
    
    Args:
        meeting_id: ID de reunión
        recording_url: URL de grabación
        host_id: ID del usuario host
    """
    logger.info(f"🤖 Procesando reunión {meeting_id} con MCP Server")
    
    # Actualizar estado
    update_meeting_status(meeting_id, "processing")
    
    try:
        # 1. TRANSCRIBIR
        logger.info("📝 Transcribiendo audio...")
        transcript = await call_mcp_tool("transcribe_audio", {
            "video_url": recording_url
        })
        
        # Verificar si hay error
        if isinstance(transcript, dict) and "error" in transcript:
            update_meeting_status(meeting_id, "error_transcription")
            return
        
        # 2. TRADUCIR (opcional - si transcript está en inglés)
        logger.info("🌐 Traduciendo a español...")
        translated = await call_mcp_tool("translate_text", {
            "text": transcript,
            "target_language": "es"
        })
        
        # 3. RESUMIR
        logger.info("📋 Generando resumen...")
        summary = await call_mcp_tool("summarize_meeting", {
            "transcript": translated or transcript
        })
        
        # 4. EXTRAER ACCIONES
        logger.info("✅ Extrayendo acciones...")
        actions = await call_mcp_tool("extract_action_items", {
            "transcript": translated or transcript
        })
        
        # 5. ANALIZAR SENTIMIENTO (opcional)
        logger.info("📈 Analizando sentimiento...")
        sentiment = await call_mcp_tool("analyze_sentiment", {
            "transcript": translated or transcript
        })
        
        # 6. GUARDAR EN BD
        save_processed_meeting(
            meeting_id=meeting_id,
            host_id=host_id,
            platform=MEETINGS_DB[meeting_id].get("platform", "unknown"),
            recording_url=recording_url,
            transcript=transcript,
            translated=translated if isinstance(translated, str) else "",
            summary=summary if isinstance(summary, str) else "",
            actions=actions if isinstance(actions, str) else "",
            sentiment=json.dumps(sentiment) if isinstance(sentiment, dict) else ""
        )
        
        # 7. ACTUALIZAR ESTADO
        update_meeting_status(meeting_id, "completed")
        
        # 8. NOTIFICAR USUARIO
        notify_user(host_id, meeting_id, f"Reunión {MEETINGS_DB[meeting_id].get('topic', 'sin título')} procesada")
        
        logger.info(f"✅ Reunión {meeting_id} procesada exitosamente")
        
    except Exception as e:
        logger.error(f"❌ Error procesando reunión: {str(e)}")
        update_meeting_status(meeting_id, "error")
        MEETINGS_DB[meeting_id]["error"] = str(e)

# ═══════════════════════════════════════════════════════════════════════════
# BOT RECORDER - GRABACIÓN AUTOMÁTICA
# ═══════════════════════════════════════════════════════════════════════════

class BotRecorder:
    """
    Bot que se une a reuniones y graba automáticamente.
    Funciona con múltiples plataformas usando Puppeteer o SDKs nativos.
    """
    
    def __init__(self):
        """
        Inicializar el bot recorder
        """
        self.meeting_id = None
        self.platform = None
        self.meeting_url = None
        self.recording_path = None
        self.transcript_path = None
        self.process = None
        self.bot_name = "Loquera Bot"
        self.bot_email = BOT_EMAIL
        self.active = False
        
        # Verificar dependencias necesarias
        self._check_dependencies()
        
        logger.info("🤖 Bot Recorder iniciado")
    
    def _check_dependencies(self):
        """
        Verificar que todas las dependencias necesarias estén instaladas
        """
        # Verificar FFmpeg
        try:
            subprocess.run(["ffmpeg", "-version"], 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE, 
                          check=True)
            logger.info("✅ FFmpeg encontrado")
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.error("❌ FFmpeg no encontrado. Instálalo con: brew install ffmpeg")
            sys.exit(1)
        
        # Verificar Node.js
        try:
            subprocess.run(["node", "--version"], 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE, 
                          check=True)
            logger.info("✅ Node.js encontrado")
        except (subprocess.SubprocessError, FileNotFoundError):
            logger.error("❌ Node.js no encontrado. Instálalo desde: https://nodejs.org")
            sys.exit(1)
    
    def extract_meeting_info(self, meeting_url: str) -> Dict:
        """
        Extraer información de la reunión a partir de la URL
        
        Args:
            meeting_url: URL de la reunión
            
        Returns:
            Dict: Información de la reunión (platform, meeting_id)
        """
        platform = detect_platform(meeting_url)
        meeting_id = extract_meeting_id(meeting_url, platform)
        
        meeting_info = {
            "url": meeting_url,
            "platform": platform,
            "meeting_id": meeting_id
        }
        
        logger.info(f"📋 Info de reunión: {meeting_info}")
        return meeting_info
    
    async def join_meeting(self, meeting_url: str) -> str:
        """
        Unir bot a una reunión y comenzar grabación
        
        Args:
            meeting_url: URL de la reunión (Zoom, Google Meet, Teams)
            
        Returns:
            str: Ruta del archivo de grabación
        """
        # Extraer información de la reunión
        meeting_info = self.extract_meeting_info(meeting_url)
        self.meeting_url = meeting_url
        self.platform = meeting_info["platform"]
        self.meeting_id = meeting_info["meeting_id"]
        
        # Crear directorio temporal para grabación
        recording_dir = tempfile.mkdtemp()
        self.recording_path = os.path.join(recording_dir, f"{self.platform}_{self.meeting_id}.mp4")
        self.transcript_path = os.path.join(recording_dir, f"{self.platform}_{self.meeting_id}.txt")
        
        # Seleccionar método de unión según plataforma
        # Usar Playwright para todas las plataformas (100% Python)
        await self._join_with_playwright()
        
        self.active = True
        return self.recording_path
    
    
    async def _join_with_playwright(self):
        """
        Unir bot a reunión usando Playwright (Python)
        """
        from playwright.async_api import async_playwright
        
        logger.info(f"🎭 Uniéndose con Playwright: {self.meeting_url}")
        
        try:
            playwright = await async_playwright().start()
            
            # Lanzar navegador
            browser = await playwright.chromium.launch(
                headless=False,  # Cambiar a True en producción
                args=[
                    '--use-fake-ui-for-media-stream',  # Auto-permitir cámara/micrófono
                    '--use-fake-device-for-media-stream',
                    '--disable-blink-features=AutomationControlled'
                ]
            )
            
            # Crear contexto con permisos
            context = await browser.new_context(
                viewport={'width': 1280, 'height': 720},
                permissions=['camera', 'microphone'],
                record_video_dir=os.path.dirname(self.recording_path),
                record_video_size={'width': 1280, 'height': 720}
            )
            
            # Crear página
            page = await context.new_page()
            
            # Navegar a la reunión
            await page.goto(self.meeting_url)
            
            # Esperar y manejar según plataforma
            if self.platform == "zoom":
                await self._handle_zoom_join(page)
            elif self.platform == "google_meet":
                await self._handle_google_meet_join(page)
            elif self.platform == "teams":
                await self._handle_teams_join(page)
            
            # Guardar referencias
            self.playwright = playwright
            self.browser = browser
            self.context = context
            self.page = page
            
            # Iniciar transcripción en tiempo real
            asyncio.create_task(self._transcribe_realtime())
            
            logger.info(f"🎥 Grabación iniciada: {self.recording_path}")
            logger.info(f"📝 Transcripción: {self.transcript_path}")
            
        except Exception as e:
            logger.error(f"❌ Error con Playwright: {str(e)}")
            raise
    
    async def _handle_zoom_join(self, page):
        """
        Manejar unión a reunión de Zoom con Playwright
        """
        logger.info("🔵 Manejando unión a Zoom...")
        
        try:
            # Esperar a que cargue la página
            await page.wait_for_load_state('networkidle')
            
            # Intentar hacer clic en "Join from Browser" si aparece
            try:
                await page.click('text=Join from Your Browser', timeout=5000)
            except:
                pass
            
            # Ingresar nombre del bot
            try:
                name_input = await page.wait_for_selector('input[placeholder*="name" i]', timeout=5000)
                await name_input.fill(self.bot_name)
            except:
                logger.warning("⚠️ No se encontró campo de nombre")
            
            # Hacer clic en Join
            try:
                await page.click('button:has-text("Join")', timeout=5000)
            except:
                try:
                    await page.click('button:has-text("Unirse")', timeout=5000)
                except:
                    logger.warning("⚠️ No se encontró botón Join")
            
            # Esperar a que se una a la reunión
            await asyncio.sleep(5)
            
            # Apagar cámara y micrófono
            try:
                await page.click('button[aria-label*="camera" i]', timeout=2000)
            except:
                pass
            
            try:
                await page.click('button[aria-label*="microphone" i]', timeout=2000)
            except:
                pass
            
            logger.info("✅ Bot unido a Zoom exitosamente")
            
        except Exception as e:
            logger.error(f"❌ Error uniéndose a Zoom: {str(e)}")
            raise
    
    async def _handle_google_meet_join(self, page):
        """
        Manejar unión a Google Meet con Playwright
        """
        logger.info("🟢 Manejando unión a Google Meet...")
        
        try:
            # Esperar a que cargue
            await page.wait_for_load_state('networkidle')
            
            # Apagar cámara y micrófono antes de unirse
            try:
                await page.click('button[aria-label*="camera" i]', timeout=3000)
            except:
                pass
            
            try:
                await page.click('button[aria-label*="microphone" i]', timeout=3000)
            except:
                pass
            
            # Hacer clic en "Ask to join" o "Join now"
            try:
                await page.click('button:has-text("Ask to join")', timeout=5000)
            except:
                try:
                    await page.click('button:has-text("Join now")', timeout=5000)
                except:
                    logger.warning("⚠️ No se encontró botón de unión")
            
            await asyncio.sleep(5)
            logger.info("✅ Bot unido a Google Meet exitosamente")
            
        except Exception as e:
            logger.error(f"❌ Error uniéndose a Google Meet: {str(e)}")
            raise
    
    async def _handle_teams_join(self, page):
        """
        Manejar unión a Microsoft Teams con Playwright
        """
        logger.info("🟦 Manejando unión a Teams...")
        
        try:
            # Esperar a que cargue
            await page.wait_for_load_state('networkidle')
            
            # Hacer clic en "Join on the web instead"
            try:
                await page.click('text=Join on the web instead', timeout=5000)
            except:
                pass
            
            # Ingresar nombre
            try:
                name_input = await page.wait_for_selector('input[placeholder*="name" i]', timeout=5000)
                await name_input.fill(self.bot_name)
            except:
                pass
            
            # Apagar cámara y micrófono
            try:
                await page.click('button[aria-label*="camera" i]', timeout=2000)
            except:
                pass
            
            try:
                await page.click('button[aria-label*="microphone" i]', timeout=2000)
            except:
                pass
            
            # Hacer clic en Join
            try:
                await page.click('button:has-text("Join now")', timeout=5000)
            except:
                logger.warning("⚠️ No se encontró botón Join")
            
            await asyncio.sleep(5)
            logger.info("✅ Bot unido a Teams exitosamente")
            
        except Exception as e:
            logger.error(f"❌ Error uniéndose a Teams: {str(e)}")
            raise
    
    async def _transcribe_realtime(self):
        """
        Transcribir audio en tiempo real
        """
        logger.info("🔄 Iniciando transcripción en tiempo real...")
        
        # Esperar a que el archivo de grabación exista
        while not os.path.exists(self.recording_path) or os.path.getsize(self.recording_path) < 1024:
            await asyncio.sleep(5)
            if not self.active:
                return
        
        # Inicializar archivo de transcripción
        with open(self.transcript_path, "w") as f:
            f.write("[Transcripción en tiempo real]\n\n")
        
        # Procesar chunks de audio cada X segundos
        chunk_interval = 30  # segundos
        chunk_number = 0
        
        # Crear directorio para chunks
        chunks_dir = os.path.join(os.path.dirname(self.recording_path), "chunks")
        os.makedirs(chunks_dir, exist_ok=True)
        
        with open(self.transcript_path, "a") as transcript_file:
            # Mientras la grabación esté activa
            while self.active and self.process and self.process.poll() is None:
                chunk_number += 1
                chunk_path = os.path.join(chunks_dir, f"chunk_{chunk_number}.mp3")
                
                # Extraer chunk de audio de la grabación en curso
                try:
                    subprocess.run([
                        "ffmpeg", "-y",
                        "-ss", str(chunk_interval * (chunk_number - 1)),
                        "-t", str(chunk_interval),
                        "-i", self.recording_path,
                        "-vn", "-acodec", "libmp3lame", "-ac", "1", "-ar", "16000",
                        chunk_path
                    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
                    
                    # Verificar si el chunk tiene contenido
                    if os.path.exists(chunk_path) and os.path.getsize(chunk_path) > 1024:
                        # Llamar a MCP para transcripción
                        transcription = await call_mcp_tool("transcribe_audio", {
                            "video_url": f"file://{chunk_path}"
                        })
                        
                        if isinstance(transcription, str) and transcription:
                            # Añadir timestamp
                            timestamp = time.strftime("%H:%M:%S", time.gmtime(chunk_interval * (chunk_number - 1)))
                            transcript_chunk = f"[{timestamp}] {transcription}\n\n"
                            
                            # Escribir a archivo
                            transcript_file.write(transcript_chunk)
                            transcript_file.flush()
                            
                            # Procesar chunk con MCP
                            await call_mcp_tool("process_transcript_chunk", {
                                "meeting_id": self.meeting_id,
                                "transcript_chunk": transcript_chunk,
                                "platform": self.platform
                            })
                            
                            logger.info(f"📝 Transcripción chunk {chunk_number}: {transcription[:50]}...")
                except Exception as e:
                    logger.error(f"❌ Error procesando chunk {chunk_number}: {str(e)}")
                
                # Esperar para el siguiente chunk
                await asyncio.sleep(chunk_interval)
        
        logger.info("✅ Transcripción en tiempo real finalizada")
    
    async def stop(self):
        """
        Detener grabación y cerrar bot
        """
        if not self.active:
            return None
        
        self.active = False
        logger.info("🛑 Deteniendo grabación...")
        
        # Cerrar Playwright si está activo
        if hasattr(self, 'page') and self.page:
            try:
                await self.page.close()
            except:
                pass
        
        if hasattr(self, 'context') and self.context:
            try:
                # Cerrar contexto y obtener video grabado
                await self.context.close()
                
                # El video se guarda automáticamente por Playwright
                # Buscar el archivo de video generado
                video_dir = os.path.dirname(self.recording_path)
                for file in os.listdir(video_dir):
                    if file.endswith('.webm'):
                        # Mover y renombrar el video
                        src = os.path.join(video_dir, file)
                        os.rename(src, self.recording_path.replace('.mp4', '.webm'))
                        self.recording_path = self.recording_path.replace('.mp4', '.webm')
                        break
            except Exception as e:
                logger.error(f"❌ Error cerrando contexto: {str(e)}")
        
        if hasattr(self, 'browser') and self.browser:
            try:
                await self.browser.close()
            except:
                pass
        
        if hasattr(self, 'playwright') and self.playwright:
            try:
                await self.playwright.stop()
            except:
                pass
        
        # Subir grabación a almacenamiento
        recording_url = ""
        if self.recording_path and os.path.exists(self.recording_path):
            recording_url = upload_to_storage(self.recording_path, self.meeting_id)
            logger.info(f"📤 Grabación subida: {recording_url}")
        
        return recording_url
    
    async def _wait_process(self):
        """
        Esperar a que termine el proceso
        """
        returncode = await asyncio.get_event_loop().run_in_executor(
            None, self.process.wait
        )
        return returncode

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS API PARA BOT RECORDER
# ═══════════════════════════════════════════════════════════════════════════

# Registro global de bots activos
ACTIVE_BOTS = {}  # {meeting_id: bot_instance}

@app.post("/bot/join")
async def join_bot(invite: MeetingInvite, background_tasks: BackgroundTasks):
    """
    Unir bot a una reunión y grabar automáticamente
    
    Args:
        invite: Datos de la invitación
    
    Returns:
        Dict: Resultado de la operación
    """
    logger.info(f"🚀 Uniéndose a reunión: {invite.meeting_url}")
    
    try:
        # Determinar plataforma si no se especificó
        if not invite.platform:
            invite.platform = detect_platform(invite.meeting_url)
        
        # Guardar en BD
        meeting_id = save_manual_meeting(
            user_id=invite.user_id,
            meeting_url=invite.meeting_url,
            title=invite.title or "Reunión sin título",
            platform=invite.platform
        )
        
        # Iniciar bot en segundo plano
        background_tasks.add_task(
            join_bot_and_process,
            meeting_url=invite.meeting_url,
            user_id=invite.user_id,
            meeting_id=meeting_id,
            auto_stop_after=invite.auto_stop_after
        )
        
        return {
            "status": "joining",
            "meeting_id": meeting_id,
            "message": "Bot uniéndose a la reunión"
        }
        
    except Exception as e:
        logger.error(f"❌ Error iniciando bot: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error iniciando bot: {str(e)}")

@app.post("/bot/stop")
async def stop_bot(meeting_id: str):
    """
    Detener bot y grabación
    
    Args:
        meeting_id: ID de reunión
    
    Returns:
        Dict: Resultado de la operación
    """
    logger.info(f"🛑 Deteniendo bot para reunión: {meeting_id}")
    
    if meeting_id in ACTIVE_BOTS:
        bot = ACTIVE_BOTS[meeting_id]
        
        # Actualizar estado
        update_meeting_status(meeting_id, "stopping")
        
        # Detener bot
        recording_url = await bot.stop()
        
        # Eliminar del registro
        del ACTIVE_BOTS[meeting_id]
        
        # Actualizar estado
        update_meeting_status(meeting_id, "stopped")
        
        # Si hay URL de grabación, guardarla
        if recording_url:
            save_recording_url(meeting_id, recording_url)
            
            # Procesar grabación
            asyncio.create_task(
                process_meeting_with_mcp(
                    meeting_id=meeting_id,
                    recording_url=recording_url,
                    host_id=MEETINGS_DB[meeting_id]["host_id"]
                )
            )
        
        return {
            "status": "stopped",
            "meeting_id": meeting_id,
            "recording_url": recording_url,
            "message": "Bot detenido correctamente"
        }
    else:
        # Verificar si existe la reunión
        if meeting_id not in MEETINGS_DB:
            raise HTTPException(status_code=404, detail="Reunión no encontrada")
        
        update_meeting_status(meeting_id, "not_recording")
        
        return {
            "status": "not_found",
            "meeting_id": meeting_id,
            "message": "Bot no estaba activo para esta reunión"
        }

@app.get("/bot/list")
async def list_active_bots():
    """
    Listar bots activos
    
    Returns:
        Dict: Lista de bots activos
    """
    bot_list = []
    
    for meeting_id, bot in ACTIVE_BOTS.items():
        bot_info = {
            "meeting_id": meeting_id,
            "platform": bot.platform,
            "recording_path": bot.recording_path,
            "transcript_path": bot.transcript_path,
            "status": "recording" if bot.active else "inactive"
        }
        bot_list.append(bot_info)
    
    return {
        "total": len(bot_list),
        "bots": bot_list
    }

async def join_bot_and_process(meeting_url: str, user_id: str, meeting_id: str, auto_stop_after: Optional[int] = None):
    """
    Función que corre en background para iniciar y gestionar un bot
    
    Args:
        meeting_url: URL de la reunión
        user_id: ID de usuario
        meeting_id: ID de reunión
        auto_stop_after: Minutos para detener automáticamente
    """
    # Actualizar estado
    update_meeting_status(meeting_id, "bot_joining")
    
    try:
        # Crear bot
        bot = BotRecorder()
        
        # Registrar en bots activos
        ACTIVE_BOTS[meeting_id] = bot
        
        # Unir a reunión
        recording_path = await bot.join_meeting(meeting_url)
        
        # Actualizar estado
        update_meeting_status(meeting_id, "recording")
        
        # Notificar usuario
        notify_user(user_id, meeting_id, f"Bot unido a la reunión y grabando")
        
        logger.info(f"✅ Bot unido a reunión: {meeting_id}")
        
        # Si se especificó tiempo de grabación, programar detención
        if auto_stop_after:
            logger.info(f"⏰ Bot se detendrá automáticamente en {auto_stop_after} minutos")
            
            # Esperar el tiempo especificado
            await asyncio.sleep(auto_stop_after * 60)
            
            # Verificar si sigue activo
            if meeting_id in ACTIVE_BOTS and ACTIVE_BOTS[meeting_id] == bot and bot.active:
                logger.info(f"⏰ Deteniendo bot automáticamente: {meeting_id}")
                
                # Actualizar estado
                update_meeting_status(meeting_id, "stopping")
                
                # Detener bot
                recording_url = await bot.stop()
                
                # Eliminar del registro
                del ACTIVE_BOTS[meeting_id]
                
                # Actualizar estado
                update_meeting_status(meeting_id, "completed_auto")
                
                # Si hay URL de grabación, guardarla
                if recording_url:
                    save_recording_url(meeting_id, recording_url)
                    
                    # Procesar grabación
                    await process_meeting_with_mcp(
                        meeting_id=meeting_id,
                        recording_url=recording_url,
                        host_id=MEETINGS_DB[meeting_id]["host_id"]
                    )
        
    except Exception as e:
        logger.error(f"❌ Error con bot: {str(e)}")
        
        # Actualizar estado
        update_meeting_status(meeting_id, "error")
        MEETINGS_DB[meeting_id]["error"] = str(e)
        
        # Notificar usuario
        notify_user(user_id, meeting_id, f"Error: {str(e)}")
        
        # Limpiar registro
        if meeting_id in ACTIVE_BOTS:
            del ACTIVE_BOTS[meeting_id]

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS PARA OAUTH Y WEBHOOKS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/auth/{platform}")
async def start_oauth(platform: str):
    """
    Iniciar flujo OAuth con Zoom/Google/Teams
    
    Args:
        platform: Plataforma (zoom, google, teams)
    
    Returns:
        Dict: URL de redirección para OAuth
    """
    oauth_configs = {
        "zoom": {
            "url": "https://zoom.us/oauth/authorize",
            "client_id": ZOOM_CLIENT_ID,
            "redirect_uri": f"{API_BASE_URL}/auth/zoom/callback",
            "scope": "meeting:read meeting:write recording:read user:read"
        },
        "google": {
            "url": "https://accounts.google.com/o/oauth2/v2/auth",
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": f"{API_BASE_URL}/auth/google/callback",
            "scope": "https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email"
        }
    }
    
    config = oauth_configs.get(platform)
    if not config:
        raise HTTPException(status_code=400, detail="Plataforma no soportada")
    
    # Construir URL de OAuth
    auth_url = (
        f"{config['url']}?"
        f"client_id={config['client_id']}&"
        f"redirect_uri={config['redirect_uri']}&"
        f"response_type=code&"
        f"scope={config['scope']}"
    )
    
    return {"redirect_url": auth_url}

@app.get("/auth/{platform}/callback")
async def oauth_callback(platform: str, code: str):
    """
    Callback de OAuth - Plataforma redirige aquí después de autorización
    
    Args:
        platform: Plataforma (zoom, google, teams)
        code: Código de autorización
    
    Returns:
        Dict: Información de usuario autenticado
    """
    logger.info(f"📫 OAuth callback recibido de {platform}")
    
    # 1. Intercambiar código por token
    tokens = await exchange_code_for_token(platform, code)
    
    if not tokens:
        raise HTTPException(status_code=400, detail="Error obteniendo token")
    
    # 2. Obtener info del usuario
    user_info = await get_user_info(platform, tokens['access_token'])
    
    # 3. Guardar en BD
    save_user_credentials(
        user_id=user_info['id'],
        email=user_info['email'],
        platform=platform,
        access_token=tokens['access_token'],
        refresh_token=tokens.get('refresh_token')
    )
    
    # 4. Configurar webhook (solo para Zoom)
    if platform == "zoom":
        await setup_zoom_webhook(user_info['id'], tokens['access_token'])
    
    logger.info(f"✅ Usuario {user_info['email']} conectado exitosamente")
    
    # 5. Retornar éxito
    return {
        "message": f"{platform.title()} conectado exitosamente",
        "user_id": user_info['id'],
        "email": user_info['email']
    }

async def exchange_code_for_token(platform: str, code: str) -> Dict:
    """
    Intercambiar código OAuth por access_token
    
    Args:
        platform: Plataforma
        code: Código de autorización
    
    Returns:
        Dict: Tokens
    """
    endpoints = {
        "zoom": "https://zoom.us/oauth/token",
        "google": "https://oauth2.googleapis.com/token"
    }
    
    credentials = {
        "zoom": (ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET),
        "google": (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
    }
    
    try:
        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: requests.post(
                endpoints[platform],
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": f"{API_BASE_URL}/auth/{platform}/callback"
                },
                auth=credentials[platform]
            )
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            logger.error(f"❌ Error obteniendo token: {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Excepción: {str(e)}")
        return None

async def get_user_info(platform: str, access_token: str) -> Dict:
    """
    Obtener información del usuario desde la plataforma
    
    Args:
        platform: Plataforma
        access_token: Token de acceso
    
    Returns:
        Dict: Información del usuario
    """
    endpoints = {
        "zoom": "https://api.zoom.us/v2/users/me",
        "google": "https://www.googleapis.com/oauth2/v2/userinfo"
    }
    
    response = await asyncio.get_event_loop().run_in_executor(
        None,
        lambda: requests.get(
            endpoints[platform],
            headers={"Authorization": f"Bearer {access_token}"}
        )
    )
    
    return response.json()

async def setup_zoom_webhook(user_id: str, access_token: str):
    """
    Configurar webhook en Zoom
    
    Args:
        user_id: ID de usuario
        access_token: Token de acceso
    """
    logger.info(f"💳 Configurando webhook para usuario {user_id}")
    # En producción, esto se configura una vez en Zoom Marketplace
    # Instrucciones en OAUTH_SETUP.md

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE WEBHOOKS
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/webhook/zoom")
async def zoom_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Webhook de Zoom - Recibe eventos de reuniones
    
    Eventos importantes:
        - meeting.started: Reunión comenzó
        - meeting.ended: Reunión terminó
        - recording.completed: Grabación lista
    """
    payload = await request.json()
    event_type = payload.get("event")
    
    logger.info(f"📫 Webhook Zoom: {event_type}")
    
    if event_type == "meeting.started":
        # Reunión comenzó
        meeting_data = payload["payload"]["object"]
        save_meeting_started(
            meeting_id=meeting_data["id"],
            host_id=meeting_data["host_id"],
            topic=meeting_data.get("topic"),
            platform="zoom"
        )
        
    elif event_type == "meeting.ended":
        # Reunión terminó
        meeting_data = payload["payload"]["object"]
        meeting_id = meeting_data["id"]
        
        # Actualizar estado
        if meeting_id in MEETINGS_DB:
            update_meeting_status(meeting_id, "ended")
        
    elif event_type == "recording.completed":
        # ¡GRABACIÓN LISTA!
        recording_data = payload["payload"]["object"]
        meeting_id = recording_data["id"]
        host_id = recording_data["host_id"]
        recording_files = recording_data.get("recording_files", [])
        
        for file in recording_files:
            if file.get("file_type") in ["MP4", "M4A"]:
                download_url = file.get("download_url")
                
                logger.info(f"🎥 Grabación lista: {download_url}")
                
                # Guardar URL en BD
                save_recording_url(meeting_id, download_url)
                
                # Procesar con MCP en background
                background_tasks.add_task(
                    process_meeting_with_mcp,
                    meeting_id=meeting_id,
                    recording_url=download_url,
                    host_id=host_id
                )
    
    return {"status": "received"}

@app.post("/webhook/google")
async def google_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Webhook de Google Calendar - Recibe notificaciones de eventos
    
    NOTA: Google Meet NO graba automáticamente
    """
    try:
        payload = await request.json()
        logger.info(f"📫 Webhook Google: {payload}")
        
        # Procesar según tipo de evento
        # Esta es una implementación básica, en un sistema real
        # tendrías que manejar más eventos y escenarios
        
        # En un sistema real:
        # - Verificar firma/autenticidad del webhook
        # - Procesar eventos de Google Drive para detectar grabaciones
        
        return {"status": "received"}
    except Exception as e:
        logger.error(f"❌ Error en webhook Google: {str(e)}")
        return {"status": "error", "message": str(e)}

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS DE CONSULTA DE REUNIONES
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/meetings/{user_id}")
async def get_user_meetings(user_id: str):
    """
    Obtener todas las reuniones procesadas de un usuario
    
    Args:
        user_id: ID de usuario
    
    Returns:
        Dict: Lista de reuniones
    """
    meetings = get_meetings_from_db(user_id)
    
    return {
        "user_id": user_id,
        "total": len(meetings),
        "meetings": meetings
    }

@app.get("/meeting/{meeting_id}")
async def get_meeting_details(meeting_id: str):
    """
    Obtener detalles completos de una reunión
    
    Args:
        meeting_id: ID de reunión
    
    Returns:
        Dict: Detalles de la reunión
    """
    meeting = get_meeting_from_db(meeting_id)
    
    if not meeting:
        raise HTTPException(status_code=404, detail="Reunión no encontrada")
    
    return meeting

@app.get("/recording/{meeting_id}")
async def get_recording_url(meeting_id: str):
    """
    Obtener URL de grabación de una reunión
    
    Args:
        meeting_id: ID de reunión
    
    Returns:
        Dict: URL de grabación
    """
    if meeting_id not in MEETINGS_DB or "recording_url" not in MEETINGS_DB[meeting_id]:
        raise HTTPException(status_code=404, detail="Grabación no encontrada")
    
    return {
        "meeting_id": meeting_id,
        "recording_url": MEETINGS_DB[meeting_id]["recording_url"]
    }

@app.get("/transcript/{meeting_id}")
async def get_transcript(meeting_id: str):
    """
    Obtener transcripción de una reunión
    
    Args:
        meeting_id: ID de reunión
    
    Returns:
        Dict: Transcripción
    """
    # Verificar si es una reunión procesada
    if meeting_id in PROCESSED_MEETINGS_DB and PROCESSED_MEETINGS_DB[meeting_id].get("transcript"):
        return {
            "meeting_id": meeting_id,
            "transcript": PROCESSED_MEETINGS_DB[meeting_id]["transcript"]
        }
    
    # Verificar si hay un bot activo grabando
    if meeting_id in ACTIVE_BOTS:
        bot = ACTIVE_BOTS[meeting_id]
        if bot.transcript_path and os.path.exists(bot.transcript_path):
            with open(bot.transcript_path, "r") as f:
                transcript = f.read()
            
            return {
                "meeting_id": meeting_id,
                "transcript": transcript,
                "status": "in_progress"
            }
    
    raise HTTPException(status_code=404, detail="Transcripción no encontrada")

# ═══════════════════════════════════════════════════════════════════════════
# WEBSOCKET PARA TRANSCRIPCIÓN EN TIEMPO REAL
# ═══════════════════════════════════════════════════════════════════════════

@app.websocket("/ws/transcript/{meeting_id}")
async def websocket_transcript(websocket: WebSocket, meeting_id: str):
    """
    WebSocket para transcripción en tiempo real
    
    Args:
        websocket: Conexión WebSocket
        meeting_id: ID de reunión
    """
    await websocket.accept()
    
    try:
        # Verificar si hay un bot activo
        if meeting_id in ACTIVE_BOTS and ACTIVE_BOTS[meeting_id].transcript_path:
            # Enviar transcripción actual
            transcript_path = ACTIVE_BOTS[meeting_id].transcript_path
            
            if os.path.exists(transcript_path):
                with open(transcript_path, "r") as f:
                    current_transcript = f.read()
                
                await websocket.send_json({
                    "type": "transcript_history",
                    "meeting_id": meeting_id,
                    "content": current_transcript
                })
            
            # Monitorear cambios en transcripción
            last_size = os.path.getsize(transcript_path) if os.path.exists(transcript_path) else 0
            
            while True:
                # Verificar si el bot sigue activo
                if meeting_id not in ACTIVE_BOTS or not ACTIVE_BOTS[meeting_id].active:
                    await websocket.send_json({
                        "type": "bot_stopped",
                        "meeting_id": meeting_id
                    })
                    break
                
                # Verificar cambios en archivo
                if os.path.exists(transcript_path):
                    current_size = os.path.getsize(transcript_path)
                    
                    if current_size > last_size:
                        with open(transcript_path, "r") as f:
                            f.seek(last_size)
                            new_content = f.read()
                        
                        await websocket.send_json({
                            "type": "transcript_update",
                            "meeting_id": meeting_id,
                            "content": new_content
                        })
                        
                        last_size = current_size
                
                # Verificar ping del cliente
                try:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                    if data == "ping":
                        await websocket.send_text("pong")
                except asyncio.TimeoutError:
                    pass
                
                # Esperar antes del próximo ciclo
                await asyncio.sleep(1)
        else:
            await websocket.send_json({
                "type": "error",
                "message": "Bot no activo o transcripción no disponible"
            })
    
    except WebSocketDisconnect:
        logger.info(f"Cliente WebSocket desconectado: {meeting_id}")
    except Exception as e:
        logger.error(f"❌ Error en WebSocket: {str(e)}")
        
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass

# ═══════════════════════════════════════════════════════════════════════════
# INICIALIZACIÓN Y PUNTO DE ENTRADA
# ═══════════════════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup():
    """
    Inicializar al arrancar la aplicación
    """
    # Crear directorios necesarios
    media_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "media")
    os.makedirs(media_dir, exist_ok=True)
    
    print("="*80)
    print("🚀 MEETING API - Sistema de Reuniones con IA")
    print("="*80)
    print()
    print("💻 MCP Server URL: http://127.0.0.1:8001/mcp")
    print()
    print("💻 Endpoints OAuth:")
    print("  GET  /auth/{platform}          - Iniciar OAuth")
    print("  GET  /auth/{platform}/callback - Callback OAuth")
    print()
    print("💻 Webhooks:")
    print("  POST /webhook/zoom   - Eventos de Zoom")
    print("  POST /webhook/google - Eventos de Google")
    print()
    print("💻 Bot Recorder:")
    print("  POST /bot/join       - Unir bot a reunión")
    print("  POST /bot/stop       - Detener bot")
    print("  GET  /bot/list       - Listar bots activos")
    print()
    print("💻 Consulta de reuniones:")
    print("  GET  /meetings/{user_id}  - Listar reuniones de usuario")
    print("  GET  /meeting/{meeting_id} - Detalles de reunión")
    print("  GET  /recording/{meeting_id} - URL de grabación")
    print("  GET  /transcript/{meeting_id} - Transcripción")
    print()
    print("💻 WebSocket:")
    print("  WS  /ws/transcript/{meeting_id} - Transcripción en tiempo real")
    print()
    print("🧪 Endpoints de prueba MCP:")
    print("  POST /test/mcp/summarize - Probar resumen con MCP")
    print("  POST /test/mcp/translate - Probar traducción con MCP")
    print("  POST /test/mcp/call      - Llamar cualquier herramienta MCP")
    print("="*80)

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINT DE PRUEBA MCP
# ═══════════════════════════════════════════════════════════════════════════

class MCPTestRequest(BaseModel):
    """Modelo para probar MCP Server"""
    text: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Esta es una reunión de prueba donde discutimos el proyecto de IA"
            }
        }

@app.post("/test/mcp/summarize")
async def test_mcp_summarize(request: MCPTestRequest):
    """
    🧪 ENDPOINT DE PRUEBA - Probar MCP Server desde Postman
    
    Llama al MCP Server para generar un resumen de texto.
    Úsalo para verificar que la comunicación entre Meeting API y MCP Server funciona.
    """
    try:
        logger.info(f"🧪 Probando MCP Server con texto: {request.text[:50]}...")
        
        # Llamar al MCP Server
        result = await call_mcp_tool(
            tool_name="summarize_meeting",
            arguments={"transcript": request.text}
        )
        
        return {
            "success": True,
            "input": request.text,
            "mcp_response": result,
            "message": "✅ MCP Server funcionando correctamente"
        }
        
    except Exception as e:
        logger.error(f"❌ Error probando MCP: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error llamando MCP Server: {str(e)}")

@app.post("/test/mcp/translate")
async def test_mcp_translate(text: str = Body(...), target_language: str = Body(default="es")):
    """
    🧪 ENDPOINT DE PRUEBA - Traducir texto con MCP Server
    
    Ejemplo de uso desde Postman:
    ```json
    {
        "text": "Hello, this is a test",
        "target_language": "es"
    }
    ```
    """
    try:
        logger.info(f"🧪 Traduciendo a {target_language}: {text[:50]}...")
        
        result = await call_mcp_tool(
            tool_name="translate_text",
            arguments={"text": text, "target_language": target_language}
        )
        
        return {
            "success": True,
            "original": text,
            "target_language": target_language,
            "translation": result,
            "message": "✅ Traducción completada"
        }
        
    except Exception as e:
        logger.error(f"❌ Error traduciendo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/test/mcp/call")
async def test_mcp_call_any_tool(tool_name: str = Body(...), arguments: Dict = Body(...)):
    """
    🧪 ENDPOINT GENÉRICO - Llamar cualquier herramienta del MCP Server
    
    Este endpoint simula llamar directamente al MCP Server.
    Úsalo para probar cualquier herramienta disponible.
    
    Herramientas disponibles:
    - transcribe_audio
    - translate_text
    - summarize_meeting
    - extract_action_items
    - analyze_sentiment
    - generate_meeting_minutes
    - process_transcript_chunk
    
    Ejemplo 1 - Resumir:
    ```json
    {
        "tool_name": "summarize_meeting",
        "arguments": {
            "transcript": "Esta es una reunión de prueba..."
        }
    }
    ```
    
    Ejemplo 2 - Extraer acciones:
    ```json
    {
        "tool_name": "extract_action_items",
        "arguments": {
            "transcript": "Acordamos implementar X. Juan debe revisar Y..."
        }
    }
    ```
    
    Ejemplo 3 - Analizar sentimiento:
    ```json
    {
        "tool_name": "analyze_sentiment",
        "arguments": {
            "transcript": "La reunión fue muy productiva y todos estaban contentos..."
        }
    }
    ```
    """
    try:
        logger.info(f"🧪 Llamando herramienta MCP: {tool_name}")
        logger.info(f"📝 Argumentos: {arguments}")
        
        # Llamar al MCP Server con la herramienta especificada
        result = await call_mcp_tool(
            tool_name=tool_name,
            arguments=arguments
        )
        
        return {
            "success": True,
            "tool_name": tool_name,
            "arguments": arguments,
            "mcp_result": result,
            "message": f"✅ Herramienta '{tool_name}' ejecutada correctamente"
        }
        
    except Exception as e:
        logger.error(f"❌ Error llamando herramienta '{tool_name}': {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error ejecutando '{tool_name}': {str(e)}"
        )

@app.get("/")
async def root():
    """
    Endpoint raíz
    """
    return {
        "name": "Meeting API - Sistema de Reuniones con IA",
        "version": "1.0.0",
        "status": "running",
        "docs": f"{API_BASE_URL}/docs",
        "test_endpoints": {
            "summarize": f"{API_BASE_URL}/test/mcp/summarize",
            "translate": f"{API_BASE_URL}/test/mcp/translate"
        }
    }

# Punto de entrada para ejecución directa
if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", "8000"))
    
    # Iniciar servidor sin hot reload
    uvicorn.run(app, host="0.0.0.0", port=port)
