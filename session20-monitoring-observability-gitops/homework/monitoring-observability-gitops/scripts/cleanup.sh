#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CLUSTER_NAME="${CLUSTER_NAME:-session20}"

docker compose -f "$ROOT_DIR/docker-compose.yml" down --remove-orphans
if kind get clusters | grep -qx "$CLUSTER_NAME"; then
  kind delete cluster --name "$CLUSTER_NAME"
fi
