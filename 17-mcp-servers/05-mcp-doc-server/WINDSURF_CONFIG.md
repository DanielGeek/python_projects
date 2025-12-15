# Configuración de MCP Doc Server en Windsurf

## 📋 Configuración para Windsurf

### Ubicación del archivo de configuración

**macOS:**

```text
~/Library/Application Support/Windsurf/User/globalStorage/codeium.codeium/config.json
```

### Configuración a añadir

Abre el archivo de configuración y añade el servidor MCP:

```json
{
  "mcpServers": {
    "mcp-docs": {
      "command": "uvx",
      "args": [
        "--from",
        "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server",
        "mcp-doc-server"
      ],
      "env": {}
    }
  }
}
```

**⚠️ Importante:** Actualiza la ruta en `args` si tu proyecto está en una ubicación diferente.

### Si ya tienes otros servidores MCP configurados

Si ya tienes otros servidores MCP (como langgraph-docs-mcp), tu configuración debería verse así:

```json
{
  "mcpServers": {
    "langgraph-docs-mcp": {
      "command": "uvx",
      "args": [
        "langgraph-docs-mcp",
        "--urls",
        "https://langchain-ai.github.io/langgraph/llms.txt"
      ]
    },
    "mcp-docs": {
      "command": "uvx",
      "args": [
        "--from",
        "/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server",
        "mcp-doc-server"
      ],
      "env": {}
    }
  }
}
```

## 🚀 Pasos de Instalación

### 1. Instalar dependencias

```bash
cd /Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server
uv sync
```

### 2. Probar el servidor

```bash
uvx --from . mcp-doc-server
```

Deberías ver que el servidor se inicia correctamente. Presiona `Ctrl+C` para detenerlo.

### 3. Añadir configuración a Windsurf

Edita el archivo de configuración de Windsurf y añade la configuración mostrada arriba.

### 4. Reiniciar Windsurf

Cierra completamente Windsurf y vuelve a abrirlo para que cargue la nueva configuración.

## 🔧 Uso en Windsurf

Una vez configurado, puedes usar estos comandos en el chat de Windsurf:

### Listar fuentes disponibles

```text
¿Qué documentación está disponible?
```

El servidor responderá con las fuentes disponibles.

### Consultar documentación

```text
¿Cómo implemento una herramienta MCP en Python?
```

```text
Muéstrame la documentación sobre recursos en MCP
```

```text
¿Qué dice el README del Python SDK?
```

## 🐛 Troubleshooting

### El servidor no aparece en Windsurf

1. Verifica que la ruta en `args` sea correcta y absoluta
2. Asegúrate de que el archivo `config.json` esté en la ubicación correcta
3. Reinicia Windsurf completamente

### Error al ejecutar el servidor

```bash
# Verifica que las dependencias estén instaladas
cd /Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/05-mcp-doc-server
source .venv/bin/activate
python server.py
```

### El servidor se ejecuta pero no responde

1. Verifica que tengas conexión a internet
2. Prueba acceder a las URLs manualmente en tu navegador
3. Revisa los logs de Windsurf para ver errores específicos

## 📚 URLs Soportadas

- **MCP Official:** <https://modelcontextprotocol.io/>
- **Python SDK:** <https://github.com/modelcontextprotocol/python-sdk>
