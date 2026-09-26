#!/usr/bin/env bash

set -e

# ============================================================
# Dashboard CNC V1.1
# Inicialização do ambiente Docker
# ============================================================

DEVICE="${CNC_SERIAL_PORT:-/dev/ttyACM0}"
PORT="${PORT:-3000}"
COMPOSE_FILE="docker-compose.yml"

echo "========================================"
echo " Dashboard CNC V1.1"
echo "========================================"
echo ""

# ------------------------------------------------------------
# Verificar dispositivo CNC / Arduino
# ------------------------------------------------------------

echo "Verificando dispositivo CNC..."

if [ -e "$DEVICE" ]; then
  echo "Arduino/CNC detectado em $DEVICE."
else
  echo "AVISO: Arduino/CNC não encontrado em $DEVICE."
  echo "Verifique a conexão USB."
fi

echo ""

# ------------------------------------------------------------
# Verificar Docker Compose
# ------------------------------------------------------------

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "ERRO: $COMPOSE_FILE não encontrado."
  exit 1
fi

# ------------------------------------------------------------
# Iniciar ambiente Docker
# ------------------------------------------------------------

echo "Construindo e iniciando o ambiente Docker..."
echo ""

docker compose -f "$COMPOSE_FILE" up --build -d

echo ""

# ------------------------------------------------------------
# Mostrar estado
# ------------------------------------------------------------

docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "========================================"
echo " Dashboard CNC iniciado"
echo "========================================"
echo ""
echo "Dashboard: http://localhost:${PORT}"
echo "Dispositivo CNC: ${DEVICE}"
echo ""