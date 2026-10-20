# MCQs — session-13-storage-hpa-probes

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What is a PersistentVolumeClaim (PVC)?

A. A request for persistent storage
B. A network firewall
C. A container image
D. A Git tag

### Q2. What is a PersistentVolume (PV)?

A. An Ingress controller
B. A cluster storage resource
C. A Deployment revision
D. A DNS zone

### Q3. What does a StorageClass help define?

A. Which Git branch is default
B. Which HTTP path is matched
C. Which Dockerfile is used
D. How dynamic storage provisioning occurs

### Q4. What does HPA stand for?

A. HTTP Proxy Adapter
B. Helm Package Archive
C. Horizontal Pod Autoscaler
D. Host Port Allocator

### Q5. What does an HPA commonly adjust?

A. Container image contents
B. Number of Pod replicas
C. Git history
D. Node operating system

### Q6. What does a readiness probe determine?

A. Whether a container image exists
B. Whether a container should receive traffic
C. Whether Git is clean
D. Whether a node is a control plane

### Q7. What does a liveness probe help detect?

A. Whether a Service has a public IP
B. Whether a volume is encrypted
C. Whether Terraform is initialized
D. When a container should be restarted

### Q8. What does a startup probe help with?

A. Allowing slow-starting apps time to initialize
B. Provisioning a cloud account
C. Creating a Docker network
D. Checking Git credentials

### Q9. What can happen if a Pod's PVC remains unbound?

A. The image is rebuilt automatically
B. The Pod may remain Pending
C. The Pod is always Running
D. The Deployment is deleted

### Q10. Which command lists PVCs?

A. `kubectl get hpa-only`
B. `kubectl get routes`
C. `kubectl get mounts`
D. `kubectl get pvc`

## Answer key

`1-A, 2-B, 3-D, 4-C, 5-B, 6-B, 7-D, 8-A, 9-B, 10-D`

## Kaif’s revision help

- **Q1:** A PVC is the application/team request for storage; it is normally namespaced.
- **Q2:** A PV is the actual storage resource available to the cluster.
- **Q3:** StorageClass tells Kubernetes which provisioner/settings to use for automatically creating a PV after a PVC request.
- **Q4–Q5:** HPA means Horizontal Pod Autoscaler; it changes the replica count of a scalable workload such as a Deployment.
- **Q6:** Readiness controls whether a Pod gets Service traffic; it does not normally restart the container.
- **Q7:** Liveness detects a stuck/unhealthy container and Kubernetes restarts it.
- **Q8:** Startup probe gives a slow application time to initialize before liveness/readiness checks take over.
- **Q9:** A Pod needing a PVC can stay Pending until its PVC is Bound.
- **Q10:** `kubectl get pvc` lists PersistentVolumeClaims.

## Practical answer patterns

### Lab 1 — PVC persistence

```bash
kubectl apply -f pvc.yaml
kubectl get pvc                 # wait for Bound
kubectl apply -f pod.yaml
kubectl exec storage-pod -- sh -c 'echo retained > /data/demo.txt'
kubectl delete pod storage-pod
kubectl apply -f pod.yaml
kubectl exec storage-pod -- cat /data/demo.txt
```

The final command proves data survives Pod replacement because it lives on persistent storage, not the Pod filesystem.

### Lab 2 — readiness and liveness

```bash
kubectl apply -f probes.yaml
kubectl describe pod APP_POD # probe config and failures
kubectl get pod APP_POD -w   # Ready status/restarts over time
```

Readiness failure: `Running` but `READY 0/1`; traffic stops. Liveness failure: restart count increases.

### Lab 3 — HPA

```bash
minikube addons enable metrics-server # local-cluster prerequisite
kubectl top nodes                     # must return CPU/memory values
kubectl apply -f deployment.yaml
kubectl apply -f hpa.yaml
kubectl get hpa -w
```

For CPU-utilization HPA, set CPU requests on the target Deployment. Without metrics, HPA shows an unknown target and cannot make CPU-based scaling decisions.
