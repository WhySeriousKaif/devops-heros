# MCQs — session10-k8s-core-objects

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What is the purpose of a Deployment?

A. Store cluster state
B. Manage desired replicas and rolling updates
C. Expose a public DNS zone
D. Create container images

### Q2. What does a ReplicaSet ensure?

A. A desired number of matching Pods are running
B. Nodes never fail
C. Every Pod has a public IP
D. All images are signed

### Q3. Which field commonly sets Deployment replica count?

A. `status.desiredNodes`
B. `spec.ports`
C. `metadata.replicas`
D. `spec.replicas`

### Q4. What does a Pod label help with?

A. Allocating disk partitions
B. Installing Helm
C. Selecting and organizing resources
D. Encrypting image layers

### Q5. What is a label selector used for?

A. Selecting Git commits by date
B. Matching resources with specified labels
C. Choosing Docker build stages
D. Filtering shell history

### Q6. Which command scales a Deployment?

A. `kubectl duplicate image`
B. `kubectl increase node`
C. `kubectl scale deployment`
D. `kubectl resize pod`

### Q7. What happens when a Deployment Pod crashes?

A. A controller works to restore desired state
B. Git automatically rolls back
C. Kubernetes deletes the Deployment permanently
D. The cluster always stops

### Q8. Which command views rollout status?

A. `kubectl get dns`
B. `kubectl rollout status deployment/name`
C. `kubectl helm status`
D. `kubectl logs nodes`

### Q9. What does a rolling update do?

A. Gradually replace old Pods with new ones
B. Change namespace ownership
C. Restart the control plane
D. Delete all nodes first

### Q10. Which resource usually creates and manages ReplicaSets?

A. Secret
B. PersistentVolume
C. ConfigMap
D. Deployment

## Answer key

`1-B, 2-A, 3-D, 4-C, 5-B, 6-C, 7-A, 8-B, 9-A, 10-D`

## Kaif’s revision help

- **Q1:** A Deployment is the normal resource for stateless apps. It manages ReplicaSets and supports rolling updates/rollbacks.
- **Q2:** A ReplicaSet compares desired replica count with actual matching Pods and creates replacements when necessary.
- **Q3:** Replica count is written under `spec.replicas`.
- **Q4–Q5:** Labels are key-value tags such as `app: web`; selectors find resources whose labels match.
- **Q6:** Example: `kubectl scale deployment web --replicas=5`.
- **Q7:** Controllers continuously reconcile actual and desired state. A missing Pod is recreated.
- **Q8:** `kubectl rollout status deployment/web` watches an update until it succeeds or fails.
- **Q9:** Rolling update replaces old Pods gradually, so a stateless web app can stay available.
- **Q10:** Deployment is higher-level: it creates/manages ReplicaSets, which in turn manage Pods.

## Practical answer patterns

### Lab 1 — Nginx Pod and inspection

```bash
kubectl run nginx-pod --image=nginx:alpine
kubectl get pod nginx-pod --show-labels   # status and labels
kubectl get pod nginx-pod -o wide         # includes Pod IP and node
kubectl describe pod nginx-pod             # events and detailed configuration
kubectl logs nginx-pod                     # container/application output
```

### Lab 2 — scale a Deployment

```bash
kubectl create deployment web --image=nginx:alpine --replicas=2
kubectl get deployment web
kubectl scale deployment web --replicas=5
kubectl get pods -l app=web
kubectl scale deployment web --replicas=2
```

### Lab 3 — rolling update and rollback

```bash
kubectl set image deployment/web nginx=nginx:1.27-alpine
kubectl rollout status deployment/web
kubectl rollout history deployment/web
kubectl rollout undo deployment/web
kubectl rollout status deployment/web
```

Always verify with `kubectl get deployment` and `kubectl get pods`.
