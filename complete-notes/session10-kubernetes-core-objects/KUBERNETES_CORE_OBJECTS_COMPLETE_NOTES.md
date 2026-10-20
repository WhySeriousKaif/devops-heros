# Session 10 — Kubernetes Pods, ReplicaSets & Deployments

## What is new in this session

Session 9 explained the Kubernetes cluster and its components. This session explains the **objects used to run and manage applications** inside that cluster:

```text
Deployment -> ReplicaSet -> Pod -> container(s)
```

You also learn how to identify failing Pods, scale an application, update it safely, and roll it back.

---

## 1. Kubernetes YAML basics

Kubernetes resources are declared in YAML manifests. Each manifest creates an API object.

```yaml
apiVersion: v1          # API group/version for the object
kind: Pod               # type of Kubernetes object
metadata:
  name: nginx-pod       # object name
  labels:
    app: web            # key-value tag
spec:
  containers:
    - name: nginx
      image: nginx:alpine
```

```bash
kubectl apply -f pod.yaml # create or update resources declared in YAML
kubectl get pods          # see created Pods
```

YAML indentation and capitalization matter. `apiVersion`, `kind`, `metadata`, and `spec` are not interchangeable names.

---

## 2. Pods and their lifecycle

A Pod runs one or more containers. A long-running web server such as Nginx normally stays `Running`; a short task can complete and end successfully.

### Important Pod states/problems

| State/status | Meaning | First thing to do |
| --- | --- | --- |
| `Pending` | Pod accepted but waiting for scheduling, resources, or an image | `kubectl describe pod NAME` |
| `ContainerCreating` | Node is preparing the container | Usually wait briefly; inspect events if it stays here |
| `Running` | Container is running | Check `READY`, logs, and application access |
| `Succeeded` / `Completed` | Task finished successfully | Normal for one-time jobs/commands |
| `Failed` / `Error` | Container ended unsuccessfully | Describe and inspect logs |
| `CrashLoopBackOff` | Container starts, crashes, and Kubernetes retries with delay | Check logs, command, environment, and config |
| `ErrImagePull` / `ImagePullBackOff` | Image cannot be downloaded | Check image name/tag, registry access, and image pull secret |

### Why a short command becomes Completed

```yaml
containers:
  - name: task
    image: busybox
    command: ["sh", "-c", "echo hello"]
```

The command finishes, so the container exits successfully and the Pod can show `Completed`. Nginx stays `Running` because its web-server process keeps running.

### Pod troubleshooting order

```bash
kubectl get pods                    # quick status
kubectl describe pod POD_NAME       # events: image, scheduling, probe, and other clues
kubectl logs POD_NAME               # output of the application container
kubectl logs POD_NAME --previous    # logs from the previous crashed container instance
kubectl get pod POD_NAME -o wide    # Pod IP and node
```

**Exam memory:** `describe` tells you why Kubernetes is unhappy; `logs` tells you what the application printed.

---

## 3. Labels and selectors

Labels are simple key-value tags attached to Kubernetes resources.

```yaml
metadata:
  labels:
    app: web
    environment: dev
```

You can filter resources by label:

```bash
kubectl get pods -l app=web # list only Pods labelled app=web
```

A **selector** finds resources whose labels match. This link is critical:

```text
Deployment selector -> ReplicaSet selector -> Pod template labels
```

Example:

```yaml
spec:
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web # must match the selector
```

If the selector says `app: web` but Pod labels say `app: backend`, the controller cannot correctly manage the Pods. Selector/label mismatch is a common debugging issue.

---

## 4. ReplicaSet: keep the required number of Pods

A **ReplicaSet (RS)** ensures a desired number of matching, identical Pods are running.

```text
Desired replicas = 3
Actual running Pods = 2
ReplicaSet creates 1 replacement Pod
```

This is self-healing. If you delete one managed Pod, the ReplicaSet creates a new one because the desired count has not changed.

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: frontend-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
```

```bash
kubectl apply -f replicaset.yaml
kubectl get rs                           # list ReplicaSets
kubectl get pods -l app=frontend         # Pods owned by this RS
kubectl scale rs frontend-rs --replicas=5 # change replica count
```

**Exam definition:** ReplicaSet ensures the desired number of matching Pods run.

---

## 5. Deployment: normal application manager

A **Deployment** is higher-level than a ReplicaSet. It creates and manages ReplicaSets, which create/manage Pods.

```text
Deployment -> ReplicaSet -> Pods
```

Why use a Deployment instead of creating a ReplicaSet directly?

- Define desired replicas declaratively.
- Scale replicas.
- Perform rolling updates.
- Keep rollout history.
- Roll back to a previous version.

### Deployment manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-deployment
spec:
  replicas: 2 # desired number of Pods
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
```

```bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl get rs
kubectl get pods -l app=web
```

### Scaling a Deployment

```bash
kubectl scale deployment web-deployment --replicas=5 # increase copies
kubectl get deployment web-deployment                # desired/current/ready availability
kubectl scale deployment web-deployment --replicas=2 # reduce copies
```

**Practice MCQ:** Deployment replicas are set with `spec.replicas`, not `metadata.replicas`.

---

## 6. Rolling update, history, and rollback

### Rolling update

A rolling update gradually replaces old Pods with new Pods rather than deleting every old Pod at once. It is the normal default Deployment strategy for stateless web applications.

```text
Old version: [v1] [v1] [v1]
Rolling update: [v2] [v1] [v1] -> [v2] [v2] [v1] -> [v2] [v2] [v2]
```

When the Deployment’s Pod template changes—for example the image version changes—Kubernetes creates a new ReplicaSet and gradually moves to it.

```bash
kubectl set image deployment/web-deployment nginx=nginx:1.28-alpine
kubectl rollout status deployment/web-deployment
```

### Rollout commands to memorize

```bash
kubectl rollout status deployment/web-deployment  # watch rollout progress
kubectl rollout history deployment/web-deployment # view revisions
kubectl rollout undo deployment/web-deployment    # return to previous revision
kubectl rollout undo deployment/web-deployment --to-revision=2 # choose a revision
```

### Other deployment strategies

| Strategy | What happens | Main use |
| --- | --- | --- |
| Rolling update | Gradually replaces old Pods with new Pods | Default for stateless apps |
| Recreate | Stops old version before starting new version; downtime occurs | When versions cannot run together |
| Blue-green | Keep complete old and new environments; switch Service traffic | Fast switch/rollback, more resources needed |
| Canary | Send a small portion of traffic to the new version first | Test a new version with limited risk |

---

## 7. Probes: health checks for containers

Kubernetes probes check the health of containers. They are different from simply seeing a Pod as `Running`.

| Probe | Question Kubernetes asks | If it fails |
| --- | --- | --- |
| Liveness probe | “Is this container still alive?” | Kubernetes restarts the container |
| Readiness probe | “Can this container receive traffic?” | Pod is removed from Service endpoints until ready |
| Startup probe | “Has this slow-starting app finished starting?” | Protects slow apps from liveness/readiness checks during startup |

Example readiness probe:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

**Exam trap:** readiness failure usually does not restart a container; it stops traffic from being sent to that Pod. Liveness failure triggers a restart.

---

## 8. Init containers and multi-container Pods

### Init container

An init container runs before the main application containers. It must finish successfully before the app starts.

Common use: wait for a dependency, create required files, or perform setup.

```yaml
initContainers:
  - name: wait-for-db
    image: busybox
    command: ["sh", "-c", "until nslookup database; do sleep 2; done"]
```

### Multi-container Pod

A Pod can run related containers together, for example:

- Main application container.
- Sidecar for logs, proxying, or monitoring.

They share the Pod’s network namespace and can communicate using `localhost` inside that same Pod. This is different from separate Pods, which use Pod IPs/Services.

---

## 9. Deployment, StatefulSet, and DaemonSet

| Resource | Use case | Identity/storage behavior |
| --- | --- | --- |
| Deployment | Stateless web/API applications | Pods are interchangeable; names change when replaced |
| StatefulSet | Databases and stateful clustered apps | Stable ordered Pod names such as `mysql-0`; persistent identity/storage |
| DaemonSet | One Pod on every (or selected) node | Node-level agent such as logging/monitoring |

Examples:

- Nginx frontend → Deployment.
- MySQL / MongoDB with stable identity → StatefulSet.
- Fluent Bit log collector or node monitoring agent → DaemonSet.

---

## 10. Practice questions explained

1. Deployment manages replicas and rolling updates → **B**.
2. ReplicaSet keeps a desired number of matching Pods → **A**.
3. Replica count field is `spec.replicas` → **D**.
4. Labels organize and select resources → **C**.
5. Selector matches resources that have specified labels → **B**.
6. Scale with `kubectl scale deployment` → **C**.
7. Controller restores desired state after a managed Pod crashes → **A**.
8. `kubectl rollout status deployment/name` watches rollout status → **B**.
9. Rolling update replaces old Pods gradually → **A**.
10. Deployment normally creates/manages ReplicaSets → **D**.

---

## 11. Fast troubleshooting checklist

| Problem | Commands and likely cause |
| --- | --- |
| Pod is Pending | `kubectl describe pod NAME`; no node/resources/image issue |
| ImagePullBackOff | Check image name/tag and registry credentials |
| CrashLoopBackOff | `kubectl logs NAME --previous`; inspect command/config/env |
| Deployment has fewer ready replicas | `kubectl get deployment`, then `kubectl get pods` and `describe` failing Pod |
| Service finds no Pods | Check Service selector and Pod labels match |
| Update is stuck | `kubectl rollout status deployment/NAME`, `kubectl describe deployment NAME` |
| Need to reverse a bad release | `kubectl rollout undo deployment/NAME` |

---

## 12. Last-minute exam memory sheet

- Pod = smallest deployable unit; holds one/more containers.
- Label = resource tag, e.g. `app: web`.
- Selector = finds matching labels.
- ReplicaSet = maintains desired Pod count.
- Deployment = manages ReplicaSets, scaling, rolling updates, and rollback.
- `spec.replicas` = desired number of Pods.
- `kubectl scale deployment NAME --replicas=N` = scale app.
- Rolling update = gradual old-to-new replacement.
- `rollout status`, `rollout history`, `rollout undo` = update management.
- `CrashLoopBackOff` = container repeatedly crashes.
- `ImagePullBackOff` = image cannot be downloaded.
- Liveness = restart unhealthy container; readiness = temporarily stop routing traffic; startup = protect slow startup.
- StatefulSet = stable identity for stateful apps; DaemonSet = one Pod per node.
