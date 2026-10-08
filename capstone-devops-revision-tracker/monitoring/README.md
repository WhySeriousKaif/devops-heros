# Prometheus and Grafana

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
kubectl port-forward -n monitoring service/kube-prometheus-stack-prometheus 9090:9090
```

Open `http://localhost:9090/targets` and verify that the revision-tracker target is `UP`.

## Open Grafana

```bash
kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 3000:80
```

Open `http://localhost:3000`, sign in with the configured classroom credentials, and import `grafana-dashboard.json`.

## Important concepts

- Prometheus pulls numeric time-series metrics from `/metrics`.
- The ServiceMonitor defines discovery and scraping rules.
- Grafana queries Prometheus and visualizes the results.
- An alert is a Prometheus expression combined with a duration and notification rule.

