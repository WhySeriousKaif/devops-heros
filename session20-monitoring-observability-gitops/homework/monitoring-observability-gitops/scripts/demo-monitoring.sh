#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

docker compose up -d --build

echo "Waiting for the application and Prometheus..."
attempt=0
until curl --silent --fail http://localhost:8080/healthz >/dev/null && \
      curl --silent --fail http://localhost:9090/-/ready >/dev/null; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 30 ] || { echo "The monitoring stack did not become ready."; exit 1; }
  sleep 2
done

"$ROOT_DIR/scripts/generate-load.sh"

echo
echo "Application health:"
curl --silent http://localhost:8080/readyz
echo
echo "Prometheus targets:"
curl --silent 'http://localhost:9090/api/v1/query?query=up' | \
  python3 -c 'import json,sys; d=json.load(sys.stdin); [print("{}: {}".format(x["metric"].get("job"), x["value"][1])) for x in d["data"]["result"]]'
echo
echo "Open Grafana:    http://localhost:3000/d/session20-overview"
echo "Open Prometheus: http://localhost:9090/targets"
echo "Application:     http://localhost:8080"
