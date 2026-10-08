#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SOURCE_ROOT="${GITOPS_REPO:-$ROOT_DIR}"
MANIFEST_DIR="$SOURCE_ROOT/gitops/manifests"
INTERVAL="${RECONCILE_INTERVAL:-5}"
MODE="${1:---watch}"
REPO_ROOT=$(git -C "$SOURCE_ROOT" rev-parse --show-toplevel)
MANIFEST_RELATIVE=${MANIFEST_DIR#"$REPO_ROOT"/}

git -C "$REPO_ROOT" ls-files --error-unmatch "$MANIFEST_RELATIVE/deployment.yaml" >/dev/null 2>&1 || {
  echo "GitOps manifests must be committed before reconciliation starts." >&2
  exit 1
}

reconcile() {
  if ! git -C "$REPO_ROOT" diff --quiet -- "$MANIFEST_RELATIVE" || \
     ! git -C "$REPO_ROOT" diff --cached --quiet -- "$MANIFEST_RELATIVE"; then
    printf '%s waiting: uncommitted manifest changes are not desired state\n' \
      "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    return
  fi
  kubectl apply -f "$MANIFEST_DIR" >/dev/null
  replicas=$(kubectl get deployment session20-app -n session20 -o jsonpath='{.status.readyReplicas}')
  desired=$(kubectl get deployment session20-app -n session20 -o jsonpath='{.spec.replicas}')
  printf '%s reconciled commit=%s replicas=%s/%s\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    "$(git -C "$REPO_ROOT" rev-parse --short HEAD)" \
    "${replicas:-0}" "$desired"
}

case "$MODE" in
  --once)
    reconcile
    ;;
  --watch)
    echo "Continuous reconciliation started (interval: ${INTERVAL}s). Press Ctrl+C to stop."
    while true; do
      reconcile
      sleep "$INTERVAL"
    done
    ;;
  *)
    echo "Usage: $0 [--once|--watch]" >&2
    exit 2
    ;;
esac
