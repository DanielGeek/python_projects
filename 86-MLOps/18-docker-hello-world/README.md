
### Comands

### Create environment

```bash
conda create -p venv python=3.10 -c conda-forge -y
```

## To activate this environment, use

```bash
conda activate /Users/thepunisher/Documents/GitHub/python_projects/86-MLOps/18-docker-hello-world/venv
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Docker commands

```bash
docker build -t welcome-app .
```

```bash
docker run -p 5001:5001 welcome-app
```

```bash
docker stop <CONTAINER ID>
```
