#!/bin/sh
set -e
echo "Applying database migrations..."
alembic upgrade head
echo "Loading demo seeds..."
python -m app.seeds
echo "Starting Che API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
