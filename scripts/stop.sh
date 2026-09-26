#!/usr/bin/env bash

set -e

# ============================================================
# Dashboard CNC V1.1
# Encerramento do ambiente Docker
# ============================================================

COMPOSE_FILE="docker-compose.yml"

echo "========================================"
echo " Dashboard CNC V1.1"
echo "========================================"
echo ""

# ------------------------------------------------------------
# Verificar Docker Compose
# ------------------------------------------------------------

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERRO: $COMPOSE_FILE não encontrado."
  exit 1
fi

# ------------------------------------------------------------
# Estado atual
# ------------------------------------------------------------

echo "Estado atual dos containers:"
echo ""

docker compose -f "$COMPOSE_FILE" ps

echo ""

# ------------------------------------------------------------
# Parar ambiente
# ------------------------------------------------------------

echo "Parando o ambiente Docker..."
echo ""

docker compose -f "$COMPOSE_FILE" down

echo ""

# ------------------------------------------------------------
# Finalização
# ------------------------------------------------------------

echo "========================================"
echo " Dashboard CNC parado"
echo "========================================"
echo ""