# DevOps Configuration Template Reference

This is a reusable, interview-friendly reference for writing common DevOps files from scratch. It focuses on the **shape** of each file: what comes first, what is nested below it, why it is needed, and how to verify it.

Do not copy every example unchanged. Replace every value marked `CHANGE_ME`, use secrets safely, and verify before applying anything.

## How to use this guide

1. Identify the tool the task is asking for.
2. Start with that tool's skeleton, in the field order shown here.
3. Fill in names, ports, images, labels, and paths from the task.
4. Check indentation and matching values.
5. Run the matching validation command before deploying.

## YAML rules you must know

~~~yaml
# Mapping: key followed by its value
name: revision-tracker

# Nested mapping: two more spaces below the parent key
metadata:
  name: backend

# List: each item begins with a hyphen
containers:
  - name: backend
    image: ghcr.io/example/backend:1.0.0
~~~

- Use **spaces**, never tabs.
- In this guide, every nesting level uses **two spaces**.
- A `-` begins one list item.
- Alignment is not cosmetic in YAML: indentation changes meaning.
- Quote values containing special characters such as a port mapping: `"8080:80"`.

## The file-shape memory map

| Tool | Remember this order |
|---|---|
| Dockerfile | `FROM → WORKDIR → COPY dependency files → RUN → COPY source → ENV/USER → EXPOSE → CMD` |
| Compose | `services → each service configuration → top-level volumes → top-level networks` |
| Kubernetes | `apiVersion → kind → metadata → spec` |
| Deployment | `replicas → selector → template → containers` |
| Service | `type → selector → ports` |
| GitHub Actions | `name → on → permissions/env → jobs → runs-on → steps` |
| Terraform | `terraform/provider → variables → resources/data → outputs` |
| Helm | `Chart.yaml → values.yaml → templates/` |
| Argo CD | `source → destination → syncPolicy` |

---

# 1. Docker templates

## 1.1 .dockerignore

Keep files that are not needed by the build context out of the image build. This makes builds faster and reduces the chance of accidentally copying local secrets.

~~~text
# Version-control and editor files
.git
.gitignore
.DS_Store
.vscode

# Dependencies are installed inside the image
node_modules
.venv
__pycache__
*.pyc

# Local configuration and secrets
.env
.env.*
*.pem

# Test/build output when it is not required in the image
coverage
dist
build
~~~

## 1.2 Generic Python API Dockerfile

Use this for a FastAPI/Flask-style backend. The important optimisation is copying `requirements.txt` and installing dependencies **before** copying the rest of the code, so Docker can reuse that layer when only source code changes.

~~~dockerfile
# 1. Start from a small, maintained Python image
FROM python:3.12-slim

# 2. Python runtime behaviour
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Work inside this directory in later instructions
WORKDIR /app

# 4. Copy dependency list first so this layer can be cached
COPY requirements.txt .

# 5. Install dependencies during image build
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the application source code
COPY . .

# 7. Create and use a non-root runtime user
RUN useradd --create-home appuser \
    && chown -R appuser:appuser /app
USER appuser

# 8. Document the port used by the application
EXPOSE 8000

# 9. Start the application when a container is created
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
~~~

## 1.3 Generic Node frontend multi-stage Dockerfile

This pattern builds a frontend with Node, then serves only the final static files through Nginx. The final image does **not** include Node or development dependencies.

~~~dockerfile
# ----- Build stage -----
FROM node:22-alpine AS build

WORKDIR /app

# Copy dependency manifests first for efficient cache reuse
COPY package*.json ./
RUN npm ci

# Build the static frontend
COPY . .
RUN npm run build

# ----- Runtime stage -----
FROM nginx:1.27-alpine

# Copy only the build output from the first stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Keeps Nginx in the foreground so the container stays alive
CMD ["nginx", "-g", "daemon off;"]
~~~

## 1.4 Docker commands: build, run, inspect, clean

~~~bash
# Build from the Dockerfile in the current directory
docker build -t my-app:1.0.0 .

# Run in the background; host 8080 forwards to container 8000
docker run -d --name my-app -p 8080:8000 my-app:1.0.0

# Show running containers
docker ps

# Follow container logs
docker logs -f my-app

# Open a shell in a running container
docker exec -it my-app sh

# Inspect configuration, ports, mounts, and networking
docker inspect my-app

# Stop and remove only this named container
docker rm -f my-app
~~~

**Interview traps**

- `RUN` executes while the image is built; `CMD` is the default runtime command.
- `EXPOSE` documents a container port. It does **not** publish it to your laptop.
- `-p 8080:8000` is what publishes host port 8080 to container port 8000.
- Use `ENTRYPOINT` when the main executable should be fixed; use `CMD` for a default command/arguments that users may override.

---

# 2. Docker Compose templates

## 2.1 .env.example

Do not commit a real `.env` file with credentials. Commit an example instead.

~~~dotenv
POSTGRES_DB=appdb
POSTGRES_USER=appuser
POSTGRES_PASSWORD=CHANGE_ME
BACKEND_IMAGE=example/backend:latest
FRONTEND_IMAGE=example/frontend:latest
~~~

## 2.2 Full frontend + backend + PostgreSQL Compose template

Compose resolves service names through its network. Therefore the backend connects to PostgreSQL using host `db`, **not** `localhost`.

~~~yaml
# compose.yaml
services:
  # Static frontend served from a container
  frontend:
    image: ${FRONTEND_IMAGE}
    # Or build locally instead:
    # build: ./frontend
    ports:
      - "8080:80"             # host:container
    depends_on:
      - backend
    networks:
      - app-network

  # API service
  backend:
    image: ${BACKEND_IMAGE}
    # Or build locally instead:
    # build: ./backend
    environment:
      # Inside Compose, db is the database service hostname.
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app-network

  # Database service with persistent data
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

# Named volumes persist data beyond a container restart/recreation.
volumes:
  postgres-data:

# A named bridge network lets containers reach each other by service name.
networks:
  app-network:
    driver: bridge
~~~

## 2.3 Compose commands

~~~bash
# Validate and show the fully resolved Compose configuration
docker compose config

# Build images and start the stack in the background
docker compose up -d --build

# View service status
docker compose ps

# Follow one service's logs
docker compose logs -f backend

# Run a command inside the backend service
docker compose exec backend sh

# Stop and remove containers/networks. Named volumes remain by default.
docker compose down

# Also remove Compose-managed named volumes — destructive for database data.
docker compose down -v
~~~

---

# 3. Kubernetes templates

Every Kubernetes manifest begins with:

~~~yaml
apiVersion: CHANGE_ME
kind: CHANGE_ME
metadata:
  name: CHANGE_ME
spec:
  # Resource-specific desired state goes here
~~~

## 3.1 Namespace

~~~yaml
apiVersion: v1
kind: Namespace
metadata:
  name: revision-tracker
~~~

## 3.2 ConfigMap

Use a ConfigMap for non-sensitive configuration.

~~~yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: revision-tracker
data:
  APP_ENV: production
  LOG_LEVEL: info
  # Never put passwords, API keys, or tokens in a ConfigMap.
~~~

## 3.3 Secret

Use a Secret for sensitive values. `stringData` accepts normal text and is converted by Kubernetes; base64 in `data` is encoding, **not encryption**.

~~~yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: revision-tracker
type: Opaque
stringData:
  DATABASE_URL: postgresql://appuser:CHANGE_ME@postgres:5432/appdb
~~~

## 3.4 Deployment: the core app workload template

The **selector labels** and the **Pod template labels** must be identical. A Service will use those same labels to find the Pods.

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: revision-tracker
  labels:
    app: backend

spec:
  replicas: 2

  # The Deployment manages Pods whose label is app: backend.
  selector:
    matchLabels:
      app: backend

  # This section defines the Pods that the Deployment creates.
  template:
    metadata:
      labels:
        app: backend            # Must match selector.matchLabels above.
    spec:
      containers:
        - name: backend
          image: ghcr.io/CHANGE_ME/backend:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 8000
          envFrom:
            - configMapRef:
                name: app-config
            - secretRef:
                name: database-secret
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 15
            periodSeconds: 20
~~~

## 3.5 Service: stable networking for Pods

The Service selector must match the Pod label `app: backend` from the Deployment.

~~~yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: revision-tracker
spec:
  type: ClusterIP             # Cluster-internal by default
  selector:
    app: backend              # Must match the Pod labels
  ports:
    - name: http
      protocol: TCP
      port: 8000              # Service port
      targetPort: http        # Named container port; could also be 8000
~~~

### NodePort alternative for a local lab

~~~yaml
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
      nodePort: 30080         # Optional; normally 30000–32767
~~~

Use a ClusterIP Service behind Ingress for normal web applications. NodePort is useful for simple local exercises but is rarely the public-production entry point.

## 3.6 Ingress: HTTP routing into the cluster

The Ingress controller (for example, NGINX Ingress) must already be installed.

~~~yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: revision-tracker
  namespace: revision-tracker
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  rules:
    - host: revision-tracker.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8000
~~~

### Local host entry

For a local cluster, resolve the Ingress host to the cluster's IP. With Minikube and an Ingress addon, you may use the tunnel command in a separate terminal instead.

~~~bash
# Obtain the Minikube IP
minikube ip

# Example only: replace the IP with the value from the command above.
sudo sh -c 'echo "192.168.49.2 revision-tracker.local" >> /etc/hosts'

# Alternative when Minikube tells you to use a tunnel:
minikube tunnel
~~~

## 3.7 PersistentVolumeClaim (PVC)

Applications request storage through a PVC. The cluster's StorageClass dynamically provisions a PersistentVolume when supported.

~~~yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: revision-tracker
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  # Optional when your cluster has a default StorageClass:
  # storageClassName: standard
~~~

### Mount the PVC in a Deployment

~~~yaml
spec:
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-data
          persistentVolumeClaim:
            claimName: postgres-data
~~~

## 3.8 HorizontalPodAutoscaler (HPA)

CPU-based HPA requires CPU requests in the target Deployment.

~~~yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend
  namespace: revision-tracker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
~~~

## 3.9 Kubernetes commands: safe creation and diagnosis order

~~~bash
# Check YAML syntax/client-side object validation without changing the cluster
kubectl apply --dry-run=client -f manifests/

# Show the proposed difference from the live cluster
kubectl diff -f manifests/

# Create or update resources
kubectl apply -f manifests/

# Check everything in the app namespace
kubectl get all -n revision-tracker

# Read events and object details when something is wrong
kubectl describe deployment backend -n revision-tracker
kubectl describe pod POD_NAME -n revision-tracker

# See the current and previous container logs
kubectl logs POD_NAME -n revision-tracker
kubectl logs POD_NAME -n revision-tracker --previous

# Open a shell in a selected running container
kubectl exec -it POD_NAME -n revision-tracker -- sh

# Watch rollout progress after an image or config change
kubectl rollout status deployment/backend -n revision-tracker
kubectl rollout history deployment/backend -n revision-tracker

# Access a ClusterIP Service locally without exposing it permanently
kubectl port-forward -n revision-tracker svc/backend 8000:8000
~~~

### Kubernetes troubleshooting map

| Symptom | First checks |
|---|---|
| `Pending` Pod | `kubectl describe pod`; look for scheduling, PVC, or resource events |
| `ImagePullBackOff` | Verify image name/tag and registry credentials |
| `CrashLoopBackOff` | Read `kubectl logs` and `kubectl logs --previous` |
| Service has no endpoints | Check Service selector and Pod labels are identical |
| Ingress returns 404/502 | Check Ingress backend Service name/port, Service endpoints, controller logs |
| HPA target is `<unknown>` | Verify Metrics Server and CPU requests |

---

# 4. Helm templates

Helm packages Kubernetes YAML into a chart. The normal chart layout is:

~~~text
my-chart/
├── Chart.yaml               # Chart metadata
├── values.yaml              # Default values
└── templates/               # Parameterised Kubernetes manifests
    ├── deployment.yaml
    └── service.yaml
~~~

## 4.1 Chart.yaml

~~~yaml
apiVersion: v2
name: my-app
description: A Helm chart for my application
type: application
version: 0.1.0               # Chart version
appVersion: "1.0.0"          # Application version
~~~

## 4.2 values.yaml

~~~yaml
replicaCount: 2

image:
  repository: ghcr.io/CHANGE_ME/my-app
  tag: "1.0.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 8000

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
~~~

## 4.3 templates/deployment.yaml

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}
  labels:
    app: {{ .Release.Name }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
          resources:
{{ toYaml .Values.resources | indent 12 }}
~~~

## 4.4 templates/service.yaml

~~~yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Release.Name }}
  ports:
    - name: http
      port: {{ .Values.service.port }}
      targetPort: http
~~~

## 4.5 Helm commands

~~~bash
# Check chart structure and common mistakes
helm lint ./my-chart

# Render Kubernetes YAML locally; nothing is deployed
helm template my-release ./my-chart

# Install, or upgrade if the release already exists
helm upgrade --install my-release ./my-chart \
  --namespace revision-tracker \
  --create-namespace

# View installed releases and rendered values
helm list -n revision-tracker
helm get values my-release -n revision-tracker
helm get manifest my-release -n revision-tracker

# Remove a Helm release
helm uninstall my-release -n revision-tracker
~~~

**Memory rule:** Helm keeps YAML structure; it replaces repeated values with `{{ .Values... }}` expressions.

---

# 5. GitHub Actions CI/CD templates

## 5.1 Small test-only workflow

Save as `.github/workflows/ci.yml`.

~~~yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Minimum permission by default.
permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r backend/requirements.txt

      - name: Run tests
        run: pytest backend/tests
~~~

## 5.2 Build, scan, and push a container image

This uses GitHub Container Registry (GHCR). It pushes on `main`; pull requests build and scan but do not publish.

~~~yaml
name: Build, Scan, and Publish

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  packages: write

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ghcr.io/${{ github.repository_owner }}/my-app

jobs:
  build-scan-push:
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository code
        uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        if: github.event_name == 'push'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build image
        run: docker build -t ${{ env.IMAGE_NAME }}:${{ github.sha }} ./backend

      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: ${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: table
          exit-code: "1"
          severity: HIGH,CRITICAL
          ignore-unfixed: true

      - name: Push immutable commit tag
        if: github.event_name == 'push'
        run: docker push ${{ env.IMAGE_NAME }}:${{ github.sha }}

      - name: Push latest tag
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        run: |
          docker tag ${{ env.IMAGE_NAME }}:${{ github.sha }} ${{ env.IMAGE_NAME }}:latest
          docker push ${{ env.IMAGE_NAME }}:latest
~~~

## 5.3 GitHub Actions reading order

~~~text
workflow
└── jobs
    └── job id
        ├── runs-on
        ├── needs (optional: job dependencies)
        └── steps
            ├── uses (reusable action)
            └── run (shell command)
~~~

**Important:** repository secrets belong in GitHub **Settings → Secrets and variables → Actions**. Never hard-code passwords, tokens, or cloud keys in workflow YAML.

---

# 6. Terraform templates

Terraform is HCL, not YAML. Keep files small by responsibility:

~~~text
infrastructure/
├── versions.tf      # Terraform/provider requirements
├── variables.tf     # Inputs
├── main.tf          # Resources
├── outputs.tf       # Useful result values
└── terraform.tfvars # Local values; do not commit secrets
~~~

## 6.1 versions.tf

~~~hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
~~~

## 6.2 variables.tf

~~~hcl
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Short name used in resource tags and names"
  type        = string
  default     = "my-project"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "allowed_ssh_cidr" {
  description = "Public CIDR permitted to use SSH; do not use 0.0.0.0/0 in production"
  type        = string
  default     = "203.0.113.10/32"
}
~~~

## 6.3 main.tf: safe S3 bucket starter

~~~hcl
resource "aws_s3_bucket" "app_assets" {
  bucket = "${var.project_name}-assets-CHANGE_ME"

  tags = {
    Name        = "${var.project_name}-assets"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# Prevent accidental public access through bucket policy/ACL settings.
resource "aws_s3_bucket_public_access_block" "app_assets" {
  bucket = aws_s3_bucket.app_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
~~~

## 6.4 vpc.tf: minimal VPC shape

This is a **structure reference**, not a complete production network. A production VPC normally has multiple Availability Zones, separate public/private subnets, NAT design, routes, and restricted security groups.

~~~hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "${var.project_name}-public-a"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}
~~~

## 6.5 outputs.tf

~~~hcl
output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.app_assets.bucket
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}
~~~

## 6.6 Terraform workflow

~~~bash
# Format every .tf file in the current folder
terraform fmt

# Download provider plugins and initialise the working directory
terraform init

# Check configuration correctness without changing cloud resources
terraform validate

# Preview the exact changes
terraform plan -out=tfplan

# Apply the already-reviewed plan
terraform apply tfplan

# Review managed resources and outputs
terraform state list
terraform output

# Preview removal first; destroy only confirmed resources
terraform plan -destroy
terraform destroy
~~~

**Safety rule:** a successful `terraform apply` can create billable cloud infrastructure. Always read the plan before applying, and use `terraform destroy` only after confirming the exact workspace, account, and target.

---

# 7. Prometheus and alerting templates

## 7.1 prometheus.yml

~~~yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - alert-rules.yml

scrape_configs:
  - job_name: backend
    metrics_path: /metrics
    static_configs:
      # Docker Compose example: service name and container port
      - targets: ["backend:8000"]
~~~

In Kubernetes, Prometheus is often configured through a `ServiceMonitor` instead of static targets.

## 7.2 PrometheusRule template for Kubernetes

~~~yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: app-alerts
  namespace: monitoring
spec:
  groups:
    - name: application.rules
      rules:
        - alert: BackendDown
          expr: up{job="backend"} == 0
          for: 2m
          labels:
            severity: critical
          annotations:
            summary: Backend target is down
            description: Prometheus has not scraped a healthy backend target for 2 minutes.

        - alert: BackendHighMemory
          expr: container_memory_working_set_bytes{container="backend"} > 500 * 1024 * 1024
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: Backend memory is high
            description: Backend memory has exceeded 500 MiB for 5 minutes.
~~~

## 7.3 Essential PromQL patterns

~~~promql
# Is every target currently reachable? 1 = up, 0 = down
up

# Requests per second over the last 5 minutes
sum(rate(http_requests_total[5m]))

# HTTP 5xx percentage over the last 5 minutes
100 *
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))

# Container memory in MiB
container_memory_working_set_bytes{container="backend"} / 1024 / 1024
~~~

---

# 8. Argo CD GitOps template

An Argo CD Application watches a folder in Git and reconciles that desired state to Kubernetes.

~~~yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: revision-tracker
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/CHANGE_ME/REPOSITORY.git
    targetRevision: main
    path: k8s                 # Git folder containing manifests or a Helm chart

  destination:
    server: https://kubernetes.default.svc
    namespace: revision-tracker

  syncPolicy:
    automated:
      prune: true             # Remove resources deleted from Git
      selfHeal: true          # Correct manual drift in the cluster
    syncOptions:
      - CreateNamespace=true
~~~

~~~bash
# Create/update the Argo CD Application object once
kubectl apply -f argocd/application.yaml

# Observe Argo CD's Application resource from Kubernetes
kubectl get applications -n argocd
kubectl describe application revision-tracker -n argocd
~~~

**GitOps flow:** change manifests/values in Git → commit and push → Argo CD detects the desired state → Argo CD synchronises Kubernetes. Avoid manually applying the same GitOps-managed resources because that creates drift.

---

# 9. Complete command one-shot reference

## Git

~~~bash
# View repository state before changing anything
git status

# Create a focused feature branch
git switch -c feature/short-description

# Review changes before staging
git diff

# Stage only intentional files
git add path/to/file

# Create a descriptive commit
git commit -m "docs: add deployment templates"

# Push the current branch and set tracking
git push -u origin feature/short-description

# Update local view of remotes, then compare safely
git fetch origin
git log --oneline --decorate --graph --all
~~~

## Docker

~~~bash
docker build -t app:tag .
docker run -d --name app -p 8080:8000 app:tag
docker ps
docker logs -f app
docker exec -it app sh
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs -f SERVICE
docker compose down
~~~

## Kubernetes

~~~bash
kubectl config current-context
kubectl get namespaces
kubectl apply --dry-run=client -f FILE_OR_DIRECTORY
kubectl diff -f FILE_OR_DIRECTORY
kubectl apply -f FILE_OR_DIRECTORY
kubectl get all -n NAMESPACE
kubectl get pods -n NAMESPACE -w
kubectl describe POD_OR_RESOURCE NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE --previous
kubectl exec -it POD_NAME -n NAMESPACE -- sh
kubectl rollout status deployment/DEPLOYMENT_NAME -n NAMESPACE
kubectl port-forward -n NAMESPACE svc/SERVICE_NAME LOCAL_PORT:SERVICE_PORT
~~~

## Helm

~~~bash
helm lint ./chart
helm template RELEASE_NAME ./chart
helm upgrade --install RELEASE_NAME ./chart --namespace NAMESPACE --create-namespace
helm list -n NAMESPACE
helm get values RELEASE_NAME -n NAMESPACE
helm get manifest RELEASE_NAME -n NAMESPACE
~~~

## Terraform

~~~bash
terraform fmt
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform state list
terraform output
terraform plan -destroy
~~~

---

# 10. A practical pre-deployment checklist

## Before building a container

- [ ] A `.dockerignore` excludes secrets, Git metadata, and local dependency folders.
- [ ] The image has a clear tag, not only `latest`.
- [ ] The application listens on `0.0.0.0` inside the container when it must receive external traffic.
- [ ] The container runs as non-root where practical.

## Before starting Compose

- [ ] `docker compose config` renders the expected values.
- [ ] `.env` is ignored by Git and has no placeholder production password.
- [ ] Database data has a named volume.
- [ ] Inter-service URLs use Compose service names, not `localhost`.

## Before applying Kubernetes YAML

- [ ] Namespaces, names, image tags, and ports are correct.
- [ ] Deployment `selector.matchLabels` exactly matches Pod template labels.
- [ ] Service selector exactly matches Pod labels.
- [ ] `targetPort` points to the actual container port/name.
- [ ] Secrets are not committed with real values.
- [ ] `kubectl apply --dry-run=client` and `kubectl diff` are reviewed.

## Before running Terraform apply

- [ ] Correct cloud account, region, and workspace are selected.
- [ ] `terraform fmt` and `terraform validate` pass.
- [ ] The plan contains only expected resources and changes.
- [ ] Tags, public access, security group rules, and estimated cost are reviewed.
- [ ] You know how to safely clean up the environment after the task.

---

# 11. What interviewers often test

| Question | Clear answer |
|---|---|
| Why is the Dockerfile ordered this way? | Copy dependency manifests and install first so dependency layers are cached; copy frequently changing source later. |
| What is the difference between `EXPOSE` and `-p`? | `EXPOSE` documents an image port; `-p` publishes a container port to the host. |
| Why use a named Docker volume? | It persists data beyond a single container's lifecycle. |
| How does a Kubernetes Service find Pods? | Its selector matches labels on the target Pods. |
| Deployment versus Pod? | A Pod runs containers; a Deployment maintains the desired number of replica Pods and manages rollouts. |
| ConfigMap versus Secret? | ConfigMap holds non-sensitive config; Secret is intended for sensitive data, though it still needs encryption/access controls. |
| Readiness versus liveness probe? | Readiness controls whether a Pod receives traffic; liveness decides whether Kubernetes should restart a stuck container. |
| Why use Helm? | It parameterises and packages Kubernetes manifests for repeatable releases. |
| Why use Terraform? | It provides version-controlled, reviewable, repeatable infrastructure provisioning. |
| `plan` versus `apply`? | `plan` previews proposed changes; `apply` executes them. |
| What is GitOps? | Git is the desired-state source of truth; a controller such as Argo CD reconciles the cluster to it. |

## Final memory card

~~~text
Dockerfile: FROM → WORKDIR → COPY dependencies → RUN → COPY app → CMD
Compose: services → image/build → ports → env → volumes → networks
Kubernetes: apiVersion → kind → metadata → spec
Deployment: replicas → selector = template labels → containers
Service: selector matches Pod labels → port → targetPort
Actions: name → on → jobs → runs-on → steps → uses/run
Terraform: provider → variables → resources → outputs → init/plan/apply
Helm: Chart.yaml → values.yaml → templates
GitOps: Git change → push → Argo CD syncs cluster
~~~

The goal is not to memorise every option. Memorise the **file shape**, the **connections** between fields (especially labels and ports), and the **safe validation command** for each tool.
