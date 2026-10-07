# Session 20: Monitoring, Observability and GitOps — Homework

> **Status:** Work in progress — run the demonstrations and add screenshots before submission.

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

## Project Overview

This homework combines service monitoring, the three pillars of observability, and a Kubernetes GitOps workflow. Prometheus collects metrics, Grafana visualizes them, Kubernetes exposes health and logs, and Argo CD continuously reconciles the cluster with the desired state stored in Git.

The supporting examples are in [`03-prometheus`](../../03-prometheus/), [`04-grafana`](../../04-grafana/), and [`08-mini-project`](../../08-mini-project/).

## Architecture

```text
Users ---> Kubernetes Service ---> Application Pods
                                      |     |
                                /health     +--> stdout/stderr logs
                                      |
                                      +--> /metrics
                                               |
                                           Prometheus
                                               |
                                            Grafana
                                               |
                                             Alerts

Git repository ---> Argo CD ---> Kubernetes API
       ^                 |
       |                 +---- continuous reconciliation
       +------ desired state
```

## Submission Structure

```text
monitoring-observability-gitops/
├── README.md
└── screenshots/
    ├── png1.png   # Prometheus targets and application metrics
    ├── png2.png   # Grafana CPU/memory/health dashboard
    ├── png3.png   # Kubernetes logs and health check
    ├── png4.png   # Alert firing and recovery
    ├── png5.png   # Argo CD application Synced/Healthy
    ├── png6.png   # Git change reconciled into Kubernetes
    └── png7.png   # GitOps self-healing demonstration
```

## Task 1: Monitoring

Monitoring collects known signals and evaluates them against expected operating conditions.

- **Metrics:** numeric time-series measurements such as request rate, latency, errors, CPU, and memory.
- **Logs:** timestamped event records emitted by applications and infrastructure.
- **Alerts:** actionable notifications created when a meaningful condition remains true long enough.
- **Application health:** liveness answers whether the process should restart; readiness answers whether it should receive traffic.

### Kubernetes Checks

```bash
kubectl get nodes
kubectl get pods -A
kubectl top nodes
kubectl top pods -A
kubectl get events -A --sort-by=.lastTimestamp
kubectl logs deployment/<deployment-name> -n <namespace>
kubectl describe pod <pod-name> -n <namespace>
```

If `kubectl top` has no data on Minikube:

```bash
minikube addons enable metrics-server
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
```

### Prometheus and Grafana Demo

```bash
cd session20-monitoring-observability-gitops/03-prometheus
docker compose up -d
docker compose ps
```

Use the configuration and ports documented in that project. Open the Prometheus targets page, verify the application target is `UP`, query CPU and memory metrics, and add useful Grafana panels.

Good dashboard signals include:

- CPU utilization or CPU usage rate.
- Working-set memory.
- Request count/rate.
- Error ratio.
- Request duration percentiles.
- Pod restart count.
- Application readiness.

An alert should describe impact, include a useful severity, avoid flapping with an appropriate duration, and link to a runbook where possible.

## Task 2: Observability

Observability is the ability to understand a system's internal state using its external signals, including conditions that were not predicted in advance.

### The Three Pillars

| Pillar | Meaning | Typical tools | Example question |
|---|---|---|---|
| Metrics | Aggregated numeric time series | Prometheus, CloudWatch, Grafana | Did latency increase after deployment? |
| Logs | Detailed event records | Loki, Elasticsearch/OpenSearch, CloudWatch Logs | What error did this request produce? |
| Traces | A request's path across services | OpenTelemetry, Jaeger, Tempo, X-Ray | Which service made this request slow? |

The pillars become more useful when they share labels such as service name, environment, version, pod, and trace ID.

### Why It Is Required

- Distributed systems fail in combinations that simple uptime checks cannot explain.
- Engineers need evidence to reduce mean time to detect and recover.
- Release comparisons reveal regressions.
- Capacity trends support scaling and cost decisions.
- Service-level indicators and objectives connect telemetry to user experience.

### Kubernetes Observability

Kubernetes adds signals from applications, containers, pods, nodes, controllers, events, and the control plane. Useful practices include structured application logs, resource requests and limits, health probes, cluster-state metrics, node metrics, distributed context propagation, and dashboards grouped by cluster/namespace/workload.

## Task 3: GitOps

GitOps uses a Git repository as the source of truth for declarative system configuration. An agent such as Argo CD compares the declared state with the live state and reconciles drift.

```text
Change manifest in Git
        |
   Pull request review
        |
 Merge to main branch
        |
 Argo CD detects change
        |
 Sync and health checks
        |
 Kubernetes reaches desired state
```

### Demo

```bash
kind create cluster --name session20
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl wait --for=condition=ready pod --all -n argocd --timeout=300s
```

Update the repository URL in the example Argo CD `Application`, commit the workload manifests to that repository, then apply the bootstrap object:

```bash
kubectl apply -f session20-monitoring-observability-gitops/08-mini-project/app/argocd-application.yaml
kubectl get applications -n argocd
kubectl get all -n session20
```

Change the declared replica count, commit, and push it. Confirm reconciliation:

```bash
kubectl get deployment -n session20 -w
```

To demonstrate self-healing, manually change the live replica count and observe Argo CD restore the Git value:

```bash
kubectl scale deployment session20-mini -n session20 --replicas=1
kubectl get deployment session20-mini -n session20 -w
```

## Cleanup

```bash
docker compose down
kind delete cluster --name session20
```

## Screenshots

```markdown
![Prometheus](screenshots/png1.png)
![Grafana](screenshots/png2.png)
![Logs and health](screenshots/png3.png)
![Alert](screenshots/png4.png)
![Argo CD status](screenshots/png5.png)
![Git reconciliation](screenshots/png6.png)
![Self-healing](screenshots/png7.png)
```

## Deliverables Checklist

- [ ] CPU, memory, logs, and application health are demonstrated.
- [ ] Prometheus target and Grafana dashboard are working.
- [ ] An alert firing and recovery are captured.
- [x] Metrics, logs, traces, tools, and Kubernetes observability are documented.
- [ ] Argo CD reports the application as Synced and Healthy.
- [ ] Git-driven deployment and self-healing are demonstrated.
- [ ] Screenshots are added and embedded.

---

*Maintained by MD Kaif Molla (24BCS10221) — DevOps Homework Submission*
