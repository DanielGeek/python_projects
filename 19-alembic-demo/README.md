# Alembic Demo Project

This project demonstrates the use of **Alembic** for managing database migrations with **PostgreSQL** in a Python development environment.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Python 3.14+
- Homebrew (macOS) for dependency installation

## 🐳 PostgreSQL Container Setup

### 1. Create Docker Container

```bash
docker run --name alembic-demo \
  -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=alembic_db \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Verify Container

```bash
# Check if container is running
docker ps

# View container logs
docker logs alembic-demo
```

### 3. Connect to PostgreSQL (optional)

```bash
# Connect directly to the database
docker exec -ti alembic-demo psql -U postgres -d alembic_db
```

## 🐍 Python Environment Setup

### 1. Create Virtual Environment

```bash
# Navigate to project directory
cd /Users/thepunisher/Documents/GitHub/python_projects/19-alembic-demo

# Create virtual environment
python3 -m venv venv
```

### 2. Activate Virtual Environment

```bash
# Activate virtual environment
source venv/bin/activate

# Verify it's active (you'll see (venv) in the prompt)
(venv) thepunisher@Daniels-MacBook-Pro 19-alembic-demo %
```

### 3. Install Dependencies

```bash
# Install Alembic and PostgreSQL driver
uv add install alembic psycopg2
# OR
python -m pip install alembic psycopg2-binary
```

**Note**: We use `psycopg2-binary` instead of `psycopg2` to avoid compilation issues on macOS.

## 🔄 Alembic Configuration

### 1. Initialize Alembic

```bash
# Initialize Alembic in the project
alembic init myapp
```

This creates the following structure:

```text
myapp/
├── versions/          # Directory for migrations
├── env.py            # Environment configuration
├── script.py.mako    # Migration template
└── README            # Alembic documentation
alembic.ini           # Main configuration file
```

### 2. Configure Database Connection

Edit `alembic.ini` and modify the database URL:

```ini
# Line 87 in alembic.ini
sqlalchemy.url = postgresql://postgres:secret@localhost/alembic_db
```

## 📝 Creating and Running Migrations

### 1. Create a New Migration

```bash
# Create migration with descriptive message
alembic revision -m "Create User table"
```

This generates a file in `myapp/versions/` with the format:

```text
{revision_id}_{description}.py
```

### 2. Edit the Migration

The generated file contains `upgrade()` and `downgrade()` functions:

```python
def upgrade() -> None:
    op.create_table(
        'employee',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(50), nullable=True),
        sa.Column("current", sa.Boolean, default=True)
    )

def downgrade() -> None:
    op.drop_table('employee')
```

### 3. Run the Migration

```bash
# Apply all pending migrations
alembic upgrade head

# Expected output:
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 0abcdadf35be, Create User table
```

## 🔍 Database Verification

### 1. Connect to PostgreSQL

```bash
docker exec -ti alembic-demo psql -U postgres -d alembic_db
```

### 2. Verify Created Tables

```sql
-- List tables
\dt

-- Expected output:
               List of tables
 Schema |      Name       | Type  |  Owner   
--------+-----------------+-------+----------
 public | alembic_version | table | postgres
 public | employee        | table | postgres
(2 rows)

-- Check employee table contents
SELECT * FROM employee;

-- Expected output:
 id | name | current 
----+------+---------
(0 rows)
```

## 🛠️ Useful Alembic Commands

### Check Current Status

```bash
# View current database version
alembic current

# View migration history
alembic history

# View pending migrations
alembic heads
```

### Revert Migrations

```bash
# Revert the last migration
alembic downgrade -1

# Revert to a specific version
alembic downgrade base

# Revert to a specific revision
alembic downgrade 0abcdadf35be
```

### Auto-generate Migrations

```bash
# Auto-generate migration based on SQLAlchemy models
alembic revision --autogenerate -m "Add new column"
```

## 📁 Project Structure

```text
19-alembic-demo/
├── venv/                    # Python virtual environment
├── myapp/                   # Alembic configuration
│   ├── versions/           # Migrations
│   │   └── 0abcdadf35be_create_user_table.py
│   ├── env.py              # Environment configuration
│   ├── script.py.mako      # Template
│   └── README              # Alembic docs
├── alembic.ini             # Main configuration
└── README.md               # This file
```

## 🔧 Additional Configuration

### Environment Variables

For more flexibility, you can use environment variables in `alembic.ini`:

```python
# In myapp/env.py
import os
from sqlalchemy import engine_from_config, pool

config.set_main_option('sqlalchemy.url', os.getenv('DATABASE_URL', 
    'postgresql://postgres:secret@localhost/alembic_db'))
```

### Custom Templates

You can customize the migration template by editing `myapp/script.py.mako`.

## 🚨 Troubleshooting

### Common Issues

1. **Error: `psycopg2` cannot be installed**
   - Solution: Use `psycopg2-binary` instead of `psycopg2`

2. **Error: `pg_config executable not found`**
   - Solution: Install PostgreSQL development tools or use `psycopg2-binary`

3. **Error: `externally-managed-environment`**
   - Solution: Create and activate a virtual environment

4. **Error: Database connection refused**
   - Solution: Verify Docker container is running and port is correct

### Installation Verification

```bash
# Verify Alembic installation
alembic --version

# Verify database connection
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:secret@localhost/alembic_db'); print('Connection successful')"
```

## 📚 References

- [Official Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)

## 🎯 Next Steps

1. Create SQLAlchemy models
2. Use `--autogenerate` for automatic migrations
3. Configure production environment
4. Implement rollback strategies
5. Integrate with CI/CD
