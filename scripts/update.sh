#!/usr/bin/env bash

set -Eeuo pipefail

# Dashboard CNC V1.1
# Controlled production update on Raspberry Pi.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="docker-compose.production.yml"
SERVICE="cnc_dashboard_app"

cd "$PROJECT_DIR"

echo "========================================"
echo " Dashboard CNC V1.1 - Update"
echo "========================================"
echo ""

# Check required tools and files.
for command in git docker; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "ERROR: Required command not found: $command"
    exit 1
  fi
done

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: $COMPOSE_FILE not found."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker Compose is unavailable."
  exit 1
fi

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "ERROR: Expected Git branch main."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Local Git changes detected."
  echo "Commit or resolve them before updating."
  git status --short
  exit 1
fi

# Verify production configuration before changing anything.
docker compose -f "$COMPOSE_FILE" config --quiet

echo "WARNING: Updating will interrupt the Dashboard."
echo "Ensure the CNC is stopped and no G-code is running."
echo "Do not proceed during an active machine operation."
echo ""

read -r -p "Confirm safe update? [y/N]: " confirmation

if [[ "$confirmation" != "y" && "$confirmation" != "Y" ]]; then
  echo "Update cancelled."
  exit 0
fi

previous_version="$(git rev-parse --short HEAD)"

echo ""
echo "Previous version: $previous_version"
echo "Fetching updates..."

git fetch origin main
git merge --ff-only origin/main

new_version="$(git rev-parse --short HEAD)"

echo "Current version: $new_version"
echo ""

# Build first to avoid stopping a working container
# if the new image cannot be built.
echo "Building production image..."

docker compose -f "$COMPOSE_FILE" build "$SERVICE"

echo ""
echo "Recreating production container..."

docker compose -f "$COMPOSE_FILE" up \
  --detach \
  --no-deps \
  --force-recreate \
  "$SERVICE"

echo ""
echo "Checking container state..."

container_id="$(
  docker compose -f "$COMPOSE_FILE" ps -q "$SERVICE"
)"

if [[ -z "$container_id" ]]; then
  echo "ERROR: Production container was not created."
  exit 1
fi

running="$(
  docker inspect --format '{{.State.Running}}' "$container_id"
)"

if [[ "$running" != "true" ]]; then
  echo "ERROR: Production container is not running."
  docker compose -f "$COMPOSE_FILE" logs --tail 50 "$SERVICE"
  exit 1
fi

docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "========================================"
echo " Update completed"
echo "========================================"
echo "Previous Git version: $previous_version"
echo "Current Git version:  $new_version"
echo ""
echo "Check the Dashboard before operating the CNC."
echo "No machine execution is resumed automatically."
