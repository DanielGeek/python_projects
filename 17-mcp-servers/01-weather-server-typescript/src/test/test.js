#!/usr/bin/env node

import { spawn } from 'node:child_process';

console.log('🧪 Testing MCP Weather Server...\n');

// Start the MCP server
const mcpServer = spawn('node', ['/Users/thepunisher/Documents/GitHub/python_projects/17-mcp-servers/01-weather-server-typescript/build/index.js']);

let responseBuffer = '';
let requestId = 1;

// Listen for responses from MCP server
mcpServer.stdout.on('data', (data) => {
    responseBuffer += data.toString();

    // Try to parse complete JSON responses
    const lines = responseBuffer.split('\n').filter(line => line.trim());
    lines.forEach(line => {
        if (line.startsWith('{') && line.endsWith('}')) {
            try {
                const response = JSON.parse(line);
                console.log('📥 Response from MCP server:');
                console.log(JSON.stringify(response, null, 2));
                console.log('\n' + '='.repeat(50) + '\n');
            } catch (error) {
                console.error('❌ Failed to parse JSON response:', error.message);
            }
        }
    });
});

// Handle errors
mcpServer.stderr.on('data', (data) => {
    const errorText = data.toString().trim();
    if (!errorText.includes('Weather MCP Server running on stdio')) {
        console.error('❌ Server error:', errorText);
    }
});

mcpServer.on('close', (code) => {
    console.log(`\n🏁 Server process exited with code ${code}`);
});

// Function to send JSON-RPC request
function sendRequest(method, params = {}) {
    const request = {
        jsonrpc: "2.0",
        id: requestId++,
        method: method,
        params: params
    };

    console.log('📤 Sending request:');
    console.log(JSON.stringify(request, null, 2));
    console.log('\n');

    mcpServer.stdin.write(JSON.stringify(request) + '\n');
}

// Wait for server to start, then initialize
setTimeout(() => {
    console.log('🚀 Initializing MCP connection...\n');

    // First, initialize the MCP server
    sendRequest('initialize', {
        protocolVersion: "2024-11-05",
        capabilities: {
            tools: {}
        },
        clientInfo: {
            name: "test-client",
            version: "1.0.0"
        }
    });

    // Wait for initialization, then test tools
    setTimeout(() => {
        console.log('🔧 Listing available tools...\n');
        sendRequest('tools/list');

        // Test forecast tool
        setTimeout(() => {
            console.log('🌤️ Testing get-forecast tool...\n');
            sendRequest('tools/call', {
                name: "get-forecast",
                arguments: {
                    latitude: 37.7749,
                    longitude: -122.4194
                }
            });
        }, 1000);

        // Test alerts tool
        setTimeout(() => {
            console.log('� Testing get-alerts tool...\n');
            sendRequest('tools/call', {
                name: "get-alerts",
                arguments: {
                    state: "CA"
                }
            });

            // Close server after 3 seconds
            setTimeout(() => {
                console.log('🛑 Closing server...');
                mcpServer.kill();
            }, 3000);
        }, 2000);

    }, 1000);

}, 1000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    mcpServer.kill();
    process.exit(0);
});
