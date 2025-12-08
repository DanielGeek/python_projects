#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
MCP SERVER - Servidor de Procesamiento con IA para Reuniones
═══════════════════════════════════════════════════════════════════════════════

Servidor FastMCP que expone herramientas de IA para procesar reuniones:
- Transcripción de audio/video
- Traducción de texto
- Generación de resúmenes
- Extracción de acciones y tareas
- Análisis de sentimiento
- Generación de minutas

Este servidor NO guarda datos, solo procesa y retorna resultados.
La persistencia debe manejarse en la API Gateway.

Funciona con diferentes modelos:
- OpenAI Whisper para transcripción
- OpenAI GPT-4 para resúmenes, acciones, etc.
- Google Gemini Pro (opcional)

Requerimientos:
- fastmcp
- openai
- python-dotenv
"""

import os
import json
import time
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from fastmcp import FastMCP
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import requests
from dotenv import load_dotenv
import tempfile
import subprocess
import logging
import uuid

# Importar modelos de IA
import openai
from openai import OpenAI

# Cargar variables de entorno
load_dotenv()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("mcp_server.log")
    ]
)
logger = logging.getLogger(__name__)

# Configuración de OpenAI
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Configuración de transcripción
TRANSCRIPTION_MODEL = os.getenv("TRANSCRIPTION_MODEL", "openai")  # openai, assemblyai, google
OPENAI_WHISPER_MODEL = os.getenv("OPENAI_WHISPER_MODEL", "whisper-1")
ASSEMBLYAI_API_KEY = os.getenv("ASSEMBLYAI_API_KEY", "")
GOOGLE_SPEECH_KEY = os.getenv("GOOGLE_SPEECH_KEY", "")

# Configuración de LLM
LLM_MODEL = os.getenv("LLM_MODEL", "openai")  # openai, google
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-pro")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Otras configuraciones
MAX_RETRIES = 3
RETRY_DELAY = 2  # segundos

# ═══════════════════════════════════════════════════════════════════════════
# FUNCIONES AUXILIARES
# ═══════════════════════════════════════════════════════════════════════════

def download_video(video_url: str) -> str:
    """
    Descargar video desde URL
    
    Args:
        video_url: URL del video
        
    Returns:
        str: Ruta local del video descargado
    """
    logger.info(f"📥 Descargando video: {video_url}")
    
    # Si es una ruta local (file://), extraer la ruta
    if video_url.startswith("file://"):
        local_path = video_url[7:]
        if os.path.exists(local_path):
            return local_path
    
    # Crear directorio temporal
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, f"video_{uuid.uuid4()}.mp4")
    
    try:
        if "zoom.us" in video_url or "drive.google.com" in video_url or "onedrive" in video_url:
            # Para URLs de Zoom/Google/Microsoft, usar requests
            response = requests.get(video_url, stream=True)
            with open(temp_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        f.write(chunk)
        else:
            # Usar youtube-dl para servicios de streaming
            subprocess.run(
                ["yt-dlp", video_url, "-o", temp_path],
                check=True
            )
        
        logger.info(f"✅ Video descargado: {temp_path}")
        return temp_path
    except Exception as e:
        logger.error(f"❌ Error descargando video: {str(e)}")
        raise Exception(f"Error descargando video: {str(e)}")

def extract_audio(video_path: str) -> str:
    """
    Extraer audio de un video
    
    Args:
        video_path: Ruta del video
        
    Returns:
        str: Ruta del archivo de audio
    """
    logger.info(f"🔊 Extrayendo audio de: {video_path}")
    
    # Crear archivo de salida
    audio_path = video_path.rsplit(".", 1)[0] + ".mp3"
    
    # Extraer audio usando FFmpeg
    try:
        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", video_path,
                "-vn",  # Sin video
                "-acodec", "libmp3lame",
                "-q:a", "4",
                audio_path
            ],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        logger.info(f"✅ Audio extraído: {audio_path}")
        return audio_path
    except Exception as e:
        logger.error(f"❌ Error extrayendo audio: {str(e)}")
        raise Exception(f"Error extrayendo audio: {str(e)}")

# ═══════════════════════════════════════════════════════════════════════════
# TRANSCRIPCIÓN
# ═══════════════════════════════════════════════════════════════════════════

def transcribe_audio_openai(audio_path: str) -> str:
    """
    Transcribir audio usando OpenAI Whisper
    
    Args:
        audio_path: Ruta del archivo de audio
        
    Returns:
        str: Transcripción
    """
    logger.info(f"🔤 Transcribiendo con OpenAI Whisper: {audio_path}")
    
    retries = 0
    while retries < MAX_RETRIES:
        try:
            with open(audio_path, "rb") as audio_file:
                transcript = openai_client.audio.transcriptions.create(
                    model=OPENAI_WHISPER_MODEL,
                    file=audio_file
                )
            
            logger.info(f"✅ Transcripción completada: {len(transcript.text)} caracteres")
            return transcript.text
        except Exception as e:
            logger.error(f"❌ Error en transcripción (intento {retries+1}/{MAX_RETRIES}): {str(e)}")
            retries += 1
            time.sleep(RETRY_DELAY)
    
    raise Exception("Falló la transcripción después de varios intentos")

def transcribe_audio_assemblyai(audio_path: str) -> str:
    """
    Transcribir audio usando AssemblyAI
    
    Args:
        audio_path: Ruta del archivo de audio
        
    Returns:
        str: Transcripción
    """
    if not ASSEMBLYAI_API_KEY:
        raise Exception("API Key de AssemblyAI no configurada")
    
    logger.info(f"🔤 Transcribiendo con AssemblyAI: {audio_path}")
    
    # Subir archivo
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
        "content-type": "application/json"
    }
    
    # Leer archivo
    with open(audio_path, "rb") as f:
        audio_data = f.read()
    
    # Subir
    upload_url_response = requests.post(
        "https://api.assemblyai.com/v2/upload",
        headers=headers,
        data=audio_data
    )
    
    if upload_url_response.status_code != 200:
        raise Exception(f"Error subiendo audio: {upload_url_response.text}")
    
    upload_url = upload_url_response.json()["upload_url"]
    
    # Iniciar transcripción
    transcript_response = requests.post(
        "https://api.assemblyai.com/v2/transcript",
        headers=headers,
        json={"audio_url": upload_url}
    )
    
    if transcript_response.status_code != 200:
        raise Exception(f"Error iniciando transcripción: {transcript_response.text}")
    
    transcript_id = transcript_response.json()["id"]
    
    # Polling para esperar resultado
    while True:
        polling_response = requests.get(
            f"https://api.assemblyai.com/v2/transcript/{transcript_id}",
            headers=headers
        )
        
        if polling_response.status_code != 200:
            raise Exception(f"Error consultando transcripción: {polling_response.text}")
        
        status = polling_response.json()["status"]
        
        if status == "completed":
            text = polling_response.json()["text"]
            logger.info(f"✅ Transcripción completada: {len(text)} caracteres")
            return text
        elif status == "error":
            raise Exception(f"Error en transcripción: {polling_response.json().get('error')}")
        
        time.sleep(3)

def transcribe_audio(audio_path: str) -> str:
    """
    Transcribir audio con el modelo configurado
    
    Args:
        audio_path: Ruta del archivo de audio
        
    Returns:
        str: Transcripción
    """
    if TRANSCRIPTION_MODEL == "assemblyai" and ASSEMBLYAI_API_KEY:
        return transcribe_audio_assemblyai(audio_path)
    else:
        # Usar OpenAI por defecto
        return transcribe_audio_openai(audio_path)

# ═══════════════════════════════════════════════════════════════════════════
# TRADUCCIÓN Y PROCESAMIENTO DE TEXTO
# ═══════════════════════════════════════════════════════════════════════════

def translate_text_openai(text: str, target_language: str) -> str:
    """
    Traducir texto usando OpenAI
    
    Args:
        text: Texto a traducir
        target_language: Idioma destino (ej: "es", "en", "fr")
        
    Returns:
        str: Texto traducido
    """
    logger.info(f"🌐 Traduciendo a {target_language} usando OpenAI")
    
    language_names = {
        "es": "español",
        "en": "inglés",
        "fr": "francés",
        "de": "alemán",
        "it": "italiano",
        "pt": "portugués",
        "ru": "ruso",
        "zh": "chino",
        "ja": "japonés",
        "ko": "coreano"
    }
    
    target = language_names.get(target_language, target_language)
    
    prompt = f"Traduce el siguiente texto al {target}:\n\n{text}"
    
    response = openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": f"Eres un traductor profesional. Traduce el texto al {target} manteniendo el formato y sentido original."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    
    translation = response.choices[0].message.content.strip()
    logger.info(f"✅ Traducción completada: {len(translation)} caracteres")
    
    return translation

def translate_text(text: str, target_language: str) -> str:
    """
    Traducir texto con el modelo configurado
    
    Args:
        text: Texto a traducir
        target_language: Idioma destino
        
    Returns:
        str: Texto traducido
    """
    # Por ahora solo implementamos OpenAI
    return translate_text_openai(text, target_language)

def summarize_text_openai(transcript: str) -> str:
    """
    Resumir texto usando OpenAI
    
    Args:
        transcript: Transcripción a resumir
        
    Returns:
        str: Resumen
    """
    logger.info("📝 Generando resumen con OpenAI")
    
    # Verificar longitud y dividir si es necesario
    if len(transcript) > 80000:  # Límite aproximado para GPT-4
        logger.info("⚠️ Transcripción demasiado larga, dividiendo...")
        # Dividir en partes y resumir cada una
        parts = [transcript[i:i+80000] for i in range(0, len(transcript), 80000)]
        summaries = []
        
        for i, part in enumerate(parts):
            logger.info(f"Resumiendo parte {i+1}/{len(parts)}...")
            part_summary = summarize_text_openai(part)
            summaries.append(part_summary)
        
        # Juntar resúmenes y hacer un meta-resumen
        combined = "\n\n".join(summaries)
        return summarize_text_openai(combined)
    
    response = openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Eres un asistente experto en crear resúmenes ejecutivos concisos pero completos. Resume la transcripción de la reunión destacando los puntos clave, decisiones y próximos pasos."},
            {"role": "user", "content": f"Resume esta transcripción de reunión:\n\n{transcript}"}
        ],
        temperature=0.3
    )
    
    summary = response.choices[0].message.content.strip()
    logger.info(f"✅ Resumen completado: {len(summary)} caracteres")
    
    return summary

def summarize_meeting(transcript: str) -> str:
    """
    Resumir reunión con el modelo configurado
    
    Args:
        transcript: Transcripción a resumir
        
    Returns:
        str: Resumen
    """
    # Por ahora solo implementamos OpenAI
    return summarize_text_openai(transcript)

def extract_action_items_openai(transcript: str) -> str:
    """
    Extraer elementos de acción usando OpenAI
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Elementos de acción en formato estructurado
    """
    logger.info("📋 Extrayendo acciones con OpenAI")
    
    response = openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Eres un asistente experto en identificar elementos de acción concretos en transcripciones de reuniones. Extrae todos los elementos de acción mencionados, incluyendo quién es responsable, qué debe hacer y cualquier fecha límite mencionada. Presenta los resultados en una lista clara y estructurada."},
            {"role": "user", "content": f"Extrae los elementos de acción de esta transcripción de reunión:\n\n{transcript}"}
        ],
        temperature=0.3
    )
    
    actions = response.choices[0].message.content.strip()
    logger.info(f"✅ Extracción de acciones completada: {len(actions)} caracteres")
    
    return actions

def extract_action_items(transcript: str) -> str:
    """
    Extraer elementos de acción con el modelo configurado
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Elementos de acción
    """
    # Por ahora solo implementamos OpenAI
    return extract_action_items_openai(transcript)

def analyze_sentiment_openai(transcript: str) -> Dict:
    """
    Analizar sentimiento usando OpenAI
    
    Args:
        transcript: Transcripción
        
    Returns:
        Dict: Análisis de sentimiento
    """
    logger.info("🔍 Analizando sentimiento con OpenAI")
    
    response = openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "Eres un analista experto de sentimiento y tono en reuniones. Analiza la transcripción y proporciona un análisis del sentimiento general (positivo, neutro, negativo), nivel de confianza (0.0-1.0), y 3-5 insights clave sobre el tono, nivel de participación y dinámica de la reunión."},
            {"role": "user", "content": f"Analiza el sentimiento de esta transcripción de reunión y devuelve el resultado en formato JSON con los campos overall_sentiment, confidence y key_insights:\n\n{transcript}"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    sentiment_json = response.choices[0].message.content.strip()
    sentiment = json.loads(sentiment_json)
    logger.info("✅ Análisis de sentimiento completado")
    
    return sentiment

def analyze_sentiment(transcript: str) -> Dict:
    """
    Analizar sentimiento con el modelo configurado
    
    Args:
        transcript: Transcripción
        
    Returns:
        Dict: Análisis de sentimiento
    """
    # Por ahora solo implementamos OpenAI
    return analyze_sentiment_openai(transcript)

def generate_meeting_minutes_openai(transcript: str) -> str:
    """
    Generar minutas de reunión usando OpenAI
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Minutas en formato estructurado
    """
    logger.info("📄 Generando minutas con OpenAI")
    
    # Obtener resumen
    summary = summarize_text_openai(transcript)
    
    # Extraer acciones
    actions = extract_action_items_openai(transcript)
    
    # Analizar sentimiento
    sentiment = analyze_sentiment_openai(transcript)
    
    # Generar minutas
    minutes = f"""
# 📝 MINUTAS DE REUNIÓN
═════════════════════════════════════════════════════════════════

## 📋 RESUMEN:
{summary}

## ✅ ELEMENTOS DE ACCIÓN:
{actions}

"""
    
    minutes += f"""
    
📊 ANÁLISIS DE SENTIMIENTO:
══════════════════════════════════════════════════════════════
• Sentimiento general: {sentiment['overall_sentiment']}
• Confianza: {sentiment['confidence']:.1%}

📈 Insights clave:
"""
    
    for insight in sentiment['key_insights']:
        minutes += f"    • {insight}\n"
    
    minutes += "\n═════════════════════════════════════════════════════════════\n"
    
    return minutes

def generate_meeting_minutes(transcript: str) -> str:
    """
    Generar minutas con el modelo configurado
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Minutas
    """
    # Por ahora solo implementamos OpenAI
    return generate_meeting_minutes_openai(transcript)

def process_transcript_chunk(meeting_id: str, transcript_chunk: str, platform: str) -> Dict:
    """
    Procesar chunk de transcripción en tiempo real
    
    Args:
        meeting_id: ID de la reunión
        transcript_chunk: Fragmento de transcripción
        platform: Plataforma (zoom, google_meet, teams)
        
    Returns:
        Dict: Resultado del procesamiento
    """
    logger.info(f"📄 Procesando chunk de transcripción para reunión {meeting_id}")
    
    # En un sistema completo, podríamos:
    # 1. Guardar en una base de datos en tiempo real
    # 2. Actualizar un resumen incremental
    # 3. Identificar acciones importantes
    
    # Versión simple para demostración:
    response = openai_client.chat.completions.create(
        model="gpt-3.5-turbo",  # Modelo más rápido para procesamiento en tiempo real
        messages=[
            {"role": "system", "content": "Identifica cualquier decisión importante o elemento de acción en este fragmento de transcripción. Si no hay ninguno, responde con 'No se identificaron elementos importantes'."},
            {"role": "user", "content": transcript_chunk}
        ],
        temperature=0.3,
        max_tokens=100
    )
    
    analysis = response.choices[0].message.content.strip()
    
    return {
        "meeting_id": meeting_id,
        "platform": platform,
        "chunk_length": len(transcript_chunk),
        "timestamp": datetime.now().isoformat(),
        "analysis": analysis
    }

# ═══════════════════════════════════════════════════════════════════════════
# HERRAMIENTAS MCP
# ═══════════════════════════════════════════════════════════════════════════

def transcribe_audio_tool(video_url: str) -> str:
    """
    Herramienta MCP para transcribir audio/video
    
    Args:
        video_url: URL del video/audio
        
    Returns:
        str: Transcripción
    """
    try:
        # Descargar video
        video_path = download_video(video_url)
        
        # Extraer audio
        audio_path = extract_audio(video_path)
        
        # Transcribir audio
        transcript = transcribe_audio(audio_path)
        
        # Limpiar archivos temporales (opcional)
        # os.unlink(video_path)
        # os.unlink(audio_path)
        
        return transcript
    except Exception as e:
        logger.error(f"❌ Error en herramienta transcribe_audio: {str(e)}")
        return f"Error: {str(e)}"

def translate_text_tool(text: str, target_language: str) -> str:
    """
    Herramienta MCP para traducir texto
    
    Args:
        text: Texto a traducir
        target_language: Idioma destino
        
    Returns:
        str: Texto traducido
    """
    try:
        return translate_text(text, target_language)
    except Exception as e:
        logger.error(f"❌ Error en herramienta translate_text: {str(e)}")
        return f"Error: {str(e)}"

def summarize_meeting_tool(transcript: str) -> str:
    """
    Herramienta MCP para resumir reunión
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Resumen
    """
    try:
        return summarize_meeting(transcript)
    except Exception as e:
        logger.error(f"❌ Error en herramienta summarize_meeting: {str(e)}")
        return f"Error: {str(e)}"

def extract_action_items_tool(transcript: str) -> str:
    """
    Herramienta MCP para extraer elementos de acción
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Elementos de acción
    """
    try:
        return extract_action_items(transcript)
    except Exception as e:
        logger.error(f"❌ Error en herramienta extract_action_items: {str(e)}")
        return f"Error: {str(e)}"

def analyze_sentiment_tool(transcript: str) -> Dict:
    """
    Herramienta MCP para analizar sentimiento
    
    Args:
        transcript: Transcripción
        
    Returns:
        Dict: Análisis de sentimiento
    """
    try:
        return analyze_sentiment(transcript)
    except Exception as e:
        logger.error(f"❌ Error en herramienta analyze_sentiment: {str(e)}")
        return {"error": str(e)}

def generate_meeting_minutes_tool(transcript: str) -> str:
    """
    Herramienta MCP para generar minutas
    
    Args:
        transcript: Transcripción
        
    Returns:
        str: Minutas
    """
    try:
        return generate_meeting_minutes(transcript)
    except Exception as e:
        logger.error(f"❌ Error en herramienta generate_meeting_minutes: {str(e)}")
        return f"Error: {str(e)}"

def process_transcript_chunk_tool(meeting_id: str, transcript_chunk: str, platform: str) -> Dict:
    """
    Herramienta MCP para procesar chunk de transcripción
    
    Args:
        meeting_id: ID de la reunión
        transcript_chunk: Fragmento de transcripción
        platform: Plataforma (zoom, google_meet, teams)
        
    Returns:
        Dict: Resultado del procesamiento
    """
    try:
        return process_transcript_chunk(meeting_id, transcript_chunk, platform)
    except Exception as e:
        logger.error(f"❌ Error en herramienta process_transcript_chunk: {str(e)}")
        return {"error": str(e)}

# ═══════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE FASTMCP
# ═══════════════════════════════════════════════════════════════════════════

# Crear instancia de FastMCP con stateless_http=True para evitar problemas de session ID
mcp = FastMCP("Meeting Processor AI", stateless_http=True)

# Registrar herramientas usando decoradores
@mcp.tool()
def transcribe_audio(video_url: str) -> str:
    """Transcribe audio/video from URL to text"""
    return transcribe_audio_tool(video_url)

@mcp.tool()
def translate_text(text: str, target_language: str = "es") -> str:
    """Translate text to another language"""
    return translate_text_tool(text, target_language)

@mcp.tool(name="summarize_meeting")
def summarize_meeting_mcp(transcript: str) -> dict:
    """Generate a concise summary of meeting transcript"""
    try:
        # Llamar a la función de implementación real
        result = summarize_text_openai(transcript)
        return {
            "success": True,
            "summary": result,
            "transcript_length": len(transcript)
        }
    except Exception as e:
        logger.error(f"❌ Error en herramienta summarize_meeting: {str(e)}")
        
        # Parsear error de OpenAI si es posible
        error_dict = {
            "success": False,
            "error_type": type(e).__name__,
            "error_message": str(e)
        }
        
        # Si es un error de OpenAI, extraer detalles
        if hasattr(e, 'response'):
            try:
                error_dict["status_code"] = e.response.status_code
                error_dict["error_details"] = e.response.json()
            except:
                pass
        
        return error_dict

@mcp.tool()
def extract_action_items(transcript: str) -> str:
    """Extract action items from meeting transcript"""
    return extract_action_items_tool(transcript)

@mcp.tool()
def analyze_sentiment(transcript: str) -> str:
    """Analyze sentiment and tone of meeting transcript"""
    return analyze_sentiment_tool(transcript)

@mcp.tool()
def generate_meeting_minutes(transcript: str) -> str:
    """Generate comprehensive meeting minutes"""
    return generate_meeting_minutes_tool(transcript)

@mcp.tool()
def process_transcript_chunk(meeting_id: str, transcript_chunk: str, platform: str) -> str:
    """Process a chunk of transcription in real-time"""
    return process_transcript_chunk_tool(meeting_id, transcript_chunk, platform)

# ═══════════════════════════════════════════════════════════════════════════
# NOTA IMPORTANTE SOBRE DOCUMENTACIÓN
# ═══════════════════════════════════════════════════════════════════════════
# MCP usa JSON-RPC 2.0, NO tiene Swagger automático como FastAPI.
# La documentación se proporciona en el README.md
#
# Para usar el MCP Server:
# POST http://localhost:8000/mcp
# Body: {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {...}}
#
# Herramientas disponibles:
# - transcribe_audio(video_url)
# - translate_text(text, target_language)
# - summarize_meeting(transcript)
# - extract_action_items(transcript)
# - analyze_sentiment(transcript)
# - generate_meeting_minutes(transcript)
# - process_transcript_chunk(meeting_id, transcript_chunk, platform)
# ═══════════════════════════════════════════════════════════════════════════


if __name__ == "__main__":
    print("🚀 Iniciando MCP Meeting Processor Pro...")
    print()
    print("📡 Endpoint MCP:")
    print("  POST http://localhost:8001/mcp")
    print("  Protocolo: JSON-RPC 2.0")
    print()
    print("📋 Herramientas disponibles:")
    print("  • transcribe_audio(video_url)")
    print("  • translate_text(text, target_language)")
    print("  • summarize_meeting(transcript)")
    print("  • extract_action_items(transcript)")
    print("  • analyze_sentiment(transcript)")
    print("  • generate_meeting_minutes(transcript)")
    print("  • process_transcript_chunk(meeting_id, transcript_chunk, platform)")
    print()
    print("🔗 Modelos configurados:")
    print(f"  • Transcripción: {TRANSCRIPTION_MODEL}")
    print(f"  • LLM: {LLM_MODEL} ({OPENAI_MODEL if LLM_MODEL == 'openai' else GOOGLE_MODEL})")
    print()
    print("📚 Documentación completa en README.md")
    print()
    
    # Iniciar servidor
    mcp.run(
        transport="http",
        host="0.0.0.0",
        port=8001,
        middleware=[
            Middleware(
                CORSMiddleware,
                allow_origins=["*"],
                allow_credentials=True,
                allow_methods=["*"],
                allow_headers=["*"],
                expose_headers=["mcp-session-id", "Mcp-Session-Id"]  # Exponer header de sesión para CORS
            )
        ]
    )
