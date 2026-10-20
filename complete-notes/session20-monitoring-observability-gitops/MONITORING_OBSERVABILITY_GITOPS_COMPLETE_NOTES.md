# Session 20 — Monitoring, Observability, Alerting and GitOps

## 1. The big picture

Once an application is deployed, two questions matter:

1. **Is it healthy right now?** This is monitoring.
2. **Why did it become unhealthy or slow?** This is observability.

GitOps answers a related operations question:

> How do we make sure the cluster is running the version and configuration approved in Git?

This session connects these ideas:

```text
Application --metrics--> Prometheus --queries/alerts--> Grafana / operator
Application --logs------> log viewer / terminal
Application --traces----> trace viewer

Git (desired state) --> Argo CD --> Kubernetes (actual state)
```

## 2. Monitoring vs observability

| Topic | Monitoring | Observability |
|---|---|---|
| Main question | “Is the system healthy?” | “Why is it behaving this way?” |
| Best for | Known conditions, dashboards and alerts | Investigating known and unknown problems |
| Typical evidence | CPU, memory, error count, target UP/DOWN | Metrics + logs + traces together |
| Example | Alert when application health becomes 0 | Find the slow request, its log entries and its failing dependency |

Monitoring is part of observability. It tells you **that** a problem exists. Observability provides enough telemetry to understand **why** it exists.

## 3. The three pillars of telemetry

### Metrics

A metric is a numeric measurement recorded over time. It is cheap to store and ideal for graphs, trends and alerts.

Examples:

- `app_requests_total` — total number of requests
- `process_resident_memory_bytes` — memory used by a process
- `app_health` — application readiness as a number
- `up` — whether Prometheus could scrape a target

Metrics often have **labels**, which add dimensions:

```promql
up{job="demo-app"}
```

Here, `job="demo-app"` selects the target named `demo-app`.

### Logs

A log is a timestamped record of an event. Logs are best when you need detail: an error message, request path, user action, or stack trace.

```bash
# Show the most recent application events from Docker Compose.
docker compose logs app --tail=20

# Show recent events from a Kubernetes Deployment.
kubectl logs deployment/session20-app -n session20 --tail=20
```

### Traces

A trace follows **one request** across multiple services. It shows the request path and time spent in each service, which makes it useful for distributed-system latency debugging.

### How they work together

Suppose users report that the application is slow:

1. A metric graph shows when latency increased.
2. A trace identifies which service or database call was slow.
3. Logs explain the error or event around that request.

**Exam memory line:** metrics are numbers, logs are events, traces are request journeys.

## 4. Prometheus

Prometheus is a monitoring system that:

1. **Pulls (scrapes)** metrics from application endpoints such as `/metrics`.
2. Stores the values as labelled time series.
3. Lets us query them using **PromQL**.
4. Evaluates alert rules.

```text
Prometheus --HTTP GET /metrics--> application
```

The application exposes metrics; Prometheus does not normally wait for the application to push them.

### Important Prometheus terms

| Term | Meaning |
|---|---|
| Target | A URL Prometheus scrapes |
| Job | A logical name for a group of targets |
| Scrape | Prometheus reading a target's `/metrics` endpoint |
| Time series | Metric values over time, identified by metric name and labels |
| PromQL | Prometheus query language |
| Alert rule | A condition Prometheus evaluates repeatedly |

### The most important health metric: `up`

```promql
# 1 = Prometheus reached and scraped the target; 0 = it could not.
up{job="demo-app"}
```

Do not confuse `up` with application readiness:

- `up = 1` means Prometheus could reach the metrics endpoint.
- `app_health = 1` means the application reports itself ready to serve traffic.

### Useful PromQL queries from the lab

```promql
# Is the metrics target reachable?
up{job="demo-app"}

# Process CPU seconds per second, calculated over the last minute.
rate(process_cpu_seconds_total{job="demo-app"}[1m])

# Current resident memory used by the process.
process_resident_memory_bytes{job="demo-app"}

# Average incoming request rate over the last minute.
rate(app_requests_total{job="demo-app"}[1m])

# Average error rate over the last minute.
rate(app_errors_total{job="demo-app"}[1m])

# 1 = ready, 0 = not ready.
app_health{job="demo-app"}

# Average request duration: total time divided by request count.
rate(app_request_duration_seconds_sum{job="demo-app"}[1m])
/
rate(app_request_duration_seconds_count{job="demo-app"}[1m])
```

`rate(counter[1m])` is important: counters only increase, while `rate(...)` converts their change into a per-second rate.

## 5. Grafana dashboards

Prometheus **collects and stores** metrics. Grafana **queries and visualizes** them in dashboards.

Good beginner dashboard panels include:

| Panel | Question answered | Example metric/query |
|---|---|---|
| Target health | Can Prometheus reach the application? | `up{job="demo-app"}` |
| Request rate | Is traffic increasing or dropping? | `rate(app_requests_total[1m])` |
| Error rate | Are requests failing? | `rate(app_errors_total[1m])` |
| CPU | Is the process consuming CPU? | `rate(process_cpu_seconds_total[1m])` |
| Memory | Is memory growing too high? | `process_resident_memory_bytes` |
| Application health | Is the app ready for traffic? | `app_health` |

Grafana must be configured with Prometheus as a **data source**. In Docker Compose, one container can normally reach another by service name, for example `http://prometheus:9090`.

## 6. Alerts and health endpoints

An alert converts an important metric condition into an operator action.

Example alert logic:

```yaml
# Fire if the application says it is not ready for more than 10 seconds.
- alert: ApplicationNotReady
  expr: app_health{job="demo-app"} == 0
  for: 10s
```

Typical lifecycle:

```text
Condition false -> Inactive
Condition true  -> Pending (during the "for" duration)
Still true      -> Firing
Condition false -> Resolved / Inactive
```

### Liveness vs readiness

| Check | Question | Normal Kubernetes action on failure |
|---|---|---|
| Liveness probe (`/healthz`) | “Should this process be restarted?” | Kubernetes restarts the container |
| Readiness probe (`/readyz`) | “Should this instance receive traffic?” | Pod is removed from Service endpoints; it need not restart |

This distinction is a common MCQ topic. A readiness failure protects users from an unready pod; it does not automatically mean the container is dead.

## 7. Kubernetes observability checks

```bash
# Cluster and workload overview.
kubectl get nodes
kubectl get pods -n session20 -o wide

# Resource usage. Requires Metrics Server.
kubectl top nodes
kubectl top pods -n session20

# Application evidence and diagnosis.
kubectl logs deployment/session20-app -n session20 --tail=20
kubectl describe deployment/session20-app -n session20
kubectl get events -n session20 --sort-by=.lastTimestamp
```

Use them in this order during a basic incident:

1. `get pods` — is the workload running and Ready?
2. `describe` — are probes, image pulls, scheduling or events failing?
3. `logs` — what did the application report?
4. `top` — is CPU or memory under pressure?
5. Prometheus/Grafana — when did the behavior start and is it a trend?

## 8. GitOps

GitOps is an operating model where committed Git configuration defines the **desired state** of infrastructure and applications.

```text
Developer changes a manifest
        ↓
Commit / review / merge in Git
        ↓
GitOps controller reads Git
        ↓
Controller updates Kubernetes
        ↓
Controller keeps comparing desired and actual state
```

### Why Git is the source of truth

Git provides:

- history of what changed;
- author and review record;
- a diff before deployment;
- rollback by reverting to an earlier known-good commit;
- one approved place to find the intended configuration.

### Declarative configuration

A Kubernetes manifest says what should exist:

```yaml
spec:
  replicas: 3
```

It does not describe every command needed to create three Pods. Kubernetes and the GitOps controller make the actual cluster match the desired result.

## 9. Drift and reconciliation

**Configuration drift** means the live cluster differs from the Git-declared state.

```text
Git says:     replicas: 2
Cluster has:  replicas: 1   (someone manually scaled it)
```

A GitOps controller sees the mismatch and reconciles the cluster back to two replicas.

Two key Argo CD automated-sync options:

| Option | Meaning |
|---|---|
| `selfHeal: true` | Correct manual changes so live state returns to the Git state |
| `prune: true` | Delete resources that are no longer declared in the Git path |

**Important working rule:** after GitOps is responsible for application manifests, make normal changes in Git. Do not use manual `kubectl apply` or `kubectl scale` as the permanent change path.

## 10. Argo CD

Argo CD is a GitOps controller for Kubernetes. It watches a Git repository and compares the manifests there with the cluster.

An Argo CD **Application** object tells it:

- repository URL;
- branch/revision;
- path containing manifests;
- destination cluster and namespace;
- sync policy.

```text
Apply the Argo CD Application once
        ↓
Argo CD reads Deployment and Service manifests from Git
        ↓
Argo CD deploys and continuously reconciles them
```

In the class example:

- You apply `argocd-application.yaml` once.
- Argo CD then owns the application `Deployment` and `Service`.
- Future Git pushes change the application through Argo CD.

### Status words to know

| Status | Meaning |
|---|---|
| Synced | Live resources match the Git-declared state |
| OutOfSync | Live resources differ from Git or Git contains unapplied changes |
| Healthy | Resources are running and reporting healthy |
| Degraded | At least one managed resource is unhealthy |

Useful checks:

```bash
# See the Argo CD Application resources.
kubectl get applications -n argocd

# See the deployed application workload.
kubectl get deployment,pods,svc -n session20

# Watch a replica change reconcile.
kubectl get deployment -n session20 -w
```

## 11. A safe GitOps change workflow

For a legitimate change, such as changing replicas from 2 to 3:

```text
1. Edit the manifest in the Git repository.
2. Review the diff.
3. Commit and push the change.
4. Let Argo CD detect and synchronize it.
5. Verify the workload and application health.
```

Example verification:

```bash
# Shows the desired and available replicas.
kubectl get deployment -n session20

# Shows individual Pods becoming Ready.
kubectl get pods -n session20
```

For a rollback, revert the Git commit and let Argo CD reconcile the old, approved state. This is safer and auditable compared with emergency manual changes.

## 12. Troubleshooting guide

| Symptom | Check first | Likely direction |
|---|---|---|
| Prometheus target is DOWN | `up`, Prometheus Targets page, endpoint URL | Wrong target, port, network, or app not exposing `/metrics` |
| Grafana panel empty | Data source and PromQL query | Prometheus data source/configuration or wrong metric/label |
| Alert did not fire | Alert expression, target metric, `for` time | Metric did not match or alert is still Pending |
| Pod not receiving traffic | Readiness probe, endpoints, `describe pod` | Readiness is failing |
| Argo app OutOfSync | Git revision/path, Application status, manifest validity | New commit not synced, wrong path/branch, or invalid manifest |
| Manual change disappears | Git and Argo sync policy | Expected behavior when `selfHeal` restores desired state |

## 13. Exam-style questions

**Q1. What is the difference between a metric and a log?**
A metric is a numeric time series for trends and alerts. A log is a timestamped event record with detailed context.

**Q2. What does `up == 0` mean?**
Prometheus could not successfully scrape that target. It does not by itself prove why the application is unavailable.

**Q3. Which probe decides whether a Pod receives Service traffic?**
The readiness probe.

**Q4. What is GitOps?**
Using Git as the approved desired state and a controller to continuously reconcile the actual environment to that state.

**Q5. What is drift?**
A difference between the actual live state and the configuration declared in Git.

**Q6. What does Argo CD `selfHeal: true` do?**
It corrects live manual changes so resources return to the Git-declared configuration.

**Q7. What does `prune: true` do?**
It removes resources previously managed by the Application when they are removed from the declared Git state.

## 14. Last-minute memory lines

- **Metrics = numbers; logs = events; traces = request journey.**
- **Prometheus collects and queries; Grafana visualizes.**
- **`up` means scrape reachability; `app_health` means application-reported readiness.**
- **Liveness restarts; readiness removes traffic.**
- **GitOps: Git is desired state; Argo CD reconciles actual Kubernetes state.**
- **Drift is a mismatch; self-heal corrects it; prune removes no-longer-declared resources.**
