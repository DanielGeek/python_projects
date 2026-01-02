#!/bin/bash
# Development server with hot reload using watchdog
# Usage: ./run_dev.sh or bash run_dev.sh

echo "🚀 Starting development server with hot reload..."
echo "📝 Watching for changes in .py and .json files"
echo "⏹️  Press Ctrl+C to stop"
echo ""

# Set development environment
export GRADIO_ENV=dev

# Run with watchdog
uv run watchmedo auto-restart \
    --patterns="*.py;*.json" \
    --ignore-patterns="*.pyc;__pycache__/*;.git/*;.venv/*" \
    --recursive \
    -- uv run app.py
