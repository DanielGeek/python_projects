#!/usr/bin/env python3
"""
Cliente de prueba para MCP Server
Demuestra cómo llamar correctamente al MCP Server
"""

import requests
import json

# URL del MCP Server
MCP_URL = "http://localhost:8000/mcp"

# Headers requeridos por FastMCP
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
}

def test_summarize_meeting():
    """Probar la herramienta summarize_meeting"""
    
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "summarize_meeting",
            "arguments": {
                "transcript": "Esta es una reunión de prueba donde discutimos el proyecto de IA. Acordamos implementar FastMCP para el procesamiento y usar Playwright para la grabación."
            }
        }
    }
    
    print("🔄 Enviando solicitud al MCP Server...")
    print(f"📡 URL: {MCP_URL}")
    print(f"📝 Herramienta: summarize_meeting")
    print()
    
    try:
        response = requests.post(MCP_URL, headers=headers, json=payload)
        
        print(f"📊 Status Code: {response.status_code}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Respuesta exitosa:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("❌ Error:")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")

def test_translate_text():
    """Probar la herramienta translate_text"""
    
    payload = {
        "jsonrpc": "2.0",
        "id": 2,
        "method": "tools/call",
        "params": {
            "name": "translate_text",
            "arguments": {
                "text": "Hello, this is a test meeting",
                "target_language": "es"
            }
        }
    }
    
    print("\n" + "="*60)
    print("🔄 Probando traducción...")
    print()
    
    try:
        response = requests.post(MCP_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Traducción exitosa:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("❌ Error:")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("="*60)
    print("🧪 CLIENTE DE PRUEBA - MCP SERVER")
    print("="*60)
    print()
    
    # Probar summarize_meeting
    test_summarize_meeting()
    
    # Probar translate_text
    test_translate_text()
    
    print("\n" + "="*60)
    print("✅ Pruebas completadas")
    print("="*60)
