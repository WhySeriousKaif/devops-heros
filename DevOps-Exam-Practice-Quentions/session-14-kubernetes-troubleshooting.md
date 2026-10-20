# MCQs — session-14-kubernetes-troubleshooting

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. Which command gives a quick overview of Pod status?

A. `kubectl get pods`
B. `kubectl publish`
C. `kubectl init`
D. `kubectl build pods`

### Q2. Which command displays detailed Pod events and conditions?

A. `kubectl top namespace`
B. `kubectl apply -k`
C. `kubectl delete pod`
D. `kubectl describe pod`

### Q3. Which command reads a container's logs?

A. `kubectl version`
B. `kubectl create`
C. `kubectl label`
D. `kubectl logs`

### Q4. Which command runs a command inside a running container?

A. `kubectl exec`
B. `kubectl config view`
C. `kubectl explain`
D. `kubectl diff`

### Q5. What often causes ImagePullBackOff?

A. An oversized log file only
B. A healthy application
C. A missing readiness probe only
D. An image cannot be downloaded

### Q6. What often causes CrashLoopBackOff?

A. A stable Service IP
B. A container repeatedly exits or crashes
C. A successful rollout
D. A valid PVC

### Q7. What is a common reason for a Pod to remain Pending?

A. Successful readiness probe
B. Correct image tag
C. Healthy DNS
D. Insufficient schedulable resources

### Q8. Where can you see recent scheduling or pull errors?

A. Kubernetes Events
B. Git tags
C. Docker Hub stars
D. Helm templates only

### Q9. What should you check if a Service has no endpoints?

A. Only the Git commit message
B. Whether its selector matches ready Pods
C. Only the cluster timezone
D. Only Docker build cache

### Q10. What is the final step after fixing an incident?

A. Delete all logs
B. Disable probes
C. Verify the workload behaves correctly
D. Skip testing

## Answer key

`1-A, 2-D, 3-D, 4-A, 5-D, 6-B, 7-D, 8-A, 9-B, 10-C`

## Kaif’s revision help

- **Q1:** `kubectl get pods` gives the first quick status view. Add `-o wide` for Pod IP and node.
- **Q2:** `kubectl describe pod NAME` shows conditions and recent events, which often state the reason directly.
- **Q3:** `kubectl logs NAME` shows what the application printed. For a crash loop, add `--previous`.
- **Q4:** `kubectl exec` runs a command inside an already-running container, such as `printenv`, `nslookup`, or `sh`.
- **Q5:** ImagePullBackOff means Kubernetes cannot pull the image: wrong image/tag, private registry credentials, or networking issue.
- **Q6:** CrashLoopBackOff means the container repeatedly starts and exits/crashes; logs are the main evidence.
- **Q7:** Pending often means scheduler cannot find a suitable node due to insufficient CPU/memory, PVC not bound, or scheduling constraints.
- **Q8:** Events reveal scheduling, image pull, mount, and probe failures.
- **Q9:** A Service needs its selector to match ready Pod labels before it gets endpoints.
- **Q10:** A fix is incomplete until status, logs, endpoints, and application behavior are verified.

## Exam-style practical tasks

In a practical exam, the question may not say “run `kubectl describe`.” Instead, it gives a broken situation and asks you to **identify the reason, fix it, and verify it**. Use the same pattern every time:

```text
1. See the status.
2. Read the evidence: describe, events, or logs.
3. Make the smallest correct fix.
4. Verify that the resource and application are healthy.
```

Replace these placeholders before running commands:

```text
NAMESPACE     = namespace provided in the question, for example demo
POD_NAME      = broken Pod name shown by kubectl get pods
SERVICE_NAME  = Service name provided in the question
DEPLOYMENT    = Deployment name provided in the question
```

---

### Task 1 — A Pod shows `ImagePullBackOff`

**Exam question may say:**

> A Deployment has been created in the `demo` namespace, but its Pod shows `ImagePullBackOff`. Find the cause, correct it, and verify the application starts.

**What the status means:** Kubernetes cannot download the container image. The application has not started yet.

**Write/run these commands:**

```bash
# Step 1: Find the broken Pod and see its status.
kubectl get pods -n demo

# Step 2: Read the Pod Events. This normally reveals the exact image-pull error.
kubectl describe pod POD_NAME -n demo

# Step 3: Show recent cluster events, newest last.
kubectl get events -n demo --sort-by=.lastTimestamp

# Step 4: Inspect the Deployment image currently configured.
kubectl describe deployment DEPLOYMENT -n demo
```

**What you should look for:**

- `Failed to pull image`
- `manifest unknown`
- `not found`
- `unauthorized`

**Expected fix:** Correct the image repository/tag in the Deployment YAML. If the image is private, configure the correct `imagePullSecrets` instead.

```bash
# Apply the corrected Deployment YAML after fixing the image reference.
kubectl apply -f deployment.yaml -n demo

# Verify that the new Pod becomes Running and ready.
kubectl get pods -n demo -w
```

**Exam answer in one sentence:** `ImagePullBackOff` means Kubernetes cannot pull the specified image; inspect Pod Events, correct the image/tag or registry credentials, then verify the replacement Pod is `Running`.

---

### Task 2 — A Pod shows `CrashLoopBackOff`

**Exam question may say:**

> A Pod repeatedly restarts and shows `CrashLoopBackOff`. Diagnose the issue using Kubernetes commands. Which logs are most useful, and how will you verify your fix?

**What the status means:** The container starts but its application exits or crashes repeatedly.

**Write/run these commands:**

```bash
# Step 1: Confirm the restart count and failing Pod status.
kubectl get pods -n demo

# Step 2: Inspect container state, exit reason, probe failures, and Events.
kubectl describe pod POD_NAME -n demo

# Step 3: Read logs from the currently running/restarting container.
kubectl logs POD_NAME -n demo

# Step 4: Read logs from the previous crashed container instance.
# This is especially important for CrashLoopBackOff.
kubectl logs POD_NAME -n demo --previous
```

If the Pod has more than one container:

```bash
# Select the container explicitly in a multi-container Pod.
kubectl logs POD_NAME -c CONTAINER_NAME -n demo --previous
```

**What you should look for:**

- Application error or stack trace
- Missing environment variable
- Invalid command or argument
- Database/service connection failure
- Wrong ConfigMap or Secret key
- `OOMKilled` or liveness-probe failure

**Expected fix:** Fix the actual reason found in the logs or Events—for example, correct an environment variable, command, port, mounted configuration, or probe.

```bash
# Reapply the corrected manifest.
kubectl apply -f deployment.yaml -n demo

# Verify the new Pod is ready and restarts do not keep increasing.
kubectl get pods -n demo -w
```

**Exam answer in one sentence:** For `CrashLoopBackOff`, use `kubectl logs POD_NAME --previous` with `kubectl describe pod`; fix the application/configuration error and confirm the Pod becomes ready without continuous restarts.

---

### Task 3 — A Pod remains `Pending`

**Exam question may say:**

> A newly created Pod remains in `Pending` state. Identify why it is not scheduled and state how you would verify the solution.

**What the status means:** Kubernetes accepted the Pod, but it has not been scheduled to a node or is waiting for required storage/resources.

**Write/run these commands:**

```bash
# Step 1: Confirm the Pod is still Pending.
kubectl get pods -n demo

# Step 2: Read scheduler Events at the bottom of the output.
kubectl describe pod POD_NAME -n demo

# Step 3: Check whether cluster nodes are Ready.
kubectl get nodes

# Step 4: Check storage claims if the Pod uses persistent storage.
kubectl get pvc -n demo

# Step 5: View recent scheduling events.
kubectl get events -n demo --sort-by=.lastTimestamp
```

**What you should look for:**

- `Insufficient cpu`
- `Insufficient memory`
- `pod has unbound immediate PersistentVolumeClaims`
- Node selector, taint, affinity, or toleration conflict

**Expected fix:** Add capacity/reduce requests, correct scheduling rules, or make the required PVC bind successfully. The exact fix depends on the Event message.

```bash
# Verify the Pod receives a node and enters Running state.
kubectl get pods -n demo -o wide -w
```

**Exam answer in one sentence:** A `Pending` Pod is usually waiting for a schedulable node or a bound PVC; use `kubectl describe pod` and Events to identify the scheduler's exact reason.

---

### Task 4 — Application Pod is running but the Service has no endpoints

**Exam question may say:**

> The `backend-service` Service exists, but traffic cannot reach the backend. `kubectl get endpoints backend-service` shows no addresses. Diagnose and fix the problem.

**What this usually means:** The Service selector does not match ready Pod labels, or the Pods are not ready.

**Write/run these commands:**

```bash
# Step 1: Inspect the Service selector and targetPort.
kubectl describe svc backend-service -n demo

# Step 2: Display all Pod labels for comparison with the Service selector.
kubectl get pods -n demo --show-labels

# Step 3: Check whether the Service has ready backend addresses.
kubectl get endpoints backend-service -n demo

# Step 4: Check whether backend Pods are actually Ready.
kubectl get pods -n demo
```

**What you should compare:**

```yaml
# Service selector
selector:
  app: backend

# Pod template labels — these must match the selector.
labels:
  app: backend
```

**Expected fix:** Make `spec.selector` in the Service exactly match the labels in the backend Pod template. Also confirm `targetPort` is the port the container listens on.

```bash
# Apply the corrected Service or Deployment manifest.
kubectl apply -f service.yaml -n demo

# Verify that ready Pod IP addresses appear as endpoints.
kubectl get endpoints backend-service -n demo
```

**Exam answer in one sentence:** Empty Service endpoints normally mean the Service selector does not match ready Pod labels; compare `kubectl describe svc` with `kubectl get pods --show-labels` and correct the mismatch.

---

### Task 5 — A Service cannot be reached from another Pod

**Exam question may say:**

> A frontend Pod cannot connect to `backend-service`. The backend Pod is running. Test Kubernetes DNS and identify what to check next.

**Write/run these commands:**

```bash
# Start a temporary DNS utility Pod in the same namespace.
kubectl run dns-test -n demo --image=busybox:1.36 --restart=Never -- sleep 3600

# Test whether Kubernetes DNS resolves the Service name.
kubectl exec -n demo dns-test -- nslookup backend-service

# Check the namespace DNS configuration inside the temporary Pod.
kubectl exec -n demo dns-test -- cat /etc/resolv.conf

# Check the Service and its ready endpoints.
kubectl get svc backend-service -n demo
kubectl get endpoints backend-service -n demo
```

For a Service in another namespace, use the fully qualified DNS name:

```bash
# Tests a Service named backend-service in namespace api.
kubectl exec -n demo dns-test -- nslookup backend-service.api.svc.cluster.local
```

**What you should check next:**

- Correct Service name and namespace
- Ready endpoints exist
- Correct Service `targetPort`
- Backend container listens on that port
- CoreDNS Pods are healthy if DNS itself does not resolve

```bash
# Check CoreDNS if name resolution fails.
kubectl get pods -n kube-system
```

**Exam answer in one sentence:** Use `kubectl exec` from a temporary Pod with `nslookup SERVICE_NAME`; if DNS resolves but traffic fails, inspect endpoints, selectors, and `targetPort`.

---

### Task 6 — You are told “resource not found,” but the resource exists

**Exam question may say:**

> `kubectl get pods` returns `No resources found`, but you know the application was deployed. How do you diagnose this before assuming the Pods were deleted?

**Write/run these commands:**

```bash
# List all namespaces to identify where the application may be deployed.
kubectl get namespaces

# Search for Pods across every namespace.
kubectl get pods -A

# Run the original command in the correct namespace.
kubectl get pods -n demo
```

**Exam answer in one sentence:** First check the namespace; without `-n`, `kubectl` uses the `default` namespace, so a resource in `demo` will appear missing.

---

### Task 7 — Full incident-verification task

**Exam question may say:**

> You have fixed a Kubernetes application issue. Show the commands you would use to prove that the Deployment, Pods, Service, and application path are healthy.

**Write/run these commands:**

```bash
# Verify Deployment desired/available replicas.
kubectl get deployment -n demo

# Verify every Pod is Running and Ready.
kubectl get pods -n demo

# Verify the Service exists and has backend endpoints.
kubectl get svc -n demo
kubectl get endpoints -n demo

# Inspect recent Events for remaining failures.
kubectl get events -n demo --sort-by=.lastTimestamp

# Read application logs for successful startup/request evidence.
kubectl logs POD_NAME -n demo
```

**Correct exam conclusion:** A fix is complete only when the expected replicas are available, Pods are ready, Service endpoints exist, Events show no continuing failures, and the application responds successfully.
