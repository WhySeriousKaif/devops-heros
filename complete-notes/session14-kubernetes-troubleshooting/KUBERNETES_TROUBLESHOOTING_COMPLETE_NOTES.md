# Session 14 — Kubernetes Troubleshooting

## The troubleshooting mindset

Do not guess or randomly delete resources. Follow evidence in a fixed order:

```text
1. Observe status
2. Identify affected resource and namespace
3. Describe it for conditions/events
4. Read application logs
5. Enter the running container if useful
6. Test Service, endpoints, and DNS
7. Find the root cause
8. Apply the smallest correct fix
9. Verify the workload and user path work again
```

This works for most Kubernetes incidents and is the most important idea in this session.

---

## 1. The essential commands

### `kubectl get`: quick overview

```bash
kubectl get pods                    # name, Ready, status, restarts, age
kubectl get pods -o wide            # also shows Pod IP and node
kubectl get deployments
kubectl get svc
kubectl get nodes
kubectl get all                     # common resources in current namespace
```

Ask: **What is failing, where, and what status is it in?**

### `kubectl describe`: detailed conditions and events

```bash
kubectl describe pod POD_NAME
kubectl describe deployment DEPLOYMENT_NAME
kubectl describe svc SERVICE_NAME
```

`describe` is usually the best next command after `get`. At the bottom, inspect **Events** for exact messages about image pulling, scheduling, probes, volumes, and mounts.

### `kubectl logs`: application evidence

```bash
kubectl logs POD_NAME
kubectl logs POD_NAME -c CONTAINER_NAME # for multi-container Pod
kubectl logs POD_NAME --previous         # previous crashed container instance
```

Ask: **What is the application saying?**

### `kubectl exec`: inspect from inside a running container

```bash
kubectl exec -it POD_NAME -- sh
kubectl exec POD_NAME -- printenv
kubectl exec POD_NAME -- cat /etc/resolv.conf
kubectl exec POD_NAME -- nslookup SERVICE_NAME
```

`exec` requires a running container. It cannot help if a Pod never started because of ImagePullBackOff.

### Events

```bash
kubectl get events --sort-by=.lastTimestamp
kubectl get events -n NAMESPACE --sort-by=.lastTimestamp
```

Events answer: **What did Kubernetes try to do, and why did it fail?**

---

## 2. Always confirm the namespace

Many “resource not found” problems happen because the command runs in the wrong namespace.

```bash
kubectl get namespaces
kubectl get pods -n production
kubectl describe pod POD_NAME -n production
```

If you omit `-n`, `kubectl` normally uses the `default` namespace.

---

## 3. Common Pod failures

### A. `ImagePullBackOff` / `ErrImagePull`

Meaning: Kubernetes cannot download the image, so the application has not started.

```text
Pod created -> kubelet tries to pull image -> pull fails -> retries with backoff
```

Common causes:

- Typo in image name or tag.
- Image/tag does not exist in the registry.
- Private registry needs an image pull secret.
- Node cannot reach the registry.

Commands:

```bash
kubectl get pods
kubectl describe pod POD_NAME
kubectl get events --sort-by=.lastTimestamp
```

Fix the manifest image reference or registry authentication, apply the change, and verify `READY 1/1` / `Running`.

### B. `CrashLoopBackOff`

Meaning: the container starts, exits/crashes, and Kubernetes repeatedly tries to restart it with increasing delay.

```text
Container starts -> application exits -> kubelet restarts -> repeats -> CrashLoopBackOff
```

Common causes:

- Bad application command/arguments.
- Missing or incorrect environment variable.
- Wrong Secret/ConfigMap key.
- Cannot reach required database/service.
- Application error or wrong configuration file.
- Liveness probe failing repeatedly.
- Resource issue such as out-of-memory termination.

Commands:

```bash
kubectl describe pod POD_NAME
kubectl logs POD_NAME
kubectl logs POD_NAME --previous
```

The logs usually reveal the real application failure. `describe` then confirms restarts, exit information, and probe events.

### C. `Pending`

Meaning: Kubernetes accepted the Pod but has not successfully scheduled it onto a node, or it is waiting for required resources.

Common causes:

- Insufficient CPU or memory on available nodes.
- PVC is still `Pending` / not Bound.
- Node selectors, taints/tolerations, or affinity rules exclude all nodes.

```bash
kubectl describe pod POD_NAME
kubectl get nodes
kubectl get pvc
```

Read the scheduling Events rather than assuming the reason.

### D. `ContainerCreating`

Meaning: a node has been selected and Kubernetes is preparing the container. Briefly seeing it is normal.

If it remains there, use `describe` to look for image pull, volume mount, or node/network events.

---

## 4. Service, endpoint, and DNS troubleshooting

When a Pod is healthy but the application cannot be reached, inspect the Service path:

```text
Client -> Service DNS/IP -> selector -> ready endpoint Pods -> application port
```

### Step 1: inspect Services and endpoints

```bash
kubectl get svc
kubectl describe svc SERVICE_NAME
kubectl get endpoints SERVICE_NAME
kubectl get pods --show-labels
```

If endpoints are empty, the Service has no ready backend Pods. Most common reason: selector does not match Pod labels.

```yaml
# Service
selector:
  app: backend

# Matching Pod template
labels:
  app: backend
```

Also confirm `targetPort` matches the port where the container is actually listening.

### Step 2: test DNS from inside the cluster

```bash
kubectl exec dns-test -- nslookup SERVICE_NAME
kubectl exec dns-test -- cat /etc/resolv.conf
kubectl exec dns-test -- wget -qO- http://SERVICE_NAME
```

For a Service in another namespace, use its full DNS name:

```text
service-name.namespace.svc.cluster.local
```

### DNS failure checklist

- Is the Service name spelled correctly?
- Is it in the expected namespace?
- Does `kubectl get endpoints SERVICE_NAME` contain ready Pods?
- Is CoreDNS healthy? Check `kubectl get pods -n kube-system`.
- Does the application listen on the Service `targetPort`?

---

## 5. A complete debugging flow example

Problem: browser/application cannot use `backend-service`.

```bash
# 1. See whether Pods and Service exist.
kubectl get pods
kubectl get svc backend-service

# 2. Is the backend Pod healthy?
kubectl describe pod BACKEND_POD
kubectl logs BACKEND_POD

# 3. Does the Service select any endpoints?
kubectl describe svc backend-service
kubectl get endpoints backend-service

# 4. Do selector and labels match?
kubectl get pods --show-labels

# 5. Can another Pod resolve and call the Service?
kubectl exec dns-test -- nslookup backend-service
kubectl exec dns-test -- wget -qO- http://backend-service
```

Do not skip from “application not reachable” directly to recreating everything. Find whether the fault is Pod health, Service selection, DNS, or application port.

---

## 6. Practical fixes: how to verify

After a fix:

```bash
kubectl get pods
kubectl get deployment
kubectl get endpoints SERVICE_NAME
kubectl logs POD_NAME
```

Verify the relevant outcome:

- Pod reaches `Running` and expected `READY` state.
- Restart count no longer increases.
- Service has endpoint addresses.
- DNS resolves correctly from a client Pod.
- Application responds successfully.

**Final incident step:** verify recovery. A manifest applying successfully is not enough proof.

---

## 7. Practice questions explained

1. `kubectl get pods` gives a quick Pod status view → **A**.
2. `kubectl describe pod` displays conditions and events → **D**.
3. `kubectl logs` reads container output → **D**.
4. `kubectl exec` runs a command in a running container → **A**.
5. ImagePullBackOff means the image cannot be downloaded → **D**.
6. CrashLoopBackOff means a container repeatedly exits/crashes → **B**.
7. Insufficient schedulable resources can keep a Pod Pending → **D**.
8. Kubernetes Events show recent scheduling/pull errors → **A**.
9. Empty Service endpoints: check selector matches ready Pod labels → **B**.
10. After a fix, verify workload/application behavior → **C**.

---

## 8. Last-minute exam memory sheet

- `get` = quick status.
- `describe` = details and Events.
- `logs` = application output.
- `logs --previous` = prior crashed container output.
- `exec` = run a command in a running container.
- `ImagePullBackOff` = bad/missing/inaccessible image.
- `CrashLoopBackOff` = repeated container crash/exit.
- `Pending` = cannot schedule or waiting for a dependency such as PVC.
- Empty Service endpoints = check selector, ready Pods, and namespace.
- Debug Service path: Service → endpoints → Pod labels/port → DNS → app response.
- Always verify after fixing.
