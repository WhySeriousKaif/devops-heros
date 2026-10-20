# DevOps Lab Exam Playbook — Sessions 1 to 15

This workbook turns the topics into the usual practical-exam format: **story → task → commands → verification**. Replace names such as `APP`, `POD_NAME`, and `NAMESPACE` with those given in the question.

## Rule for every terminal task

```text
1. Inspect the current state.
2. Make the requested change.
3. Verify the result.
```

---

## Session 1 — DevOps fundamentals

### Task 1 — Explain the delivery pipeline

**Exam story:** A developer pushes code. Describe how DevOps delivers it safely.

**Write as the answer:**

```text
Developer commit → CI runs tests/lint/build → artifact or image is published
→ CD deploys the approved version → monitoring checks availability, errors, latency, CPU, and memory.

CI validates changes early. CD delivers/deploys validated changes repeatedly.
```

### Task 2 — Create the first project snapshot

```bash
# Start source control in the current project folder.
git init
# See new/untracked files.
git status
# Stage files and create the first versioned snapshot.
git add .
git commit -m "Initial application setup"
# Prove the commit exists.
git log --oneline -1
```

---

## Session 2 — Linux fundamentals

### Task 1 — Create a workspace and inspect files

**Exam story:** Create `/tmp/devops-lab/config` with `app.conf` and `db.conf`, then show the result.

```bash
# Create directory and missing parent directories.
mkdir -p /tmp/devops-lab/config
# Create two empty files.
touch /tmp/devops-lab/config/app.conf /tmp/devops-lab/config/db.conf
# Verify names, permissions, and paths.
ls -la /tmp/devops-lab/config
find /tmp/devops-lab/config -type f
```

### Task 2 — Find errors and set a script permission

**Exam story:** Show every error in `app.log`, then make `deploy.sh` executable only by its owner.

```bash
# Find lines containing ERROR with line numbers.
grep -n "ERROR" app.log
# Check existing permissions.
ls -l deploy.sh
# Add execute permission only for user/owner.
chmod u+x deploy.sh
# Verify the updated permissions.
ls -l deploy.sh
```

### Task 3 — Investigate a slow server

```bash
# Check filesystem usage.
df -h
# Show processes using the most CPU.
ps aux --sort=-%cpu | head
# Show uptime and load averages.
uptime
```

---

## Session 3 — Shell scripting

### Task 1 — Require a script argument

**Exam story:** Write `greet.sh`. It accepts one name; when no name is given, it prints usage and exits with code `1`.

```bash
#!/bin/bash

# $1 is the first argument. -z checks whether it is empty.
if [ -z "$1" ]; then
  echo "Usage: ./greet.sh NAME"
  exit 1
fi

echo "Hello, $1"
```

```bash
# Permit execution and test the script.
chmod +x greet.sh
./greet.sh Kaif
```

### Task 2 — Check a configuration file before using it

```bash
#!/bin/bash

# -f is true only for an existing regular file.
if [ -f /tmp/app.conf ]; then
  echo "Configuration file exists"
else
  echo "Configuration file is missing"
fi
```

### Task 3 — Repeat an action for several services

```bash
#!/bin/bash

# Run the body once for every listed service.
for service in api frontend database
do
  echo "Checking $service"
done
```

---

## Session 4 — Networking fundamentals

### Task 1 — Identify DNS, network, or HTTP failure

**Exam story:** `https://example.com` is reportedly unavailable. Test name resolution, connectivity, and HTTP response.

```bash
# Resolve domain name to IP address.
nslookup example.com
# Test basic network reachability; some servers may block ICMP.
ping -c 4 example.com
# Request HTTP response headers/status.
curl -I https://example.com
```

### Task 2 — Find local address and check port 8080

```bash
# Show network interfaces and assigned IP addresses.
ip addr show
# Show listening TCP/UDP ports.
ss -tulpn
# Check specifically for port 8080.
ss -tulpn | grep 8080
```

### Task 3 — Subnet calculation

**Exam story:** For `192.168.1.100/26`, provide network, broadcast, and usable range.

```text
/26 mask = 255.255.255.192; block size = 256 - 192 = 64.
The address is in block 64–127.
Network = 192.168.1.64
Broadcast = 192.168.1.127
Usable range = 192.168.1.65–192.168.1.126 (62 hosts)
```

---

## Session 5 — Git and GitHub

### Task 1 — Create and merge a feature branch

```bash
# Create and switch to the feature branch.
git switch -c feature/login
# Stage and commit the feature change.
git add login.txt
git commit -m "Add login feature"
# Merge it into main.
git switch main
git merge feature/login
# Verify branch history.
git log --oneline --graph --all
```

### Task 2 — Add a remote and push the project

```bash
# Add GitHub repository as remote origin.
git remote add origin https://github.com/USER/REPOSITORY.git
# Verify the remote URL.
git remote -v
# Push main and create its upstream tracking relationship.
git push -u origin main
```

### Task 3 — Stop tracking an accidentally committed `.env` file

```bash
# Ignore future copies.
echo ".env" >> .gitignore
# Remove from Git index but preserve the local file.
git rm --cached .env
# Commit the correction.
git add .gitignore
git commit -m "Stop tracking environment file"
```

---

## Session 6 — Docker fundamentals

### Task 1 — Build, run, and test an image

**Exam story:** Build the Dockerfile as `hello-app:1.0`; map host port `8080` to container port `80`.

```bash
# Build image from Dockerfile in current directory.
docker build -t hello-app:1.0 .
# Run in background with port forwarding.
docker run -d --name hello-app -p 8080:80 hello-app:1.0
# Verify container and mapping.
docker ps
# Test through host port.
curl http://localhost:8080
```

### Task 2 — Diagnose a failed container

```bash
# Show running and stopped containers.
docker ps -a
# Read application output/errors.
docker logs api
# Inspect exit code, command, ports, and container state.
docker inspect api
# Open a shell only if the container is running.
docker exec -it api sh
```

### Task 3 — Explain `-p 8080:80`

```text
8080 is the host port; 80 is the container port.
http://localhost:8080 forwards to port 80 inside the container.
```

---

## Session 7 — Docker images and multi-stage builds

### Task 1 — Write a multi-stage build

**Exam story:** Build a frontend without shipping Node build tools in its final runtime image.

```dockerfile
# Build stage: compiles the application.
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: contains only built static files.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
# Build final image and check its tag/size.
docker build -t frontend:1.0 .
docker images frontend:1.0
```

### Task 2 — Tag and push an image

```bash
# Give local backend image a registry-compatible tag.
docker tag backend:1.0 ghcr.io/USER/backend:1.0
# Log in, then upload the tagged image.
docker login ghcr.io
docker push ghcr.io/USER/backend:1.0
```

### Task 3 — Exclude unnecessary build-context files

**Create `.dockerignore`:**

```text
node_modules
.git
.env
dist
```

**Answer:** `.dockerignore` reduces build context and helps prevent local or sensitive files from entering an image.

---

## Session 8 — Docker networking, volumes, and Compose

### Task 1 — Let two containers communicate by name

**Exam story:** Run `api` and `database` on the same custom Docker network. The API must use hostname `database`.

```bash
# Create a user-defined bridge network with container-name DNS.
docker network create app-net
# Start database on that network.
docker run -d --name database --network app-net postgres:16
# Start API on the same network.
docker run -d --name api --network app-net my-api:1.0
# Verify connected containers and network details.
docker network inspect app-net
```

**Answer:** On a user-defined bridge network, `api` connects to `database`, not `localhost`.

### Task 2 — Persist database data

```bash
# Create storage independent of a particular container.
docker volume create postgres-data
# Mount the named volume at PostgreSQL's data location.
docker run -d --name db \
  -e POSTGRES_PASSWORD=example-only \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:16
# Verify the volume exists.
docker volume ls
```

**Answer:** A named volume keeps data when the container is removed and recreated, unless the volume itself is removed.

### Task 3 — Start and inspect a Compose stack

```bash
# Start every service declared in compose.yaml in background.
docker compose up -d
# Show the service/container state.
docker compose ps
# Follow backend logs for debugging.
docker compose logs -f backend
# Stop and remove the stack when explicitly asked.
docker compose down
```

---

## Session 9 — Kubernetes fundamentals

### Task 1 — Inspect the selected cluster

```bash
# Show the kubeconfig context currently in use.
kubectl config current-context
# Show client/server version information.
kubectl version
# Show nodes and whether they are Ready.
kubectl get nodes
# Show all namespaces.
kubectl get namespaces
```

### Task 2 — Deploy Nginx with two replicas

```bash
# Create a Deployment with two desired replicas.
kubectl create deployment web --image=nginx:alpine --replicas=2
# Show the Deployment and its selected Pods.
kubectl get deployment web
kubectl get pods -l app=web
# Wait for a successful rollout.
kubectl rollout status deployment/web
```

### Task 3 — Work in an application namespace

```bash
# Create an isolated namespace for the application.
kubectl create namespace demo
# View Pods only in that namespace.
kubectl get pods -n demo
# Compare with every namespace in the cluster.
kubectl get pods -A
```

---

## Session 10 — Pods, Deployments, ReplicaSets, and rollouts

### Task 1 — Apply a Deployment and prove replicas are ready

```bash
# Create/update objects in the provided manifest.
kubectl apply -f deployment.yaml -n demo
# Inspect desired/current/available replica counts.
kubectl get deployment -n demo
# See Pods selected by the Deployment label.
kubectl get pods -n demo -l app=api
# Wait for rollout completion.
kubectl rollout status deployment/api -n demo
```

### Task 2 — Scale a Deployment

```bash
# Change desired replica count to four.
kubectl scale deployment api --replicas=4 -n demo
# Verify the Pods and Deployment state.
kubectl get pods -n demo -l app=api
kubectl get deployment api -n demo
```

### Task 3 — Update an image and undo a bad rollout

```bash
# Start a rolling image update.
kubectl set image deployment/api api=api:2.0 -n demo
# See whether the rollout succeeds.
kubectl rollout status deployment/api -n demo
# Display rollout revisions.
kubectl rollout history deployment/api -n demo
# Return to the previous revision if the update is faulty.
kubectl rollout undo deployment/api -n demo
```

---

## Session 11 — Kubernetes Services

### Task 1 — Expose an application internally

**Exam story:** Expose Deployment `api` as `api-service` on port `80`, forwarding to container port `8000`.

```bash
# Create a ClusterIP Service that selects api Pods.
kubectl expose deployment api --name=api-service --port=80 --target-port=8000 -n demo
# Inspect selector, ports, and endpoints.
kubectl describe svc api-service -n demo
kubectl get endpoints api-service -n demo
```

### Task 2 — Test a ClusterIP Service from your computer

```bash
# Keep this command running in one terminal.
kubectl port-forward svc/api-service 8000:80 -n demo
```

In a second terminal:

```bash
# Test the Service through the temporary local tunnel.
curl http://localhost:8000
```

### Task 3 — Explain `port` and `targetPort`

```text
Clients send traffic to Service port 80.
The Service forwards traffic to targetPort 8000 on selected ready Pods.
The Service selector must match the Pod labels for endpoints to exist.
```

---

## Session 12 — Ingress, ConfigMaps, and Secrets

### Task 1 — Create non-sensitive application configuration

```bash
# Create/update ConfigMap key APP_MODE=production.
kubectl create configmap app-config \
  --from-literal=APP_MODE=production \
  -n demo --dry-run=client -o yaml | kubectl apply -f -
# Verify it exists.
kubectl get configmap app-config -n demo -o yaml
```

**Deployment YAML answer:**

```yaml
# Read the non-sensitive value from ConfigMap.
env:
  - name: APP_MODE
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_MODE
```

### Task 2 — Create and consume a Secret

```bash
# Create/update an example Secret. Do not commit real secrets to Git.
kubectl create secret generic db-secret \
  --from-literal=DB_PASSWORD=example-only \
  -n demo --dry-run=client -o yaml | kubectl apply -f -
# Verify Secret metadata only.
kubectl get secret db-secret -n demo
```

```yaml
# Read DB_PASSWORD from Secret at runtime.
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: DB_PASSWORD
```

### Task 3 — Route `/api` through an Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: revision.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

```bash
# Apply then inspect the host/path/backend rule.
kubectl apply -f ingress.yaml -n demo
kubectl describe ingress api-ingress -n demo
```

---

## Session 13 — Storage, probes, and HPA

### Task 1 — Request persistent storage with a PVC

**PVC YAML answer:**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: app-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

```bash
# Create/update the claim.
kubectl apply -f pvc.yaml -n demo
# Verify it becomes Bound; describe it if it remains Pending.
kubectl get pvc -n demo
kubectl describe pvc app-data -n demo
```

### Task 2 — Add readiness and liveness checks

```yaml
# Put this under the relevant container in deployment.yaml.
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 15
```

```bash
# Apply and inspect readiness/probe Events.
kubectl apply -f deployment.yaml -n demo
kubectl describe pod POD_NAME -n demo
```

**Answer:** Readiness controls Service traffic; liveness restarts a repeatedly unhealthy container.

### Task 3 — Scale automatically with HPA

```bash
# Keep api between two and five replicas at 70% average CPU target.
kubectl autoscale deployment api --cpu-percent=70 --min=2 --max=5 -n demo
# Inspect current metrics target and desired replicas.
kubectl get hpa -n demo
kubectl describe hpa api -n demo
# Confirm Metrics Server is supplying Pod metrics.
kubectl top pods -n demo
```

---

## Session 14 — Kubernetes troubleshooting

Session 14 already has seven detailed scenario tasks. Use it for these stories:

1. Pod is `ImagePullBackOff`
2. Pod is `CrashLoopBackOff`
3. Pod remains `Pending`
4. Service has no endpoints
5. In-cluster DNS/service request fails
6. Resource looks missing because of a namespace mistake
7. Verify a complete incident fix

Open the detailed task sheet: [Session 14 troubleshooting](session-14-kubernetes-troubleshooting.md)

### Universal Kubernetes debugging answer

```bash
# Discover the resource state first.
kubectl get pods -n NAMESPACE
# Read conditions and Events.
kubectl describe pod POD_NAME -n NAMESPACE
# Read app logs; --previous is essential for crash loops.
kubectl logs POD_NAME -n NAMESPACE --previous
# Inspect Service path when traffic is failing.
kubectl get svc,endpoints -n NAMESPACE
# Verify the corrected workload continuously.
kubectl get pods -n NAMESPACE -w
```

---

## Session 15 — Helm

### Task 1 — Validate and preview a Helm chart before installation

**Exam story:** A local chart named `revision-chart` must be checked before it changes the `demo` namespace.

```bash
# Check chart metadata and common template problems.
helm lint ./revision-chart

# Render the Kubernetes YAML locally; this does not change the cluster.
helm template revision-dev ./revision-chart -n demo
```

**Answer:** `helm lint` validates basic chart structure; `helm template` previews the rendered manifests without installing them.

### Task 2 — Install or upgrade an application repeatably

**Exam story:** Deploy the chart as release `revision-dev`. The command must work whether the release already exists or not.

```bash
# Install when missing; otherwise upgrade the existing release.
helm upgrade --install revision-dev ./revision-chart \
  -n demo --create-namespace

# Verify the release and Kubernetes workload status.
helm status revision-dev -n demo
kubectl get pods -n demo
```

### Task 3 — Correct a failed upgrade by rolling back

**Exam story:** A new image tag breaks the application. Find the working revision and restore it.

```bash
# Display Helm revision history.
helm history revision-dev -n demo

# Return to the selected known-good revision, for example revision 1.
helm rollback revision-dev 1 -n demo

# Verify the replacement Pods become ready.
kubectl get pods -n demo -w
```

**Answer:** A chart is the reusable package, a release is its installed instance, and rollback restores an earlier release configuration.

---

## Final exam checklist

```text
□ I used the namespace given in the question.
□ I inspected before modifying anything.
□ I used the exact resource name from the task.
□ I verified the requested result.
□ I did not print or commit real credentials.
□ For a “why” question, I wrote a one-line explanation.
```

The most reliable practical answer is always: **inspect → change → verify**.
