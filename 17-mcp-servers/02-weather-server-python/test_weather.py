#!/usr/bin/env python3
"""Test script for MCP Weather Server (Python version)."""

import json
import subprocess
import threading
import time
from typing import Any

def read_output(process: subprocess.Popen) -> None:
    """Read and print output from the server in a separate thread."""
    print("📥 Server responses:\n")
    print("=" * 50)
    
    while True:
        try:
            line = process.stdout.readline()
            if not line:
                break
            if line.strip():
                try:
                    response = json.loads(line)
                    print(json.dumps(response, indent=2))
                    print("\n" + "=" * 50 + "\n")
                except json.JSONDecodeError:
                    print(f"Non-JSON output: {line.strip()}")
        except Exception as e:
            print(f"Error reading output: {e}")
            break

def send_request(process: subprocess.Popen, method: str, params: dict[str, Any], request_id: int) -> None:
    """Send a JSON-RPC request to the MCP server."""
    request = {
        "jsonrpc": "2.0",
        "id": request_id,
        "method": method,
        "params": params
    }
    
    print(f"📤 Sending {method} request (ID: {request_id})")
    
    try:
        process.stdin.write(json.dumps(request) + "\n")
        process.stdin.flush()
    except BrokenPipeError:
        print(f"❌ Failed to send request - server may have closed")

def main():
    """Run the test suite for the weather MCP server."""
    print("🧪 Testing MCP Weather Server (Python)...\n")
    
    # Start the MCP server
    process = subprocess.Popen(
        ["python3", "weather.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1
    )
    
    # Start output reader thread
    output_thread = threading.Thread(target=read_output, args=(process,), daemon=True)
    output_thread.start()
    
    # Give server time to start
    time.sleep(1)
    
    request_id = 1
    
    try:
        print("🚀 Testing MCP Weather Server...\n")
        
        # Initialize the MCP server
        print("1️⃣ Initializing connection...")
        send_request(process, "initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {"tools": {}},
            "clientInfo": {"name": "test-client", "version": "1.0.0"}
        }, request_id)
        request_id += 1
        time.sleep(2)
        
        # List available tools
        print("2️⃣ Listing available tools...")
        send_request(process, "tools/list", {}, request_id)
        request_id += 1
        time.sleep(2)
        
        # Test get-forecast tool
        print("3️⃣ Testing get-forecast for San Francisco...")
        send_request(process, "tools/call", {
            "name": "get-forecast",
            "arguments": {
                "latitude": 37.7749,
                "longitude": -122.4194
            }
        }, request_id)
        request_id += 1
        time.sleep(3)
        
        # Test get-alerts tool
        print("4️⃣ Testing get-alerts for California...")
        send_request(process, "tools/call", {
            "name": "get-alerts",
            "arguments": {
                "state": "CA"
            }
        }, request_id)
        request_id += 1
        time.sleep(3)
        
        print("\n✅ All tests completed!\n")
        
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    finally:
        print("🛑 Closing server...")
        process.terminate()
        try:
            process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            process.kill()
        print("🏁 Server process terminated\n")

if __name__ == "__main__":
    main()
