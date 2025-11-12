# Helper commands

## Create a virtual environment

```bash
python3 -m venv env
```

## Activate the virtual environment

```bash
source env/bin/activate
```

## Deactivate the virtual environment

```bash
deactivate
```

## Install requirements

```bash
pip install -r requirements.txt
```

## Create a Django project

```bash
django-admin startproject backend
```

## Create a Django app

```bash
cd backend
python manage.py startapp api
```

## Make migrations

```bash
python manage.py makemigrations
```

## Migrate

```bash
python manage.py migrate
```

## Run server

```bash
python manage.py runserver
```
