# 21 — GitHub Actions CI/CD Pipeline

> **App Repository**: [DanielGeek/app-github-action](https://github.com/DanielGeek/app-github-action)

This module demonstrates how to automate testing and deployment workflows using **GitHub Actions** — GitHub's built-in CI/CD platform. It covers the full lifecycle of a continuous integration pipeline: from writing reusable workflow YAML files to running automated tests on every push and pull request.

---

## What You Will Learn

- Structure of a GitHub Actions workflow (`.github/workflows/*.yml`)
- Triggers: `push`, `pull_request`, `workflow_dispatch`
- Jobs, steps, and runners (`ubuntu-latest`)
- Using community actions (e.g., `actions/checkout`, `actions/setup-python`)
- Running `pytest` unit tests automatically in the pipeline
- Environment variables and secrets management
- Caching dependencies for faster builds

---

## Project Structure (app-github-action)

```
app-github-action/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI workflow definition
├── .vscode/                # VS Code workspace settings
├── src/                    # Application source code
├── tests/                  # pytest unit tests
├── requirements.txt        # Python dependencies
└── README.md               # Project documentation
```

---

## Workflow Overview

The CI workflow (`.github/workflows/ci.yml`) is triggered on every `push` and `pull_request` to the `main` branch and performs the following steps:

1. **Checkout code** — `actions/checkout@v3`
2. **Set up Python** — `actions/setup-python@v4` (Python 3.x)
3. **Install dependencies** — `pip install -r requirements.txt`
4. **Run tests** — `pytest tests/` with verbose output

---

## Running Locally

```bash
# Clone the app repository
git clone https://github.com/DanielGeek/app-github-action.git
cd app-github-action

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run tests manually
pytest tests/ -v
```

---

## Triggering the Pipeline

Once the repository is pushed to GitHub, every commit to `main` (or any open pull request) automatically triggers the workflow. You can monitor runs in the **Actions** tab of the repository:

```
https://github.com/DanielGeek/app-github-action/actions
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **Workflow** | YAML file in `.github/workflows/` that defines the automation |
| **Trigger (`on`)** | Events that start the workflow (`push`, `pull_request`, etc.) |
| **Job** | A set of steps executed on the same runner |
| **Step** | A single task (shell command or marketplace action) |
| **Runner** | The virtual machine that executes the job (`ubuntu-latest`) |
| **Action** | A reusable unit of work from the GitHub Marketplace |
| **Secret** | Encrypted environment variable stored in repository settings |

---

## Related Resources

- 🔗 [GitHub Actions Documentation](https://docs.github.com/en/actions)
- 🔗 [GitHub Marketplace — Actions](https://github.com/marketplace?type=actions)
- 🔗 [App Repository](https://github.com/DanielGeek/app-github-action)

---

## License

MIT — Part of the 86-MLOps learning path.
