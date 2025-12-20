#!/usr/bin/env node

// Force Node.js v24.9.0 environment
process.env.PATH = '/Users/thepunisher/.nvm/versions/node/v24.9.0/bin:' + process.env.PATH;

// Import and run mcp-remote
const { spawn } = require('child_process');

const args = process.argv.slice(2);

const mcpRemote = spawn('/Users/thepunisher/.nvm/versions/node/v24.9.0/bin/mcp-remote', args, {
    stdio: 'inherit',
    env: process.env
});

mcpRemote.on('exit', (code) => {
    process.exit(code);
});
