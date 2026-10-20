# Session 13 — Kubernetes Storage, HPA & Probes

## What this session adds

This session makes an application more production-ready in three ways:

```text
Storage: keep important data after Pod replacement
HPA: add/remove Pod replicas when load changes
Probes: decide whether an app is started, ready for traffic, or needs restart
```

---

## 1. Kubernetes volume types

A container filesystem is temporary. If a container or Pod is replaced, data written only inside it can disappear. Volumes provide storage mounted into a Pod.

### `emptyDir`: temporary Pod-scoped storage

`emptyDir` is created when the Pod is scheduled and removed when that Pod is deleted.

```yaml
volumes:
  - name: cache
    emptyDir: {}
containers:
  - name: app
    image: nginx:alpine
    volumeMounts:
      - name: cache
        mountPath: /cache
```

Use it for temporary files, cache, or sharing files between containers in the **same Pod**.

Key point:

```text
Pod restart: emptyDir data normally remains because the Pod still exists.
Pod deletion/recreation: emptyDir data is lost.
```

### `hostPath`: directory from the node

`hostPath` mounts a directory from the worker node into the Pod.

```yaml
volumes:
  - name: node-data
    hostPath:
      path: /tmp/app-data
      type: DirectoryOrCreate
```

The data can survive Pod deletion if the next Pod uses the **same node** and same host path. It is useful for local learning, but generally not suitable for production because:

- Data is tied to one node.
- A rescheduled Pod on another node may not see it.
- It can create host-security risks.

### `emptyDir` versus `hostPath`

| `emptyDir` | `hostPath` |
| --- | --- |
| Exists for one Pod lifecycle | Uses a directory on one node |
| Deleted when Pod is deleted | Can remain after Pod deletion on same node |
| Good for temporary/shared Pod data | Mainly local/special node-level use |
| Not persistent storage | Not portable multi-node persistent storage |

---

## 2. Persistent storage: PV and PVC

For database or user data, use persistent storage independent from a particular Pod.

```text
Application Pod -> PVC (storage request) -> PV (actual cluster storage)
```

### PersistentVolume (PV)

A **PersistentVolume** is storage available to the cluster. It can represent cloud disk, NFS, CSI-provisioned disk, or local test storage.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: student-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath: # acceptable for local learning only
    path: /tmp/student-data
    type: DirectoryOrCreate
```

PV is generally a cluster-scoped resource.

### PersistentVolumeClaim (PVC)

A **PersistentVolumeClaim** is an application/team request for storage. It requests size, access mode, and optionally a StorageClass.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: student-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
```

PVCs are namespaced. Kubernetes binds a compatible PV to the PVC.

```bash
kubectl get pv   # PV state, e.g. Available or Bound
kubectl get pvc  # PVC state, e.g. Pending or Bound
```

### Mount a PVC into a Pod

```yaml
spec:
  containers:
    - name: app
      image: nginx:alpine
      volumeMounts:
        - name: app-data
          mountPath: /data
  volumes:
    - name: app-data
      persistentVolumeClaim:
        claimName: student-pvc
```

If the Pod is deleted and recreated with the same PVC, files in `/data` remain because storage belongs to the PV/PVC, not the Pod.

### PVC stuck Pending

If no compatible PV exists and no StorageClass can dynamically provision one, the PVC stays `Pending`. A Pod that needs it may also remain `Pending`.

```bash
kubectl describe pvc student-pvc # shows binding/provisioning events
kubectl get storageclass         # see available dynamic provisioning classes
```

---

## 3. StorageClass: dynamic provisioning

Creating every PV manually does not scale well. A **StorageClass** defines how Kubernetes should provision storage dynamically.

```text
PVC with storageClassName -> provisioner creates a matching PV -> PVC becomes Bound
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 500Mi
```

```bash
kubectl get storageclass
kubectl get pvc dynamic-pvc
kubectl get pv
```

**Exam definition:** StorageClass defines how dynamic storage provisioning occurs.

### Access mode quick memory

- `ReadWriteOnce` (RWO): mounted read-write by one node at a time; common for cloud block disks.
- `ReadOnlyMany` (ROX): many nodes can read.
- `ReadWriteMany` (RWX): many nodes can read/write; requires a backend that supports it.

The backend determines whether a mode is actually supported.

---

## 4. Horizontal Pod Autoscaler (HPA)

**HPA = Horizontal Pod Autoscaler.** It changes the number of replicas for a scalable workload such as a Deployment.

```text
High CPU/load -> HPA increases replica count (scale out)
Low CPU/load  -> HPA reduces replica count, but not below minReplicas (scale in)
```

### HPA manifest

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

This tries to keep average CPU utilization around 50% of the configured CPU request, scaling between 2 and 5 replicas.

### Why CPU requests are required for CPU utilization HPA

HPA percentage is calculated relative to resource **requests**. If a container has no CPU request, Kubernetes cannot calculate a meaningful CPU utilization percentage for this HPA target.

```yaml
resources:
  requests:
    cpu: 100m    # 100 millicores; baseline used for utilization calculation
    memory: 128Mi
  limits:
    cpu: 250m
    memory: 256Mi
```

### Metrics Server prerequisite

HPA needs a working Metrics API for normal CPU/memory resource metrics.

```bash
kubectl top nodes
kubectl top pods
```

If these show `Metrics API not available`, CPU HPA cannot evaluate metrics.

For Minikube:

```bash
minikube addons enable metrics-server
kubectl get pods -n kube-system -l k8s-app=metrics-server
kubectl top nodes
```

### HPA commands

```bash
kubectl get hpa            # current target and replica count
kubectl describe hpa web-hpa # events and metric decisions
kubectl get hpa -w         # watch scaling activity
kubectl get pods -w        # watch new/removed Pods
```

---

## 5. Startup, readiness, and liveness probes

Probes allow Kubernetes to make better health decisions than simply checking whether a process exists.

| Probe | Question | When it fails |
| --- | --- | --- |
| Startup | “Has this slow application started yet?” | Startup period continues; liveness/readiness wait until it succeeds |
| Readiness | “Can this Pod receive Service traffic?” | Pod becomes NotReady and is removed from Service endpoints; no normal restart |
| Liveness | “Is this container still healthy/alive?” | kubelet restarts the container |

### HTTP probe example

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

### The easiest way to remember

```text
Startup: wait for application boot
Readiness: should traffic be sent?
Liveness: should the container be restarted?
```

### Observing failures

```bash
kubectl get pod APP_POD -w
kubectl describe pod APP_POD
```

- A readiness failure can show `Running` but `READY 0/1`; restart count does not increase merely due to readiness.
- A liveness failure causes restart count to increase.
- A startup probe prevents an aggressive liveness probe from killing a slow-starting application too early.

---

## 6. Practice questions explained

1. PVC is a request for persistent storage → **A**.
2. PV is a cluster storage resource → **B**.
3. StorageClass defines dynamic provisioning → **D**.
4. HPA means Horizontal Pod Autoscaler → **C**.
5. HPA adjusts the number of Pod replicas → **B**.
6. Readiness decides whether a container receives traffic → **B**.
7. Liveness detects when a container should restart → **D**.
8. Startup probe supports slow-starting apps → **A**.
9. Unbound PVC can leave the consuming Pod Pending → **B**.
10. `kubectl get pvc` lists PVCs → **D**.

---

## 7. Fast troubleshooting checklist

| Problem | First checks |
| --- | --- |
| PVC is Pending | `kubectl describe pvc NAME`, PV compatibility, StorageClass/provisioner |
| Pod is Pending with PVC | Confirm the PVC is Bound and exists in same namespace |
| Data disappeared | Check whether you used `emptyDir` rather than PVC; check correct mount path |
| HPA target is `<unknown>` | `kubectl top pods`; enable/fix Metrics Server; verify CPU requests |
| HPA does not scale | Check min/max, metric target, CPU requests, actual load, and `kubectl describe hpa` |
| Pod is Running but app gets no traffic | Readiness probe likely failing; use `kubectl describe pod` |
| Restart count climbs | Liveness probe/app process is failing; inspect `kubectl logs --previous` |

---

## 8. Last-minute exam memory sheet

- `emptyDir` = temporary data for one Pod lifecycle.
- `hostPath` = node directory; local/test use, not portable storage.
- PV = actual cluster storage resource.
- PVC = application request for persistent storage.
- StorageClass = dynamic PV provisioning policy.
- PVC `Pending` can make a Pod remain `Pending`.
- HPA = Horizontal Pod Autoscaler; scales replicas, not container image/content.
- CPU-utilization HPA needs Metrics Server and CPU requests.
- Startup = wait; Readiness = traffic; Liveness = restart.
- `kubectl get pv`, `kubectl get pvc`, `kubectl get storageclass`, `kubectl get hpa`, `kubectl top pods` are key commands.
