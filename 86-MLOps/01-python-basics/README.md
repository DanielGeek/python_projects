# Python Basics - Project 01

## Description

This project contains fundamental Python programming examples and exercises as part of the MLOps learning path. The project focuses on Python basics including comments, syntax, and core programming concepts.

## Project Structure

```
01-python-basics/
├── README.md           # This file
├── requirements.txt    # Python dependencies
├── test.py            # Basic Python examples (comments)
└── test.ipynb         # Jupyter notebook with Python examples
```

## Prerequisites

- Python 3.12 or higher
- Conda package manager (recommended)
- Git (for version control)

## Setup Instructions

### 1. Create Virtual Environment

```bash
conda create -p venv python==3.12
```

### 2. Activate Virtual Environment

```bash
conda activate venv/
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## Helpful Commands

### Environment Management

```bash
# Create conda environment with specific Python version
conda create -p venv python==3.12

# Activate the environment
conda activate venv/

# Deactivate the environment
conda deactivate

# Remove the environment
conda remove -p venv --all
```

### Package Management

```bash
# Install dependencies from requirements.txt
pip install -r requirements.txt

# Install a specific package
pip install package_name

# Install package in development mode
pip install -e .

# List installed packages
pip list

# Freeze current packages to requirements.txt
pip freeze > requirements.txt
```

### Running Python Files

```bash
# Run a Python script
python test.py

# Run with python3 (if python points to Python 2)
python3 test.py

# Run with verbose output
python -v test.py
```

### Jupyter Notebook

```bash
# Start Jupyter notebook server
jupyter notebook

# Start Jupyter lab
jupyter lab

# Convert notebook to Python script
jupyter nbconvert --to python test.ipynb

# Convert notebook to HTML
jupyter nbconvert --to html test.ipynb
```

### Git Commands

```bash
# Initialize git repository
git init

# Add files to staging
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote repository
git push origin main

# Pull latest changes
git pull origin main

# Check git status
git status

# View commit history
git log --oneline
```

### Virtual Environment with venv (Alternative to Conda)

```bash
# Create virtual environment
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate

# Deactivate
deactivate
```

## Dependencies

- `ipykernel` - IPython kernel for Jupyter notebooks

## Usage

1. Activate the virtual environment: `conda activate venv/`
2. Run the Python script: `python test.py`
3. Or open the Jupyter notebook: `jupyter notebook test.ipynb`

## Project Goals

- Learn Python syntax and basic programming concepts
- Understand comments (single-line and multi-line)
- Practice writing clean and documented code
- Prepare for more advanced MLOps topics

## License

This project is part of the MLOps learning path.
