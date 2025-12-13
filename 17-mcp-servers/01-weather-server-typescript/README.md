# A Simple MCP weather Server written in TypeScript

See the [Quickstart](https://modelcontextprotocol.io/quickstart) tutorial for more information.

## Helpfull commands

```bash
npm run build
```

## Testing the server

```bash
node src/test/test.js | grep -A 50 "📥 Response from MCP server"
```

## Use MCP Inspector

```bash
# Instala MCP Inspector:
npm install -g @modelcontextprotocol/inspector
# Ejecuta tu server con el inspector:
mcp-inspector node build/index.js
```
