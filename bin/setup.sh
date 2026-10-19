# 帮一个刚拿到项目的人把开发环境准备好

#!/usr/bin/env bash

set -euo pipefail

# resolve project paths relative to this script so setup.sh can be run from any working directory.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

echo "Checking prerequisites..."

if ! command -v python >/dev/null 2>&1; then
    echo "Error: Python is required but was not found."
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo "Error: Node.js is required but was not found."
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "Error: npm is required but was not found."
    exit 1
fi

echo "Prerequisites found."

# create the virtual environment only when it does not already exist
if [[ ! -d "$VENV_DIR" ]]; then
    echo "Creating Python virtual environment..."
    python -m venv "$VENV_DIR"
else
    echo "Python virtual environment already exists."
fi

# locate the virtual environment Python executable
if [[ -x "$VENV_DIR/Scripts/python.exe" ]]; then
    PYTHON="$VENV_DIR/Scripts/python.exe"
elif [[ -x "$VENV_DIR/bin/python" ]]; then
    PYTHON="$VENV_DIR/bin/python"
else
    echo "Error: Could not find Python inside the virtual environment."
    exit 1
fi

# install backend dependencies
if [[ ! -f "$BACKEND_DIR/requirements.txt" ]]; then
    echo "Error: backend/requirements.txt was not found."
    exit 1
fi

echo "Installing backend dependencies..."
"$PYTHON" -m pip install -r "$BACKEND_DIR/requirements.txt"

# never overwrite an existing environment file
if [[ -f "$BACKEND_DIR/.env" ]]; then
    echo "Existing backend/.env preserved."
else
    echo "Warning: backend/.env was not found."
    echo "Create backend/.env and configure the required environment variables before running the application."
fi

# verify frontend dependency files
if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
    echo "Error: frontend/package.json was not found."
    exit 1
fi

echo "Installing frontend dependencies..."

cd "$FRONTEND_DIR"

if [[ -f "package-lock.json" ]]; then
    npm ci
else
    npm install
fi

echo "Setup completed successfully."