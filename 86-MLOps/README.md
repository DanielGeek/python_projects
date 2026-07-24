# 86-MLOps — Python Foundations for Machine Learning

A comprehensive, hands-on Python course designed as the **foundational pillar** for an MLOps learning path. This project covers core to advanced Python concepts through practical Jupyter notebooks, sample scripts, and real-world data analysis exercises.

The curriculum progresses from **Python basics** (syntax, variables, data types) all the way to **file handling, OOP, advanced concepts (generators, decorators), data analysis with NumPy/Pandas, logging, and Flask web development** — providing a solid programming base before diving into machine learning and MLOps tooling.

---

## Table of Contents

- [Modules Overview](#modules-overview)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running Notebooks](#running-notebooks)
- [Helpful Commands](#helpful-commands)
- [Dependencies](#dependencies)
- [License](#license)

---

## Modules Overview

| # | Module | Topics Covered |
|---|--------|----------------|
| 01 | **Python Basics** | Syntax & semantics, comments, variables, data types (`int`, `float`, `str`, `bool`), arithmetic/comparison/logical operators |
| 02 | **Control Flow** | `if`/`elif`/`else` conditional statements, `for` and `while` loops, nested conditions |
| 03 | **Data Structures** | Lists (creation, methods, slicing), tuples, sets, dictionaries |
| 04 | **Functions** | Defining functions, arguments (`*args`, `**kwargs`), lambda functions, `map()`, `filter()` |
| 05 | **Modules & Packages** | `import` statement, Python Standard Library (`os`, `sys`, `math`, `datetime`, etc.), creating custom packages and sub-packages |
| 06 | **File Handling** | Reading/writing text files, binary files, file paths (`pathlib`, `os.path`) |
| 07 | **Exception Handling** | `try`/`except`/`else`/`finally`, custom exceptions, raising errors |
| 08 | **Classes & Objects (OOP)** | Classes, inheritance, polymorphism, encapsulation, abstraction, magic (`__dunder__`) methods, operator overloading, custom exceptions |
| 09 | **Advanced Python Concepts** | Iterators (`__iter__`, `__next__`), generators (`yield`), decorators |
| 10 | **Data Analysis with Python** | NumPy (arrays, broadcasting), Pandas (DataFrames, series), data manipulation (`groupby`, `merge`), reading CSV/Excel files |
| 11 | **Logging in Python** | Basic logging (levels, handlers, formatters), multiple loggers, logging to files |
| 12 | **Flask** *(in progress)* | Web framework basics |

---

## Project Structure

```
86-MLOps/
├── 01-python-basics/              # Variables, data types, operators
│   ├── 1.0-basic.ipynb
│   ├── 1.1-Variables.ipynb
│   ├── 1.2-Datatypes.ipynb
│   ├── 1.3-operators.ipynb
│   └── test.py
├── 02-control-flow/               # Conditionals & loops
│   ├── 2.0-Conditionalstatements.ipynb
│   └── 2.1-Loops.ipynb
├── 03-data-structures/            # Lists, tuples, sets, dicts
│   ├── 3.1-Lists.ipynb
│   ├── 3.1.1-ListExamples.ipynb
│   ├── 3.2-Tuples.ipynb
│   ├── 3.3-Sets.ipynb
│   └── 3.4-Dictionaries.ipynb
├── 04-functions/                  # Functions, lambda, map, filter
│   ├── 4.1-functions.ipynb
│   ├── 4.2-examplesfunctions.ipynb
│   ├── 4.3-Lambda.ipynb
│   ├── 4.4-Mapsfunction.ipynb
│   ├── 4.5-filterfunction.ipynb
│   └── sample.txt
├── 05-modules/                    # Imports, stdlib, custom packages
│   ├── 5.1-import.ipynb
│   ├── 5.2-Standardlibrary.ipynb
│   ├── package/
│   │   ├── __init__.py
│   │   ├── maths.py
│   │   └── subpackages/
│   │       ├── __init__.py
│   │       └── mult.py
│   ├── test.py
│   ├── example.csv
│   ├── source.txt
│   └── destination.txt
├── 06-file-handling/              # File I/O, paths
│   ├── 6.1-fileoperation.ipynb
│   ├── 6.2-filepath.ipynb
│   ├── example.txt
│   ├── example.bin
│   ├── destination.txt
│   └── package/
├── 07-exception-handling/         # Try/except, custom exceptions
│   ├── 7.1-exception.ipynb
│   └── example1.txt
├── 08-class-and-objects/          # OOP: inheritance, polymorphism, etc.
│   ├── 8.1-oops.ipynb
│   ├── 8.2-inheritance.ipynb
│   ├── 8.3-polymorphism.ipynb
│   ├── 8.4-encapsulation.ipynb
│   ├── 8.5-abstraction.ipynb
│   ├── 8.6-magicmethods.ipynb
│   ├── 8.7-operator-overloading.ipynb
│   └── 8.8-customexception.ipynb
├── 09-advance-python-concepts/    # Iterators, generators, decorators
│   ├── 9.1-Iterators.ipynb
│   ├── 9.2-generators.ipynb
│   ├── 9.3-decorators.ipynb
│   └── large_file.txt
├── 10-data-analysis-with-python/  # NumPy, Pandas
│   ├── 10.1-numpy.ipynb
│   ├── 10.2-pandas.ipynb
│   ├── 10.3-datamanipulation.ipynb
│   ├── 10.4-readdata.ipynb
│   ├── data.csv
│   ├── sales_data.csv
│   ├── wine.csv
│   └── sample_data.xlsx
├── 11-logging-in-python/          # Logging fundamentals
│   ├── 11.1-logging.ipynb
│   ├── 11.2-multiplelogger.ipynb
│   ├── app.py
│   ├── app.log
│   ├── app1.log
│   └── logs/
│       ├── app.log
│       ├── logger.py
│       └── test.py
├── 12-flask/                      # Flask (WIP)
├── requirements.txt               # Project-wide Python dependencies
└── README.md                      # This file
```

---

## Setup

### Prerequisites

- Python 3.12+
- `venv` (standard Python virtual environment) or Conda package manager
- Git

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd 86-MLOps

# Option A: Create standard venv environment (Recommended)
python -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows

# Option B: Create conda environment
conda create -n mlops-env python=3.12
conda activate mlops-env

# Install dependencies using the active Python environment
python -m pip install -r requirements.txt
```

---

## Running Notebooks

All modules are built as **Jupyter Notebooks (`.ipynb`)**. Start the notebook server from the project root:

```bash
# Start Jupyter Notebook
jupyter notebook

# Or use Jupyter Lab (recommended for a richer experience)
jupyter lab
```

Navigate to any module folder (e.g., `01-python-basics/`, `08-class-and-objects/`) and open the corresponding `.ipynb` file.

You can also run individual Python scripts and web applications:

```bash
# Example: run a test script from module 01
python 01-python-basics/test.py

# Example: run the Flask web app from module 12
cd 12-flask
python app.py
```

---

## Helpful Commands

### Environment Management

```bash
# Create conda environment
conda create -p venv python==3.12

# Activate
conda activate venv/

# Deactivate
conda deactivate

# Remove environment
conda remove -p venv --all

# Alternative with venv
python -m venv venv
source venv/bin/activate   # macOS/Linux
deactivate
```

### Package Management

```bash
# Install dependencies in the active environment
python -m pip install -r requirements.txt

# Install a specific package
python -m pip install package_name

# List installed packages
python -m pip list

# Freeze current packages to requirements.txt
python -m pip freeze > requirements.txt
```

### Jupyter Notebook Commands

```bash
# Start notebook server
jupyter notebook

# Start Jupyter Lab
jupyter lab

# Convert notebook to Python script
jupyter nbconvert --to python notebook.ipynb

# Convert notebook to HTML
jupyter nbconvert --to html notebook.ipynb
```

### Git Commands

```bash
# Initialize repository
git init

# Add all files to staging
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Check status
git status

# View commit history
git log --oneline
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `ipykernel` | IPython kernel for Jupyter notebooks |
| `numpy` | Numerical computing (arrays, linear algebra) |
| `pandas` | Data manipulation and analysis (DataFrames) |
| `flask` | Lightweight WSGI web application framework |

All dependencies are defined in `requirements.txt`. If you need additional packages (e.g. `openpyxl` for Excel handling), install them using:

```bash
python -m pip install openpyxl
```

---

## Learning Path

This project is **module 01–12** within a broader MLOps curriculum:

```
Python Foundations (you are here) → ML Libraries → MLOps Tooling → Production Deployment
```

Each module builds on the previous one. By the end, you will have a solid grasp of Python programming, data manipulation, and software engineering practices — the essential prerequisites for machine learning and MLOps.

---

## License

MIT — This project is part of an MLOps learning path.