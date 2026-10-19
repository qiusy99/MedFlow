# 帮一个刚拿到项目的人把数据库准备成一个可以直接测试的状态

#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

if [[ -x "$BACKEND_DIR/.venv/Scripts/python.exe" ]]; then
    PYTHON="$BACKEND_DIR/.venv/Scripts/python.exe"
elif [[ -x "$BACKEND_DIR/.venv/bin/python" ]]; then
    PYTHON="$BACKEND_DIR/.venv/bin/python"
else
    echo "Error: Python virtual environment not found. Run bin/setup.sh first."
    exit 1
fi

ENV_FILE="$BACKEND_DIR/.env"

if [[ -f "$ENV_FILE" ]]; then
    set -a
    source "$ENV_FILE"
    set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "Error: DATABASE_URL is not configured."
    exit 1
fi

echo "Checking database connection..."

cd "$BACKEND_DIR"

if ! python -c "
import asyncio
from sqlalchemy import text
from app.database import engine

async def check():
    async with engine.connect() as conn:
        await conn.execute(text('SELECT 1'))
    await engine.dispose()

asyncio.run(check())
" >/dev/null 2>&1; then
    echo "Error: Database is unreachable. Check that the database is running and your configuration is correct."
    exit 1
fi

echo "Database connection successful."

# creates database tables
echo "Creating database tables..."
python -m scripts.create_tables

# load initial data
echo "Seeding database..."
python -m scripts.seed_data "$@"

echo "Seed completed successfully."

