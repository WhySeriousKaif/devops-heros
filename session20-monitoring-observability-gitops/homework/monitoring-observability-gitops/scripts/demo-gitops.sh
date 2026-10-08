#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CLUSTER_NAME="${CLUSTER_NAME:-session20}"

if ! kind get clusters | grep -qx "$CLUSTER_NAME"; then
  kind create cluster --name "$CLUSTER_NAME"
fi

docker build -t session20-app:local "$ROOT_DIR/app"
kind load docker-image session20-app:local --name "$CLUSTER_NAME"
kubectl apply -f "$ROOT_DIR/gitops/manifests"
kubectl rollout status deployment/session20-app -n session20 --timeout=120s

echo
echo "Git source: $(git -C "$ROOT_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$ROOT_DIR")"
echo "Desired state: gitops/manifests"
kubectl get deployment,pods,service -n session20
echo
echo "Start continuous reconciliation in another terminal:"
echo "  $ROOT_DIR/gitops/reconcile.sh --watch"
echo "Then create drift and watch GitOps restore two replicas:"
echo "  kubectl scale deployment/session20-app -n session20 --replicas=1"
