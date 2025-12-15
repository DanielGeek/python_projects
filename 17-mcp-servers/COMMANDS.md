
# MCP Servers - Commands and Setup Guide

## 📋 Overview

This guide contains the essential commands for setting up and managing MCP (Model Context Protocol) servers in this repository. Each command includes detailed explanations of its purpose and usage.

---

## 🚀 Project Initialization Commands

### 1. Initialize New MCP Server Project

```bash
uv init 04-shellserver
```

**Purpose:** Creates a new Python project structure using UV package manager.

- Initializes a new Python project in directory `04-shellserver`
- Creates `pyproject.toml` with basic project metadata
- Sets up standard Python project structure
- Uses UV for fast dependency management

### 2. Navigate to Project Directory

```bash
cd 04-shellserver
```

**Purpose:** Changes the current working directory to the newly created project folder.

- Essential for all subsequent commands to run in correct context
- All project-specific operations will be performed from this directory

### 3. Create Virtual Environment

```bash
uv venv
```

**Purpose:** Creates an isolated Python virtual environment for the project.

- Ensures project dependencies don't conflict with system Python
- Creates `.venv` directory with isolated Python interpreter
- Provides clean environment for MCP server dependencies
- Follows Python best practices for project isolation

### 4. Activate Virtual Environment

```bash
source .venv/bin/activate
```

**Purpose:** Activates the virtual environment for the current terminal session.

- Modifies PATH to use virtual environment's Python interpreter
- Ensures all installed packages are isolated to this project
- Required before installing dependencies or running the server
- Must be run in each new terminal session

### 5. Install MCP CLI Package

```bash
uv add "mcp[cli]"
```

**Purpose:** Installs the MCP (Model Context Protocol) package with CLI support.

- Adds MCP library to project dependencies in `pyproject.toml`
- Includes CLI tools for MCP server development and testing
- Provides core functionality for building MCP servers
- Enables command-line utilities for MCP operations

---

## 🛠 Development Commands

### 6. Install Additional Dependencies

```bash
uv add fastmcp
```

**Purpose:** Installs FastMCP, a high-level framework for building MCP servers.

- Provides simplified API for MCP server creation
- Includes decorators and utilities for tools, resources, and prompts
- Reduces boilerplate code for MCP server development
- Commonly used for rapid MCP server prototyping

### 7. Run MCP Server

```bash
python server.py
```

**Purpose:** Starts the MCP server for development and testing.

- Executes the main server file containing MCP implementation
- Server runs in stdio mode for IDE integration
- Provides tools and resources to connected AI assistants
- Must be run from activated virtual environment

### 8. Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

**Purpose:** Launches the MCP Inspector for testing and debugging MCP servers.

- Provides web interface for testing MCP server functionality
- Allows inspection of available tools, resources, and prompts
- Useful for debugging server implementations
- Runs independently of the MCP server

---

## 🔧 Configuration Commands

### 9. Install Development Dependencies

```bash
uv add --dev pytest black flake8
```

**Purpose:** Installs development tools for code quality and testing.

- `pytest`: Testing framework for unit and integration tests
- `black`: Code formatter for consistent Python style
- `flake8`: Linter for code quality and style checking
- Essential for maintaining code standards in MCP projects

### 10. Format Code

```bash
black .
```

**Purpose:** Formats all Python files in the project using Black formatter.

- Ensures consistent code style across the project
- Automatically fixes formatting issues
- Improves code readability and maintainability
- Should be run before committing changes

### 11. Run Linting

```bash
flake8 .
```

**Purpose:** Checks code quality and style using Flake8 linter.

- Identifies potential code issues and style violations
- Enforces Python coding standards (PEP 8)
- Catches common bugs and anti-patterns
- Should be run before committing changes

### 12. Run Tests

```bash
pytest
```

**Purpose:** Executes all tests in the project using pytest.

- Runs unit tests and integration tests
- Validates MCP server functionality
- Ensures code changes don't break existing features
- Essential for maintaining code quality

---

## 📦 Package Management Commands

### 13. Update Dependencies

```bash
uv sync
```

**Purpose:** Synchronizes project dependencies with lock file.

- Updates all packages to latest compatible versions
- Ensures consistent dependency versions across environments
- Resolves and installs any new dependencies
- Important for keeping dependencies up-to-date

### 14. Export Requirements

```bash
uv pip freeze > requirements.txt
```

**Purpose:** Exports current dependencies to requirements.txt file.

- Creates portable dependency list for deployment
- Useful for environments without UV
- Documents exact package versions used
- Helpful for reproducible builds

### 15. Clean Virtual Environment

```bash
rm -rf .venv
```

**Purpose:** Removes the virtual environment completely.

- Useful for starting fresh with clean environment
- Resolves dependency conflicts or corruption issues
- Should be followed by recreating the environment
- Deletes all installed packages and cache

---

## 🔍 Debugging Commands

### 16. Check Python Version

```bash
python --version
```

**Purpose:** Displays the current Python interpreter version.

- Ensures compatible Python version is being used
- Helps diagnose version-specific issues
- Confirms virtual environment is active
- Useful for troubleshooting environment problems

### 17. List Installed Packages

```bash
uv pip list
```

**Purpose:** Shows all packages installed in the current environment.

- Verifies MCP and related packages are installed
- Helps check dependency versions
- Useful for debugging missing packages
- Displays package names and versions

### 18. Show Package Details

```bash
uv show mcp
```

**Purpose:** Displays detailed information about the MCP package.

- Shows package version, dependencies, and metadata
- Helps understand MCP installation details
- Useful for troubleshooting MCP-specific issues
- Displays package homepage and documentation links

---

## 🌐 Network and Testing Commands

### 19. Test Server Connection

```bash
curl -X POST http://localhost:3000/tools/list
```

**Purpose:** Tests MCP server HTTP endpoint (if configured).

- Verifies server is responding to requests
- Lists available tools from the MCP server
- Useful for HTTP-based MCP server testing
- Helps debug server connectivity issues

### 20. Check Port Usage

```bash
lsof -i :3000
```

**Purpose:** Shows which process is using the specified port.

- Helps identify port conflicts
- Useful for debugging server startup issues
- Shows process ID and program name
- Essential for troubleshooting network problems

---

## 📋 Quick Reference Summary

### Essential Setup Sequence

1. `uv init project-name` - Create project
2. `cd project-name` - Navigate to project
3. `uv venv` - Create virtual environment
4. `source .venv/bin/activate` - Activate environment
5. `uv add "mcp[cli]"` - Install MCP package

### Development Workflow

1. `uv add package-name` - Add dependencies
2. `python server.py` - Run server
3. `black .` - Format code
4. `flake8 .` - Check code quality
5. `pytest` - Run tests

### Troubleshooting

1. `python --version` - Check Python version
2. `uv pip list` - List installed packages
3. `lsof -i :port` - Check port usage
4. `rm -rf .venv && uv venv` - Reset environment

---

**Last Updated:** December 2024

**Version:** 1.0.0

**Maintainer:** MCP Development Community
