# DevOps Master Exam Cheat Sheet — Sessions 1 to 20

This is the final-revision sheet for MCQs and labs. Read the concept bullets first, then practise the command workflows. Replace placeholders such as APP, NAMESPACE, FILE and IMAGE with the names given in the question.

## Exam method

1. Identify the tool: Linux, Git, Docker, Kubernetes, Helm, CI/CD, Terraform, cloud, monitoring, or GitOps.
2. Inspect the current state before changing anything.
3. Make the smallest requested change.
4. Verify the outcome before moving to the next task.

---

# Part 1 — Concepts for MCQs

## 1. DevOps

- DevOps joins development and operations to deliver software faster, safely and reliably.
- CI means code is frequently integrated and automatically built/tested.
- Continuous Delivery means software is always deployable but production may need approval.
- Continuous Deployment means every passing change is deployed automatically.
- IaC means infrastructure is defined in versioned code instead of manual console clicks.
- Main goals: automation, collaboration, fast feedback, repeatability, reliability and measurement.

## 2. Linux and shell basics

### Files and paths

- / is filesystem root; ~ is the current user's home; . is current directory; .. is parent directory.
- /home holds regular users' homes; /root is root user's home; /var/log commonly holds logs.
- An absolute path starts with /; a relative path starts from the current directory.
- A hidden file starts with a dot, such as .gitignore.

### Permissions and ownership

- Read = 4, write = 2, execute = 1.
- 755 means rwx for owner and r-x for group and others.
- 644 means rw- for owner and r-- for group and others.
- chmod changes permissions; chown changes owner; chgrp changes group.
- u, g, o and a mean owner, group, others and all.

### Shell scripting

- The shebang #!/bin/bash tells Linux which interpreter runs a script.
- # starts a comment.
- Variables have no spaces around equals: name="Kaif".
- Quote variable values as "$name".
- $0 is script name; $1 and $2 are arguments; $# is count; $@ is all arguments.
- > overwrites output, >> appends, | pipes output, && runs the next command only after success.
- if is decision logic; for and while repeat.
- Numeric test operators: -eq, -ne, -gt, -lt, -ge, -le.
- $(command) captures command output; $(( expression )) calculates arithmetic.

## 3. Networking

### Addressing and subnetting

- IPv4 has 32 bits, four octets, and each octet ranges from 0 to 255.
- CIDR /n means n network bits. Host bits = 32 minus CIDR.
- Total addresses = 2 to the power of host bits. Usable hosts usually = total minus 2.
- Network address is first; broadcast is last; usable hosts are between them.
- Block size = 256 minus the changing subnet-mask octet.
- /24 has 254 usable hosts; /25 has 126; /26 has 62; /27 has 30; /28 has 14; /29 has 6; /30 has 2.
- Example: 192.168.1.100/26 is in 64–127. Network is .64, broadcast .127, usable .65–.126.

### Network memory lines

- Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.
- 127.0.0.1 is loopback. 0.0.0.0/0 means every IPv4 address/route.
- DNS maps names to IPs; DHCP assigns network settings automatically.
- Default gateway forwards traffic to other networks. NAT lets private addresses use public access.
- TCP is reliable and connection-oriented; UDP is lightweight and connectionless; ICMP supports diagnostics.
- Common ports: SSH 22, DNS 53, HTTP 80, HTTPS 443, PostgreSQL 5432, MySQL 3306.
- IP is a logical network address; MAC is a local network-interface address.
- Ping to an IP works but a hostname fails: suspect DNS.

## 4. Git and GitHub

- Git is distributed version control. GitHub hosts repositories and collaboration.
- The normal flow is working directory → staging area → local commit → remote repository.
- git status is the first command when unsure.
- git add stages, git commit records, and git push publishes commits.
- Branch means an independent line of work.
- git fetch downloads remote information without merging; git pull fetches and integrates.
- Merge combines histories. Rebase reapplies commits on a new base.
- Conflict means Git cannot automatically combine overlapping changes.
- git restore discards uncommitted file changes. git revert creates a new undo commit. Use reset carefully.
- .gitignore prevents unwanted untracked files such as secrets and build output being committed.

## 5. Docker

- Image is an immutable package/blueprint. Container is its running instance.
- Containers share the host kernel; virtual machines include a guest operating system.
- Core Docker objects: image, container, volume and network.
- Dockerfile instructions: FROM base image, RUN build-time command, COPY files, CMD default command.
- CMD is an overridable default; ENTRYPOINT is the primary executable.
- EXPOSE documents a container port. Port publishing with -p HOST:CONTAINER makes it reachable from host.
- Volume is Docker-managed persistent storage. Bind mount maps a host directory into the container.
- .dockerignore reduces build context and keeps unwanted files out of images.

## 6. Docker images, networking and Compose

- Source change requires image rebuild and redeployment with a new image tag.
- Tag images clearly, for example app:1.0 or a commit SHA. Do not depend only on latest.
- ARG is available while building; ENV is available to the running container.
- Run containers as a non-root user when possible.
- Multi-stage build: builder stage has tools; final stage copies only required output. It makes smaller, safer images.
- Bridge network is normal Docker networking. Containers on one user-defined bridge can use each other's names.
- Host network shares the host networking stack, so -p is not needed; it has less isolation.
- None disables normal networking; overlay is for multi-host container networking.
- Named volume persists data. Bind mount is useful for local development because host edits appear immediately.
- Docker Compose defines services, networks, volumes and environment configuration in one YAML file.

## 7. Kubernetes core concepts

- Kubernetes manages containerized workloads through desired state.
- Control plane: API server is front door, etcd stores state, scheduler selects nodes, controller manager reconciles state.
- Worker node: kubelet is node agent, kube-proxy manages network rules, runtime runs containers.
- Pod is the smallest deployable unit and may contain one or more tightly coupled containers.
- Namespace is a logical resource scope.
- Labels are key/value metadata. Selectors choose matching resources.
- ReplicaSet maintains the requested Pod count.
- Deployment manages ReplicaSets and rolling updates for stateless apps.
- StatefulSet gives stable identity/storage for stateful apps.
- DaemonSet runs one Pod on every eligible node.

## 8. Kubernetes Services and configuration

- Service gives stable access to replaceable Pods.
- Service selector must match Pod labels; otherwise Service has no endpoints.
- port = Service port; targetPort = container destination port; nodePort = port opened on each node.
- ClusterIP is internal-only default. NodePort opens a port on nodes. LoadBalancer requests cloud external access.
- ExternalName is a DNS alias. Headless Service gives direct Pod discovery.
- CoreDNS resolves service names. Same namespace can use service name; full DNS includes service.namespace.svc.cluster.local.
- ConfigMap stores non-sensitive configuration outside an image.
- Secret stores sensitive configuration. Base64 is encoding, not encryption.
- Ingress resource declares HTTP/HTTPS host/path routing. Ingress controller implements the routing.
- TLS at Ingress requires a TLS Secret and controller support.

## 9. Kubernetes storage, health and scaling

- emptyDir is temporary storage scoped to a Pod and disappears with the Pod.
- hostPath mounts a node directory and ties workload to that node.
- PV is available storage; PVC is a claim/request for storage; StorageClass supports dynamic provisioning.
- PVC Pending usually means there is no matching volume or working provisioner.
- Access modes: ReadWriteOnce = one node; ReadOnlyMany = many readers; ReadWriteMany = many writers when storage supports it.
- Liveness probe asks whether Kubernetes should restart a container.
- Readiness probe asks whether a Pod should receive Service traffic.
- Startup probe protects slow-starting containers before liveness/readiness begin.
- HPA changes replica count based on metrics. CPU-based HPA needs CPU requests and Metrics Server.

## 10. Kubernetes failures and debugging

- ImagePullBackOff or ErrImagePull: wrong image name/tag, unavailable registry or missing registry credentials.
- CrashLoopBackOff: container starts then exits repeatedly; inspect logs and configuration.
- Pending: scheduler cannot place Pod; check resources, node constraints, taints and PVC.
- ContainerCreating: wait/check events for image, storage, CNI or mount problems.
- Troubleshooting order: get → describe → logs → events → exec only when needed.
- Readiness failure removes traffic but does not necessarily restart the container.

## 11. Helm

- Helm is Kubernetes package management.
- Chart is a package of templates/defaults. Release is an installed instance of a chart.
- Chart.yaml stores chart metadata. values.yaml stores defaults. templates directory stores resource templates.
- Chart version is package version; appVersion is application version.
- helm template renders locally but does not install.
- Best workflow: lint → render → install/upgrade → verify → history/rollback if needed.
- helm upgrade --install upgrades a present release or installs a missing one.

## 12. GitHub Actions and DevSecOps

- Workflow files live in .github/workflows/NAME.yml.
- Workflow uses an event trigger, jobs, steps, a runner and actions/commands.
- uses runs reusable action; run executes shell command.
- Jobs run in parallel by default; needs creates job order/dependency.
- Runner is the machine executing a job, for example ubuntu-latest.
- Artifact is output saved from a workflow for later download/use.
- Secrets are supplied at runtime; never hard-code or print them.
- SAST scans source code without running it. SCA scans dependencies. DAST tests a running application.
- Secret scan finds exposed credentials. Container scan finds image-package vulnerabilities.
- SBOM is a component/dependency inventory.
- A security gate must pass before later pipeline jobs/deployment run.
- Least privilege means grant only required permissions.

## 13. Terraform and cloud

- Terraform is declarative Infrastructure as Code. It compares configuration with state and creates a plan.
- Provider connects Terraform to an API. Resource is managed infrastructure. Data source reads existing information.
- Variable makes configuration reusable; output exposes useful created values.
- State is Terraform's memory. Treat it as sensitive.
- Remote state plus locking supports safe teamwork.
- Safe lifecycle: fmt → init → validate → plan → review → apply → verify.
- Terraform drift means real infrastructure differs from intended configuration/state.
- Region is geographic area. Availability Zone is isolated location inside a Region.
- VPC is an isolated virtual network. Subnet is a CIDR range inside a VPC.
- Public subnet normally needs a 0.0.0.0/0 route to an Internet Gateway and an appropriate public address.
- Security Group is stateful and attached to network interfaces. Network ACL is subnet-level and stateless.
- EC2 is virtual compute. S3 is object storage.

## 14. Monitoring, observability and GitOps

- Metrics are numbers over time; logs are timestamped events; traces follow one request through services.
- Monitoring answers known health questions. Observability helps explain system behavior, including unknown problems.
- Prometheus pulls/scrapes metrics endpoints, stores time series, runs PromQL and evaluates alerts.
- Grafana visualizes Prometheus queries in dashboards.
- up = 1 means Prometheus successfully scraped target; up = 0 means it could not.
- app_health = 1 means application says it is ready; it is not identical to up.
- Alert lifecycle: inactive → pending during for duration → firing → resolved.
- GitOps uses Git as desired state and a controller to reconcile actual infrastructure.
- Argo CD is a Kubernetes GitOps controller.
- Drift means actual live state differs from Git desired state.
- selfHeal restores manual changes to Git state. prune removes resources no longer declared in Git.
- Synced/OutOfSync compare resources with Git. Healthy/Degraded describe resource health.

---

# Part 2 — Lab command workflows

## 15. Linux: files, permissions, processes and network

~~~bash
# Current location and file listing.
pwd
ls
ls -l
ls -la

# Navigation and creation.
cd DIRECTORY
cd ..
cd ~
mkdir -p project/app/logs
touch project/app/app.log

# Read, append and copy.
cat FILE
echo "text" >> FILE
cp SOURCE DESTINATION
cp -r SOURCE_DIRECTORY DESTINATION_DIRECTORY

# Permissions and ownership.
chmod +x script.sh
chmod 755 script.sh
ls -l script.sh
sudo chown USER:GROUP FILE
sudo chgrp GROUP FILE

# Search, resources, services and logs.
rg "PATTERN" PATH
ps aux
top
df -h
du -sh DIRECTORY
systemctl status SERVICE
journalctl -u SERVICE -n 50 --no-pager

# Network identity and checks.
ip addr
ip route
ping -c 4 HOST
nslookup DOMAIN
curl -I https://DOMAIN
ss -tulpn
~~~

## 16. Shell script pattern

~~~bash
#!/bin/bash
# Purpose: read one argument and show a small loop.

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 NAME" >&2
  exit 1
fi

name="$1"
echo "Hello, $name"
for item in one two three; do
  echo "Item: $item"
done
~~~

~~~bash
# Create, execute, validate syntax and trace execution.
touch script.sh
chmod +x script.sh
./script.sh Kaif
bash -n script.sh
bash -x script.sh
~~~

## 17. Git: safe workflow, branching and undo

~~~bash
# Inspect before changes.
git status
git diff

# Stage only intended files, commit and publish.
git add PATH/TO/FILE
git diff --staged
git commit -m "Describe the change"
git push origin main

# Clone and identify a repository.
git clone REPOSITORY_URL
cd REPOSITORY_DIRECTORY
git remote -v
git log --oneline --graph --decorate -n 10

# Branch workflow.
git switch -c feature-name
git push -u origin feature-name
git fetch origin
git pull origin main

# Merge after testing.
git switch main
git merge feature-name

# After manually fixing a conflict in FILE.
git add FILE
git commit

# Safe undo choices.
git restore FILE
git revert COMMIT_SHA
~~~

## 18. Docker: image, container, volume, network and Compose

~~~bash
# Engine and local inventory.
docker version
docker images
docker ps
docker ps -a

# Build and run an application. 8080 is host port; 80 is container port.
docker build -t myapp:1.0 .
docker run -d --name myapp -p 8080:80 myapp:1.0

# Inspect/debug a container.
docker logs myapp
docker logs -f myapp
docker exec -it myapp sh
docker inspect myapp
docker stop myapp
docker start myapp
docker rm myapp

# Named persistent volume.
docker volume create app-data
docker run --rm -v app-data:/data alpine sh -c "echo hello > /data/message"
docker run --rm -v app-data:/data alpine cat /data/message

# User-defined bridge network and name resolution.
docker network create app-net
docker run -d --name db --network app-net postgres:16
docker run --rm --network app-net alpine ping -c 1 db
docker network inspect app-net

# Compose lifecycle from the folder containing docker-compose.yml.
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
~~~

## 19. Docker multi-stage build

~~~dockerfile
# Builder has build tools.
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Final image has only required built files.
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
~~~

## 20. Kubernetes: inspect, apply and manage workloads

~~~bash
# Confirm cluster/context and list core objects.
kubectl config current-context
kubectl cluster-info
kubectl get nodes
kubectl get namespaces

# Apply/delete manifest and inspect namespace.
kubectl apply -f manifest.yaml
kubectl get all -n NAMESPACE
kubectl delete -f manifest.yaml

# Pod and Deployment inspection.
kubectl get pods -n NAMESPACE -o wide
kubectl describe pod POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE -c CONTAINER_NAME
kubectl logs POD_NAME -n NAMESPACE -p

# Deployment scale, rollout and rollback.
kubectl get deployment -n NAMESPACE
kubectl scale deployment APP --replicas=3 -n NAMESPACE
kubectl rollout status deployment/APP -n NAMESPACE
kubectl rollout history deployment/APP -n NAMESPACE
kubectl rollout undo deployment/APP -n NAMESPACE
kubectl exec -it POD_NAME -n NAMESPACE -- sh
~~~

## 21. Kubernetes: Service, DNS, ConfigMap, Secret and Ingress

~~~bash
# Service and endpoint checks.
kubectl apply -f service.yaml
kubectl get svc -n NAMESPACE
kubectl describe svc SERVICE_NAME -n NAMESPACE
kubectl get endpoints SERVICE_NAME -n NAMESPACE

# Local browser access to an internal Service. Keep terminal open.
kubectl port-forward svc/SERVICE_NAME 8080:80 -n NAMESPACE

# Test service DNS from a temporary Pod.
kubectl run dns-test --rm -it --restart=Never \
  --image=busybox:1.36 -n NAMESPACE -- nslookup SERVICE_NAME

# Create/read ConfigMap.
kubectl create configmap app-config \
  --from-literal=APP_ENV=production -n NAMESPACE
kubectl get configmap app-config -n NAMESPACE -o yaml

# Create/read Secret metadata. Do not expose real values.
kubectl create secret generic app-secret \
  --from-literal=DB_PASSWORD='VALUE' -n NAMESPACE
kubectl describe secret app-secret -n NAMESPACE

# Apply and inspect Ingress.
kubectl apply -f ingress.yaml
kubectl get ingress -n NAMESPACE
kubectl describe ingress INGRESS_NAME -n NAMESPACE
~~~

## 22. Kubernetes: storage, HPA and universal debugging

~~~bash
# Storage.
kubectl get storageclass
kubectl get pv
kubectl get pvc -n NAMESPACE
kubectl describe pvc CLAIM_NAME -n NAMESPACE

# Autoscaling and resource usage.
kubectl autoscale deployment APP --cpu-percent=50 --min=1 --max=5 -n NAMESPACE
kubectl get hpa -n NAMESPACE
kubectl describe hpa APP -n NAMESPACE
kubectl top nodes
kubectl top pods -n NAMESPACE

# Universal debugging order.
kubectl get pods,deploy,svc -n NAMESPACE
kubectl describe pod POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE -p
kubectl get events -n NAMESPACE --sort-by=.lastTimestamp
kubectl get endpoints SERVICE_NAME -n NAMESPACE
~~~

## 23. Helm: safe release workflow

~~~bash
# Create/lint/render a chart.
helm create my-chart
helm lint ./my-chart
helm template my-release ./my-chart -n NAMESPACE

# Install, inspect, upgrade and roll back.
helm install my-release ./my-chart -n NAMESPACE --create-namespace
helm list -n NAMESPACE
helm status my-release -n NAMESPACE
helm get values my-release -n NAMESPACE
helm upgrade --install my-release ./my-chart \
  -n NAMESPACE --set replicaCount=3
helm history my-release -n NAMESPACE
helm rollback my-release REVISION -n NAMESPACE
helm uninstall my-release -n NAMESPACE
~~~

## 24. GitHub Actions: minimal CI pipeline

Save as .github/workflows/ci.yml:

~~~yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Build only after tests pass"
~~~

## 25. DevSecOps: scan workflow

~~~bash
# Source-code security scan.
bandit -r . -ll

# Dependency scan.
pip-audit -r requirements.txt

# Secret scan with matches redacted.
gitleaks detect --no-git --redact

# Build and scan image; exit code 1 fails pipeline on high/critical issues.
docker build -t app:scan .
trivy image --severity HIGH,CRITICAL --exit-code 1 app:scan
~~~

## 26. Terraform and AWS: safe lifecycle

~~~bash
# Confirm account and Region before creating billable resources.
aws sts get-caller-identity
aws configure get region

# Terraform standard workflow.
terraform fmt -recursive
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan

# Inspect outputs and state.
terraform output
terraform output NAME
terraform state list
terraform state show RESOURCE_ADDRESS

# Cost-control cleanup: preview first, then destroy only confirmed resources.
terraform plan -destroy
terraform destroy
terraform state list

# Read-only cloud inventory.
aws ec2 describe-vpcs --region REGION
aws ec2 describe-subnets --region REGION
aws ec2 describe-route-tables --region REGION
aws ec2 describe-security-groups --region REGION
aws s3 ls
~~~

## 27. Prometheus, Grafana and Kubernetes evidence

~~~promql
# Prometheus reached target?
up{job="demo-app"}

# Application reports ready?
app_health{job="demo-app"}

# Traffic/error rate.
rate(app_requests_total{job="demo-app"}[1m])
rate(app_errors_total{job="demo-app"}[1m])

# CPU and memory.
rate(process_cpu_seconds_total{job="demo-app"}[1m])
process_resident_memory_bytes{job="demo-app"}
~~~

~~~bash
# Kubernetes evidence beside dashboards.
kubectl get pods -n NAMESPACE -o wide
kubectl logs deployment/APP -n NAMESPACE --tail=20
kubectl describe deployment/APP -n NAMESPACE
kubectl get events -n NAMESPACE --sort-by=.lastTimestamp
kubectl top pods -n NAMESPACE
~~~

## 28. GitOps and Argo CD

~~~bash
# Apply Argo CD Application once.
kubectl apply -f argocd-application.yaml

# Inspect Argo and managed resources.
kubectl get applications -n argocd
kubectl get deployment,pods,svc -n NAMESPACE

# Normal desired-state change: edit manifest, review, commit and push.
git diff
git add PATH/TO/MANIFEST.yaml
git commit -m "Describe desired state change"
git push

# Watch reconciliation.
kubectl get deployment -n NAMESPACE -w
~~~

---

# Part 3 — Final 10-minute memory table

| Do not confuse | Correct difference |
|---|---|
| Git / GitHub | version-control tool / hosted collaboration platform |
| image / container | blueprint / running instance |
| CMD / ENTRYPOINT | overridable default / primary executable |
| ARG / ENV | build-time variable / runtime environment value |
| volume / bind mount | Docker-managed storage / host-path mount |
| bridge / host network | isolated Docker network / shared host network |
| Pod / container | Kubernetes deployable unit / application package/process |
| Deployment / ReplicaSet | rollout manager / replica-count keeper |
| ClusterIP / NodePort / LoadBalancer | internal / node port / cloud external Service |
| ConfigMap / Secret | non-sensitive config / sensitive config |
| PV / PVC | available volume / request for a volume |
| liveness / readiness | restart decision / traffic decision |
| chart / release | Helm package / installed instance |
| CI / delivery / deployment | test-integrate / ready for approval / auto release |
| SAST / SCA / DAST | source scan / dependency scan / running-app test |
| Terraform plan / apply | preview / change infrastructure |
| Prometheus / Grafana | collect-query-store / visualize |
| monitoring / observability | known health check / explain behavior |
| desired / actual state | Git configuration / running reality |

## Commands to pause before using

Only use these when the question explicitly asks and the target is confirmed:

- rm -rf
- git reset --hard
- git push --force
- docker system prune -a
- kubectl delete
- terraform destroy
