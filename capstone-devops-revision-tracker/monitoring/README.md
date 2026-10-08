# Prometheus and Grafana

**Author:** MD Kaif Molla

The backend exposes Prometheus metrics at `/metrics`. The Helm chart contains a `ServiceMonitor` that tells Prometheus which Service and endpoint to scrape.

## Install the monitoring stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus-values.yaml
```

Enable the application ServiceMonitor:

```bash
helm upgrade revision helm/revision-tracker \
  --namespace revision-tracker \
  --reuse-values \
  --set monitoring.serviceMonitor.enabled=true
```

## Open Prometheus

```bash
kubectl port-forward -n monitoring service/kube-prometheus-stack-prometheus 9091:9090
```

Open `http://localhost:9091/targets` and verify that both revision-tracker backend targets are `UP`.

## Open Grafana

```bash
kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3003:80
```

Open `http://localhost:3003`, sign in with the configured local credentials, and import `grafana-dashboard.json`. The dashboard contains application health, request rate, CPU, memory, p95 latency, and responses by status code.

## Apply alert rules

```bash
kubectl apply -f monitoring/alert-rules.yaml
```

Open `http://localhost:9091/alerts`. The rules detect a completely unavailable backend and combined backend memory above 500 MiB.

## Important concepts

- Prometheus pulls numeric time-series metrics from `/metrics`.
- The ServiceMonitor defines discovery and scraping rules.
- Grafana queries Prometheus and visualizes the results.
- An alert is a Prometheus expression combined with a duration and notification rule.
- Alertmanager groups and routes firing alerts to configured receivers.
- See [the observability notes](../docs/OBSERVABILITY.md) for metrics, logs, traces, and Kubernetes observability.
