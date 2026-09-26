#!/bin/sh
# Wait until the MySQL TCP port is accepting connections, then start gunicorn.
# Reads DB_HOST/DB_PORT from the environment (set by docker-compose locally,
# or by Railway/Render variable references in the cloud) instead of taking
# them as positional args, so the same image works in both places.
HOST="${DB_HOST:-db}"
DBPORT="${DB_PORT:-3306}"

echo "Waiting for MySQL at $HOST:$DBPORT..."
until nc -z "$HOST" "$DBPORT"; do
  sleep 1
done
echo "MySQL is up - starting backend"

# $PORT is the port the platform expects THIS service to listen on (Railway
# and Render both inject it at runtime). Defaults to 5000 for local Docker
# Compose, where docker-compose.yml maps host 5000 -> container 5000.
exec gunicorn --bind "0.0.0.0:${PORT:-5000}" --workers 2 app:app
