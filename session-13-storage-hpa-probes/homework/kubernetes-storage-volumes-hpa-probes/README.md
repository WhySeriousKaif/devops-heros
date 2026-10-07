# Kubernetes Storage (Volumes, PV/PVC), HPA & Probes: DevOps Homework

> **Status:** ⏳ Work In Progress — lab execution pending.  
> Run the commands in each task below, capture the output as screenshots, and drop them into `screenshots/`. Update this README only by pasting your PNGs and confirming the command outputs match expectations.

---

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

---

## Folder Structure

```text
kubernetes-storage-volumes-hpa-probes/
├── README.md
├── manifests/
│   ├── task1-emptydir.yaml
│   ├── task1-hostpath.yaml
│   ├── task2-pv.yaml
│   ├── task2-pvc.yaml
│   ├── task2-pod.yaml
│   ├── task3-storageclass-pvc.yaml
│   ├── task4-deployment.yaml
│   ├── task4-service.yaml
│   ├── task4-hpa.yaml
│   ├── task5-startup.yaml
│   ├── task5-readiness.yaml
│   ├── task5-liveness.yaml
│   ├── mini-namespace.yaml
│   ├── mini-pvc.yaml
│   ├── mini-deployment.yaml
│   ├── mini-service.yaml
│   └── mini-hpa.yaml
└── screenshots/
    ├── png1.png   # Task 1 — emptyDir + hostPath volume demo
    ├── png2.png   # Task 2 — PV/PVC/pod persistence demo
    ├── png3.png   # Task 3 — StorageClass dynamic provisioning
    ├── png4.png   # Task 4 — HPA scale-out under load
    ├── png5.png   # Task 5 — Readiness 0/1 failure mode
    ├── png6.png   # Task 5 — Liveness restart mode
    ├── png7.png   # Task 6 — mini project resources (all namespaces)
    ├── png8.png   # Task 6 — persistence after pod delete
    └── png9.png   # Task 6 — HPA scale-out 2 -> 5
```

---

## Session Reference

All session source materials live in [`session-13-storage-hpa-probes/`](../../session-13-storage-hpa-probes/):
`01-volumes/`, `02-persistent-storage/`, `03-storageclass/`, `04-hpa/`, `05-probes/`, `mini-project/`.

---

## Pre-flight Checks

Before running anything, confirm your cluster is up and metrics are available:

```bash
kubectl cluster-info
kubectl get nodes
kubectl get storageclass
kubectl top nodes   # must return CPU/memory numbers, not "Metrics API not available"
```

If `kubectl top` fails with "Metrics API not available", enable/metrics-server for Minikube:

```bash
minikube addons enable metrics-server
kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
kubectl top nodes
```

---

## Task 1: Kubernetes Volumes

**Goal:** Show the data lifecycle of `emptyDir` (temporary, pod-scoped) and `hostPath` (node directory) inside/outside the container.

### 1.1 emptyDir

```bash
kubectl apply -f manifests/task1-emptydir.yaml
kubectl get pods
```

Write a file into the pod's `/data` mount and confirm it is readable:

```bash
kubectl exec emptydir-demo -- sh -c 'echo "emptyDir survives pod restarts" > /data/message.txt'
kubectl exec emptydir-demo -- cat /data/message.txt
```

Delete the pod, recreate it from the same manifest, and show the data is gone:

```bash
kubectl delete pod emptydir-demo
kubectl apply -f manifests/task1-emptydir.yaml
kubectl exec emptydir-demo -- cat /data/message.txt   # should fail: No such file or directory
```

### 1.2 hostPath

```bash
kubectl apply -f manifests/task1-hostpath.yaml
kubectl get pods
```

Write a file to the node-mounted path and confirm it is readable:

```bash
kubectl exec hostpath-demo -- sh -c 'echo "hostPath data lives on the node" > /data/hostpath.txt'
kubectl exec hostpath-demo -- cat /data/hostpath.txt
```

Delete the pod and recreate — the file should still exist because it lives on the node at `/tmp/hostpath-data`:

```bash
kubectl delete pod hostpath-demo
kubectl apply -f manifests/task1-hostpath.yaml
kubectl exec hostpath-demo -- cat /data/hostpath.txt
```

### 1.3 Key Learning

- `emptyDir` exists only as long as the Pod exists — deleted with the Pod.
- `hostPath` mounts a directory from the node — survives pod deletion on the same node (useful for learning, not production).

### ✅ Screenshot to capture

Paste your terminal output (or a short screen recording convert) into:

**`screenshots/png1.png`** — one capture that shows at least:
- `kubectl apply` for both pods,
- `kubectl exec ... -- cat /data/message.txt` returning data,
- the `emptyDir` failure after pod delete,
- and the `hostpath-demo` data still present after pod delete.

---

## Task 2: Persistent Storage (PV + PVC)

**Goal:** Create a static PersistentVolume, bind a PersistentVolumeClaim, run a Pod from it, write data, delete the Pod, recreate, and prove the data survived on the same PV.

### 2.1 Create the PersistentVolume

```bash
kubectl apply -f manifests/task2-pv.yaml
kubectl get pv
kubectl describe pv student-pv
```

Expected PV state: `student-pv` should show `STATUS = Available` (1Gi, RWO, Retain).

### 2.2 Create the PersistentVolumeClaim

```bash
kubectl apply -f manifests/task2-pvc.yaml
kubectl get pvc
kubectl describe pvc student-pvc
```

Expected: `student-pvc` shows `STATUS = Bound` and `VOLUME = student-pv`.

### 2.3 Deploy the Pod consuming the PVC

```bash
kubectl apply -f manifests/task2-pod.yaml
kubectl get pods
kubectl describe pod storage-demo
```

### 2.4 Write data and verify it survives Pod deletion/reschedule

Write your name to `/data` inside the pod:

```bash
kubectl exec storage-demo -- sh -c 'echo "Student: MD Kaif Molla" > /data/student.txt'
kubectl exec storage-demo -- cat /data/student.txt
```

Delete the pod:

```bash
kubectl delete pod storage-demo
```

Wait for a new pod to appear, then confirm the file is still there:

```bash
kubectl get pods -w
# stop watching once storage-demo is Running
kubectl exec storage-demo -- cat /data/student.txt
```

Expected output: `Student: MD Kaif Molla` — the data survived the pod replacement.

### 2.5 Key Learning

- `PV` = cluster-scoped storage resource (admin manages it).
- `PVC` = request for storage (developer uses it).
- A Pod mounted to a PVC retains data even after the Pod is deleted and rescheduled, as long as the PV still exists.

### ✅ Screenshot to capture

**`screenshots/png2.png`** — capture that shows:
- `kubectl get pv` with `student-pv Available`,
- `kubectl get pvc` with `student-pvc Bound`,
- `kubectl exec ... -- cat /data/student.txt` before deletion,
- `kubectl exec storage-demo -- cat /data/student.txt` after pod recreation returning the same data.

---

## Task 3: StorageClass — Dynamic Provisioning

**Goal:** Show that a StorageClass-backed PVC can trigger automatic PV creation instead of a manually pre-created PV.

### 3.1 Inspect the default StorageClass

```bash
kubectl get storageclass
kubectl describe storageclass standard
```

### 3.2 Create a dynamic PVC

```bash
kubectl apply -f manifests/task3-storageclass-pvc.yaml
kubectl get pvc
kubectl get pv
kubectl describe pvc dynamic-pvc
```

Expected: `dynamic-pvc` goes `Bound` and a new PV is auto-created by the provisioner (e.g. `k8s.io/minikube-hostpath` on Minikube).

### 3.3 Key Learning

- Without StorageClass: developer requests PVC → admin manually creates matching PV.
- With StorageClass: developer requests PVC with a `storageClassName` → provisioner creates a PV automatically.
- This is the foundation of dynamic provisioning in production clusters.

### ✅ Screenshot to capture

**`screenshots/png3.png`** — capture that shows:
- `kubectl get storageclass` (including the `standard` class),
- `kubectl get pvc` showing `dynamic-pvc Bound`,
- `kubectl get pv` showing a new auto-created PV.

---

## Task 4: Horizontal Pod Autoscaler (HPA)

**Goal:** Deploy an app with CPU requests, attach an HPA (min 2 / max 5, 50% CPU target), watch it scale out under load, and scale back in after the load stops.

### 4.1 Deploy the app

```bash
kubectl apply -f manifests/task4-deployment.yaml
kubectl apply -f manifests/task4-service.yaml
kubectl get deployment task4-demo
kubectl get pods
```

### 4.2 Create the HPA

```bash
kubectl apply -f manifests/task4-hpa.yaml
kubectl get hpa task4-hpa
kubectl describe hpa task4-hpa
```

Expected start state: `REPLICAS = 2`, `TARGETS = 0%/50%` (or a low CPU %).

### 4.3 Verify metrics are flowing

```bash
kubectl top pods
kubectl top nodes
```

If `kubectl top` returns `Error from server (MetricsAPINotAvailable)`, confirm metrics-server is running (see Pre-flight Checks above) and retry.

### 4.4 Generate load

Port-forward the service so `localhost` can reach it:

```bash
kubectl port-forward svc/task4-demo-service 8080:80 &
sleep 2
```

Run a load generator (one-liner busybox loop):

```bash
kubectl run loadgen --image=busybox:1.36 --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://task4-demo-service; sleep 0.2; done"
```

In a second terminal (or in the same terminal after `&`), watch HPA and pods:

```bash
kubectl get hpa task4-hpa -w
kubectl get pods -w
kubectl top pods -w
```

Wait long enough for CPU to rise and HPA to schedule additional replicas (up to 5).

### 4.5 Stop the load and watch scale-in

```bash
kubectl delete pod loadgen
kubectl get hpa task4-hpa -w
kubectl get pods -w
```

After the load stops, CPU drops and HPA scales the replica count back down toward `minReplicas`.

### 4.6 Useful Commands (reference)

```bash
kubectl get hpa
kubectl get pods
kubectl top pods
kubectl describe hpa task4-hpa
kubectl get deployment task4-demo
```

### 4.7 Key Learning

- HPA watches a resource metric (CPU here) and scales the target deployment between `minReplicas` and `maxReplicas`.
- CPU requests on the Deployment are required for utilization-based autoscaling.
- Scaling out happens under load; scaling in happens after load subsides.

### ✅ Screenshot to capture

**`screenshots/png4.png`** — a capture showing both:
- `kubectl get hpa task4-hpa` with a high CPU target and `REPLICAS > 2` (scale-out), and
- `kubectl get pods` showing the extra replicas (or `kubectl top pods` alongside the HPA).

*Tip: a single `watch -n 2 kubectl get hpa,pods` pane next to the load generator works well as one screenshot.*

---

## Task 5: Probes (Startup, Readiness, Liveness)

**Goal:** Deploy pods with Startup, Readiness, and Liveness probes in their healthy state, then reliably reproduce a **readiness failure mode** (pod Running but Ready 0/1, no restart) and a **liveness failure mode** (pod restarts).

### 5.1 Healthy baseline

```bash
kubectl apply -f manifests/task5-startup.yaml
kubectl apply -f manifests/task5-readiness.yaml
kubectl apply -f manifests/task5-liveness.yaml

kubectl get pods
kubectl describe pod startup-demo
kubectl describe pod readiness-demo
kubectl describe pod liveness-demo
```

Expected healthy state: all three pods `READY 1/1`, `STATUS Running`, with probe configs visible in `describe`.

### 5.2 Trigger a Readiness failure (no restart)

The simplest reproducible demo is to change the readiness probe path to a path that does not exist. Edit the pod in place:

```bash
kubectl edit pod readiness-demo
```

In the editor, change:

```yaml
readinessProbe:
  httpGet:
    path: /
```

to:

```yaml
readinessProbe:
  httpGet:
    path: /wrong-path
```

Save and exit. Then watch:

```bash
kubectl get pod readiness-demo
kubectl get endpoints   # if you expose it, this pod stops serving traffic
kubectl describe pod readiness-demo
```

Expected: `STATUS = Running` but `READY = 0/1`, and `describe` shows failing readiness probes. The container is **not** restarted.

Restore the pod to healthy by editing back to `path: /` (or delete and re-apply `manifests/task5-readiness.yaml`).

### 5.3 Trigger a Liveness failure (container restarts)

Edit the liveness pod:

```bash
kubectl edit pod liveness-demo
```

Change:

```yaml
livenessProbe:
  httpGet:
    path: /
```

to:

```yaml
livenessProbe:
  httpGet:
    path: /wrong-path
```

Save and exit, then watch:

```bash
kubectl get pod liveness-demo -w
kubectl describe pod liveness-demo
```

Expected: `RESTARTS` increments and `describe` shows liveness probe failures and container restarts.

Restore by editing back to `path: /` (or delete and re-apply `manifests/task5-liveness.yaml`).

### 5.4 Easy way to remember

```text
Startup   -> "Have you started?"
Readiness -> "Can I send users to you?" (failure = not ready, no restart)
Liveness  -> "Are you still alive?" (failure = restart)
```

### 5.5 Key Learning

- Readiness failure ≠ container restart. It just removes the pod from service endpoints.
- Liveness failure can restart the container.
- Startup probe protects slow-starting apps from being killed by an aggressive liveness probe during startup.

### ✅ Screenshots to capture

**`screenshots/png5.png`** — readiness failure mode:
- `kubectl get pod readiness-demo` showing `READY 0/1`, `STATUS Running`,
- `kubectl describe pod readiness-demo` showing the failing readiness probe.

**`screenshots/png6.png`** — liveness restart mode:
- `kubectl get pod liveness-demo` showing `RESTARTS > 0`,
- `kubectl describe pod liveness-demo` showing liveness probe failures / restarts.

---

## Task 6: Mini Project — Production-Ready Web App

**Goal:** Combine PVC persistence + HPA elastic scaling + full probe triage in one production-style namespace.

### 6.1 Create the namespace

```bash
kubectl apply -f manifests/mini-namespace.yaml
kubectl get namespaces production-webapp
```

### 6.2 Create the PVC

```bash
kubectl apply -f manifests/mini-pvc.yaml
kubectl get pvc -n production-webapp
kubectl describe pvc web-data -n production-webapp
```

Expected: `web-data` shows `STATUS = Bound`.

### 6.3 Deploy the application + service

```bash
kubectl apply -f manifests/mini-deployment.yaml
kubectl apply -f manifests/mini-service.yaml
kubectl get pods -n production-webapp
kubectl get svc web-service -n production-webapp
```

Expected: `2/2` ready pods, `web-app-hpa` target not yet evaluated until metrics flow.

### 6.4 Create the HPA

```bash
kubectl apply -f manifests/mini-hpa.yaml
kubectl get hpa web-app-hpa -n production-webapp
kubectl describe hpa web-app-hpa -n production-webapp
```

### 6.5 Verify the full stack

```bash
kubectl get all -n production-webapp
```

### 6.6 Verification Task 1 — persistence after pod delete

Write a student file to one pod, delete that pod, and read it back from the replacement:

```bash
POD_NAME=$(kubectl get pods -n production-webapp -l app=web-app -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n production-webapp "$POD_NAME" -- sh -c 'echo "Student: MD Kaif Molla" > /data/student.txt'
kubectl exec -n production-webapp "$POD_NAME" -- cat /data/student.txt

kubectl delete pod -n production-webapp "$POD_NAME"

NEW_POD=$(kubectl get pods -n production-webapp -l app=web-app -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n production-webapp "$NEW_POD" -- cat /data/student.txt
```

Expected: `Student: MD Kaif Molla` survives the pod replacement.

### 6.7 Verification Task 2 — service reachability

```bash
kubectl port-forward -n production-webapp svc/web-service 8080:80 &
sleep 2
curl -s http://localhost:8080
```

### 6.8 Verification Task 3 — HPA scale-out and scale-in

Generate load against the mini-project service:

```bash
kubectl run loadgen --image=busybox:1.36 --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://web-service.production-webapp.svc.cluster.local; sleep 0.2; done"
```

Watch scaling in a second terminal:

```bash
kubectl get hpa web-app-hpa -n production-webapp -w
kubectl get pods -n production-webapp -w
kubectl top pods -n production-webapp -w
```

Stop the load:

```bash
kubectl delete pod loadgen
kubectl get hpa web-app-hpa -n production-webapp -w
```

### 6.9 Key Learning

- A production app needs all three: persistent storage (PVC), autoscaling (HPA), and health diagnostics (startup/readiness/liveness).
- Data written to a PVC persists across pod scheduling changes.
- HPA reacts to real CPU metrics; scale-out and scale-in are both observable.

### ✅ Screenshots to capture

**`screenshots/png7.png`** — full mini-project resources:
- `kubectl get all -n production-webapp` showing namespace, pods, service, HPA.

**`screenshots/png8.png`** — persistence proof:
- write + read `student.txt`, delete pod, read back after replacement.

**`screenshots/png9.png`** — scaling proof:
- `kubectl get hpa web-app-hpa -n production-webapp` with `REPLICAS > 2` plus `kubectl get pods -n production-webapp` showing additional replicas.

---

## Execution & Output Screenshots

_Paste your captured PNGs into `screenshots/` using the filenames listed in the Folder Structure above, then keep the README links untouched — they already point at the right files._

---

## Key Learnings & Summary

_Pending — fill this in after the lab is executed with your own observations._

---

*Maintained by MD Kaif Molla (24BCS10221) — DevOps Homework Submission*
