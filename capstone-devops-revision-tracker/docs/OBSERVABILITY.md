# Observability notes

**Author:** MD Kaif Molla

Observability is the ability to understand a system's internal state from the telemetry it produces. It is needed because a distributed application can be running while still being slow, unhealthy, or failing for only some users.

## The three pillars

### Metrics

Metrics are numeric measurements collected over time, such as request rate, error rate, CPU usage, memory usage, latency, and replica availability. Metrics are efficient for dashboards, trends, capacity planning, and alert conditions.

This project exposes Prometheus metrics from `/metrics`. Prometheus scrapes both backend replicas through a `ServiceMonitor`, and Grafana visualizes application health, request rate, CPU, memory, latency, and HTTP status codes.

Common tools: Prometheus, Grafana, Datadog, CloudWatch, Azure Monitor, and Google Cloud Monitoring.

### Logs

Logs are timestamped event records produced by applications and infrastructure. They provide detailed context such as an HTTP path, status code, exception, pod name, or startup failure. Logs are essential when a metric or alert says that something is wrong and an engineer needs the reason.

This project demonstrates Kubernetes logs with `kubectl logs`, including successful `/health`, `/ready`, and `/metrics` requests.

Common tools: Elasticsearch/Logstash/Kibana, OpenSearch, Grafana Loki, Fluent Bit, Splunk, and cloud logging services.

### Traces

Traces follow a request across multiple services. A trace contains spans, and each span records one operation's timing, status, and relationship to other spans. Tracing is especially useful for finding which service or database call causes latency in a distributed system.

Common tools: OpenTelemetry, Jaeger, Zipkin, Grafana Tempo, and commercial APM platforms. Tracing is documented here as the third pillar; the capstone demo focuses on metrics and logs because it is a compact three-tier application.

## Kubernetes observability

Kubernetes observability combines several layers:

- Application metrics from `/metrics`
- Pod and container CPU/memory metrics
- Kubernetes object state from kube-state-metrics
- Node metrics from node-exporter
- Application and container logs from `kubectl logs` or a log collector
- Kubernetes events from `kubectl get events`
- Liveness and readiness probes for automated health decisions
- Alert rules routed through Alertmanager
- Distributed traces instrumented with OpenTelemetry when required

The troubleshooting flow is: detect with a metric or alert, narrow the affected workload with Kubernetes state and events, inspect logs, follow traces when a request crosses services, fix the declarative configuration, and verify recovery.

## Why observability is required

- Detect failures before users report them
- Distinguish saturation, dependency failure, and application defects
- Reduce mean time to detection and recovery
- Validate deployments and capacity decisions
- Support service-level indicators and objectives
- Provide evidence during debugging and incident review
