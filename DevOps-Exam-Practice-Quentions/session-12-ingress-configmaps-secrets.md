# MCQs — session-12-ingress-configmaps-secrets

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What does Ingress commonly define?

A. HTTP/HTTPS routing rules to Services
B. Git branch protections
C. Node CPU architecture
D. Container build steps

### Q2. What is needed to implement Ingress rules?

A. A Git tag
B. A Terraform lock file
C. A Docker registry only
D. An Ingress controller

### Q3. What is a ConfigMap intended to store?

A. Persistent disk blocks
B. Passwords by default
C. Container images
D. Non-sensitive configuration data

### Q4. What is a Secret intended to store?

A. Sensitive configuration values
B. Container images
C. Cluster logs only
D. Helm binaries

### Q5. How can a ConfigMap be consumed by a Pod?

A. Node kernel flags only
B. Docker build cache only
C. Git commit messages only
D. Environment variables or mounted files

### Q6. What does a path rule in Ingress match?

A. Container filesystem path
B. The HTTP request path
C. Host disk mount path
D. Git remote path

### Q7. What does TLS termination usually provide at Ingress?

A. Automatic Pod autoscaling
B. Persistent volumes
C. Build artifact signing
D. HTTPS encryption for client connections

### Q8. Which command lists ConfigMaps?

A. `kubectl get configmaps`
B. `kubectl get secrets-only`
C. `kubectl get networks`
D. `kubectl get charts`

### Q9. Are Kubernetes Secret values encrypted merely because YAML uses base64?

A. Yes, base64 is strong encryption
B. No, base64 is encoding rather than encryption
C. Yes, they are always hashed
D. No, Secrets cannot contain strings

### Q10. Which Kubernetes resource commonly holds a TLS certificate and key for Ingress?

A. ConfigMap
B. Deployment
C. Secret
D. ServiceAccount only

## Answer key

`1-A, 2-D, 3-D, 4-A, 5-D, 6-B, 7-D, 8-A, 9-B, 10-C`

## Kaif’s revision help

- **Q1:** Ingress is an L7 HTTP/HTTPS routing rule that sends host/path traffic to Services.
- **Q2:** An Ingress resource is only a rule. An Ingress controller, such as NGINX Ingress, actually enforces it.
- **Q3:** ConfigMap contains normal settings such as log level, environment name, URL, or feature flag—not passwords.
- **Q4:** Secret contains sensitive values such as a database password, API key, or TLS certificate/key.
- **Q5:** Pods can read ConfigMap values as environment variables or files mounted from a volume.
- **Q6:** `/api` in an Ingress rule matches an HTTP URL path, not a file path.
- **Q7:** TLS termination encrypts the browser/client-to-Ingress connection using HTTPS.
- **Q8:** `kubectl get configmaps` (or `kubectl get cm`) lists ConfigMaps.
- **Q9:** Base64 is reversible encoding. Protect Secrets with RBAC, encryption at rest, and an external secret manager where appropriate.
- **Q10:** A TLS certificate and private key are stored in a Secret, normally type `kubernetes.io/tls`.

## Practical answer patterns

### Lab 1 — Ingress route

```bash
minikube addons enable ingress
kubectl apply -f ingress.yaml
kubectl get ingress
kubectl describe ingress APP_INGRESS
```

Your Ingress must route to existing Services, not directly to Deployments or Pods.

### Lab 2 — ConfigMap as environment variables

```bash
kubectl create configmap app-config --from-literal=APP_ENV=dev
kubectl get configmaps
kubectl exec POD_NAME -- printenv APP_ENV
```

### Lab 3 — Secret without hard-coding it in a Deployment

```bash
kubectl create secret generic db-credentials \
  --from-literal=DB_PASSWORD='use-a-safe-value'
kubectl get secrets
```

Reference it with `secretKeyRef` in the Pod/Deployment. Do not put a real credential into a Git-tracked YAML file.
