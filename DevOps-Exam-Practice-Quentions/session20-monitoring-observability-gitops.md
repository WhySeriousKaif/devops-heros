# Session 20 — Monitoring, Observability and GitOps: Exam Practice

Use this sheet after reading the complete notes. Each task is written in the story style that may appear in a lab exam: understand the goal, run only the relevant commands, then verify the result.

## Quick MCQ answers

| Question | Answer | Remember why |
|---|---|---|
| What is a metric? | A numeric measurement over time | Example: CPU usage or request count |
| What is a log? | A timestamped event record | Best for detailed error context |
| What is a trace? | The journey of one request across services | Best for distributed latency analysis |
| What does Prometheus do? | Scrapes, stores and queries time-series metrics | It normally pulls `/metrics` |
| What does Grafana do? | Displays dashboards from data sources | It does not replace Prometheus storage |
| What is observability? | Inferring internal system state from telemetry | Metrics, logs and traces work together |
| What is GitOps? | Managing desired state through Git and reconciliation | Git is the approved source of truth |
| What does Argo CD do? | Reconciles Kubernetes resources with Git | It detects and corrects drift |
| What is drift? | Actual state differs from desired Git state | Example: manual replica change |

## Task 1 — Verify a Prometheus target and query application health

**Story:** A Python application exposes `/metrics`. You must verify that Prometheus can scrape it and prove whether the application is ready.

```bash
# Start the lab stack from its project directory.
cd session20-monitoring-observability-gitops/homework/monitoring-observability-gitops
./scripts/demo-monitoring.sh

# Optional: generate more requests so request-rate panels have data.
./scripts/generate-load.sh
```

Open Prometheus Targets and confirm the `demo-app` target is **UP**. Then run these PromQL queries in the Prometheus query page:

```promql
# Prometheus scrape reachability: 1 means reachable.
up{job="demo-app"}

# Application-reported readiness: 1 means ready.
app_health{job="demo-app"}

# Request rate calculated from a counter over one minute.
rate(app_requests_total{job="demo-app"}[1m])
```

**Verification:** both `up` and `app_health` should be `1` for a healthy application.

**Exam point:** `up=1` means Prometheus could scrape `/metrics`; it is not exactly the same as business/application readiness.

## Task 2 — Build the essential Grafana dashboard panels

**Story:** Your lead needs a small dashboard showing traffic, errors, resource usage and health.

In Grafana, select Prometheus as the data source and create panels using:

```promql
# Incoming requests per second.
rate(app_requests_total{job="demo-app"}[1m])

# Errors per second.
rate(app_errors_total{job="demo-app"}[1m])

# CPU usage rate.
rate(process_cpu_seconds_total{job="demo-app"}[1m])

# Current process memory.
process_resident_memory_bytes{job="demo-app"}

# Application readiness.
app_health{job="demo-app"}

# Average request duration.
rate(app_request_duration_seconds_sum{job="demo-app"}[1m])
/
rate(app_request_duration_seconds_count{job="demo-app"}[1m])
```

**Verification:** explain one panel in words. For example, a rising `app_errors_total` rate means errors are being generated more quickly.

**Exam point:** Prometheus collects/stores metrics; Grafana turns Prometheus query results into a dashboard.

## Task 3 — Fire and recover a readiness alert

**Story:** An alert named `ApplicationNotReady` should fire when the app reports that it is not ready for over ten seconds.

```bash
# Make the demo application report app_health = 0.
./scripts/trigger-alert.sh fire
```

In Prometheus:

```promql
# Confirm that the health metric has become zero.
app_health{job="demo-app"}
```

Wait for the rule's `for: 10s` interval. The alert moves from **Pending** to **Firing** if the condition remains true.

```bash
# Restore readiness after recording the alert.
./scripts/trigger-alert.sh recover
```

**Verification:** the alert resolves after the next Prometheus evaluation and `app_health` returns to `1`.

**Exam point:** an alert can be Pending before it becomes Firing. The `for` duration prevents noise from very brief failures.

## Task 4 — Diagnose a Kubernetes application

**Story:** A Kubernetes application may not be healthy. Collect evidence before changing anything.

```bash
# View Pods and the node where each Pod runs.
kubectl get pods -n session20 -o wide

# Read workload events, probe state and recent failures.
kubectl describe deployment/session20-app -n session20

# Read recent application output.
kubectl logs deployment/session20-app -n session20 --tail=20

# Show namespace events in time order.
kubectl get events -n session20 --sort-by=.lastTimestamp

# Show resource usage when Metrics Server is installed.
kubectl top pods -n session20
```

**Verification:** identify whether the evidence points to a scheduling/probe/image problem (`describe` and events), an application problem (logs), or resource pressure (`top`).

**Exam point:** readiness failure stops traffic to the Pod; liveness failure tells Kubernetes to restart the container.

## Task 5 — Register an application with Argo CD once

**Story:** A repository contains `deployment.yaml` and `service.yaml` in a watched path. An Argo CD Application manifest points at that Git repository. Tell Argo CD to begin managing it.

```bash
# Apply the Argo CD Application object once.
# Replace the path with the actual Application manifest in the exam repository.
kubectl apply -f app/argocd-application.yaml

# Verify that Argo CD knows about the application.
kubectl get applications -n argocd

# Verify the workload that Argo CD deploys.
kubectl get deployment,pods,svc -n session20
```

**Verification:** the Argo application should become **Synced** and **Healthy** once its resources are running.

**Important:** after this one-time registration, do not manually apply the watched Deployment or Service. Make normal application changes in Git and let Argo CD reconcile them.

## Task 6 — Make a GitOps replica change

**Story:** The approved manifest currently says `replicas: 2`. The team wants three replicas through the audited Git workflow.

```bash
# Edit the Deployment manifest and change replicas: 2 to replicas: 3.
# Inspect exactly what will be committed.
git diff

# Stage and commit only the intended manifest.
git add app/deployment.yaml
git commit -m "Scale application to three replicas"
git push

# Watch Kubernetes converge to the desired count.
kubectl get deployment -n session20 -w
```

**Verification:** `kubectl get deployment -n session20` eventually shows desired and available replicas as `3`.

**Exam point:** this is GitOps because Git contains the approved desired state and Argo CD applies/reconciles it.

## Task 7 — Demonstrate and explain drift

**Story:** Git declares two replicas. Someone manually changes the running cluster to one replica. Show what self-healing means.

```bash
# Intentionally create temporary drift. Use only in a lab.
kubectl scale deployment/session20-app -n session20 --replicas=1

# Observe the current live state.
kubectl get deployment -n session20 -w
```

With automated sync and `selfHeal: true`, Argo CD detects the difference and returns the Deployment to Git's declared replica count.

**Verification:** the live count returns to the number committed in Git.

**Exam point:** manual scaling is the drift demonstration, not the approved long-term change method. Commit a manifest change for a legitimate permanent update.
