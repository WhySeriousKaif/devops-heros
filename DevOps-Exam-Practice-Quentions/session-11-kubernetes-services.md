# MCQs — session-11-kubernetes-services

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. Why are Kubernetes Services used?

A. Provide stable access to a set of Pods
B. Compile application code
C. Build container images
D. Store Git history

### Q2. Which Service type is typically reachable only within the cluster?

A. ClusterIP
B. NodePort
C. LoadBalancer
D. ExternalName only

### Q3. Which Service type exposes a port on each node?

A. NodePort
B. ExternalName
C. Headless only
D. ClusterIP

### Q4. Which Service type commonly provisions an external load balancer on supported clouds?

A. LoadBalancer
B. ClusterIP
C. ExternalName
D. Headless

### Q5. How does a Service identify backend Pods?

A. Label selector
B. Node hostname only
C. Git branch name
D. Docker image digest

### Q6. What does a Service `targetPort` refer to?

A. SSH port of the node
B. Port on a Git remote
C. Port on backend Pods
D. Port of the API server

### Q7. What is the role of kube-proxy in many clusters?

A. Build Dockerfiles
B. Schedule Pods
C. Store secrets in etcd
D. Implement Service traffic routing rules

### Q8. Which DNS name form can identify a Service across namespaces?

A. `pod.image.registry.local`
B. `service.cluster.node.local`
C. `service.namespace.svc.cluster.local`
D. `namespace.service.github.io`

### Q9. What does a headless Service commonly set?

A. `replicas: 0`
B. `type: NodePort`
C. `hostNetwork: true`
D. `clusterIP: None`

### Q10. Which command lists Services?

A. `kubectl build svc`
B. `kubectl init service`
C. `kubectl get svc`
D. `kubectl get images`

## Answer key

`1-A, 2-A, 3-A, 4-A, 5-A, 6-C, 7-D, 8-C, 9-D, 10-C`

## Kaif’s revision help

- **Q1:** Pods are replaceable and their IPs can change. A Service gives a stable IP/DNS name for reaching a selected group of Pods.
- **Q2:** ClusterIP is the default internal-only Service type.
- **Q3:** NodePort opens a high port on every worker node, normally in the range `30000–32767`.
- **Q4:** LoadBalancer asks a supported cloud provider such as AWS to create an external load balancer.
- **Q5:** A Service uses `spec.selector` to find matching Pod labels and create endpoints.
- **Q6:** `targetPort` is where the application listens inside the selected backend Pod.
- **Q7:** kube-proxy installs the node networking rules that route Service traffic to healthy backend Pods.
- **Q8:** Full Service DNS is `service.namespace.svc.cluster.local`.
- **Q9:** A headless Service sets `clusterIP: None`, so DNS returns individual Pod addresses instead of one virtual Service IP.
- **Q10:** `kubectl get svc` lists Services; `svc` is the short form of `services`.

## Practical answer patterns

### Lab 1 — ClusterIP selects replicas

```bash
kubectl create deployment backend --image=nginx:alpine --replicas=3
kubectl expose deployment backend --name=backend-service --port=80 --target-port=80
kubectl get svc backend-service
kubectl get endpoints backend-service # must list selected Pod IPs
```

### Lab 2 — NodePort access

```bash
kubectl expose deployment backend --name=backend-nodeport \
  --type=NodePort --port=80 --target-port=80
kubectl get svc backend-nodeport
```

Use the shown NodePort with a node IP. For Minikube, `minikube service backend-nodeport --url` gives a reachable local URL.

### Lab 3 — different `port` and `targetPort`

```yaml
spec:
  selector:
    app: backend
  ports:
    - port: 80         # Service-facing port
      targetPort: 8080 # application port in selected Pods
```

Verify `kubectl get endpoints SERVICE_NAME`; then use `kubectl port-forward service/SERVICE_NAME 8080:80` for a local test.
