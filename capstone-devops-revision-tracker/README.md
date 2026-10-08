# DevOps Revision Tracker

**Author:** MD Kaif Molla

DevOps Revision Tracker is a three-tier Python application for organizing difficult exam topics and tracking revision progress. A student can create a topic, assign its category and priority, move it through revision stages, and delete it after completion.

The application domain is original, while its DevOps architecture follows the tools taught during the course.

## Features

- Create, view, update, and delete revision topics
- Categorize topics as Kubernetes, Docker, CI/CD, Terraform, Monitoring, or Linux
- Assign LOW, MEDIUM, or HIGH priority
- Track NOT_STARTED, IN_PROGRESS, and COMPLETED status
- View live revision statistics
- Check application health and database readiness
- Expose Prometheus metrics
- Run locally, in Docker Compose, or in Kubernetes

## Architecture

```text
Developer
   |
   v
Git and GitHub
   |
   v
GitHub Actions
   |-- Pytest
   |-- Frontend build
   |-- Docker image build
   |-- Trivy security scan
   |-- Push SHA-tagged images to GHCR
   `-- Deploy with Helm to kind
                 |
                 v
          Kubernetes Ingress
              /       \api
             v          v
      React + Nginx   FastAPI
                          |
                          v
                     PostgreSQL
                          |
                          v
                 Prometheus + Grafana
```

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Nginx |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | PostgreSQL, Alembic migrations |
| Testing | Pytest, FastAPI TestClient, SQLite test database |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions, GHCR |
| Security | Trivy |
| Infrastructure | Terraform, AWS VPC, EKS |
| Orchestration | Kubernetes, Helm, Ingress, HPA |
| Observability | Prometheus, Grafana, ServiceMonitor |
| GitOps | Argo CD continuous reconciliation |

## Repository structure

```text
capstone-devops-revision-tracker/
├── backend/                 # FastAPI, database model, migration and tests
├── frontend/                # React UI and Nginx configuration
├── docker-compose.yml       # Local three-service stack
├── terraform/              # AWS VPC and EKS configuration
├── k8s/                    # Namespace manifest
├── helm/revision-tracker/  # Kubernetes application package
├── monitoring/             # Prometheus values and Grafana dashboard
├── argocd/                 # Declarative Argo CD Application
├── troubleshooting/        # Deliberately broken Kubernetes manifests
├── docs/                   # Project plan and revision notes
└── screenshots/            # Submission evidence
```

## REST API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API information |
| GET | `/health` | Liveness check |
| GET | `/ready` | Database readiness check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/docs` | Swagger API documentation |
| GET | `/api/topics` | List topics |
| GET | `/api/topics/{id}` | Read one topic |
| POST | `/api/topics` | Create a topic |
| PUT | `/api/topics/{id}` | Update a topic |
| DELETE | `/api/topics/{id}` | Delete a topic |
| GET | `/api/topics/stats` | Revision statistics |

## Run automated tests

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

The test suite uses SQLite, not the production PostgreSQL database. Tests form the first CI quality gate so broken code is never promoted as an image.

## Run with Docker Compose

From the project root:

```bash
docker compose up --build -d
docker compose ps
```

Open:

- Frontend: `http://localhost:3000`
- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`
- Readiness: `http://localhost:8000/ready`
- Metrics: `http://localhost:8000/metrics`

If port 3000 is already used by Grafana:

```bash
FRONTEND_PORT=3001 docker compose up -d frontend
```

Stop the application:

```bash
docker compose down
```

Delete the PostgreSQL volume as well:

```bash
docker compose down -v
```

## CI/CD pipeline

The root workflow `.github/workflows/capstone-ci-cd.yml` runs on every capstone change pushed to `main`:

1. Install Python dependencies
2. Run Pytest
3. Install frontend dependencies
4. Build the React frontend
5. Build frontend and backend images
6. Scan both images using Trivy
7. Fail on HIGH or CRITICAL fixed vulnerabilities
8. Push both images to GHCR using the Git commit SHA as the tag
9. Create a kind testing cluster
10. Deploy the images using Helm
11. Verify PostgreSQL, backend, and frontend rollouts

No Docker Hub password or personal access token is stored. The workflow uses the temporary GitHub-provided token.

## Terraform

The Terraform configuration defines an AWS VPC, two public subnets, two private subnets, a NAT gateway, an EKS cluster, and a managed worker node group.

```bash
cd terraform
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

Only run the next commands with valid classroom AWS credentials and after checking the expected cost:

```bash
terraform apply
terraform destroy
```

Never commit AWS credentials, `terraform.tfvars`, Terraform state, or `.terraform/`.

## Kubernetes and Helm

Apply the namespace:

```bash
kubectl apply -f k8s/namespace.yaml
```

Deploy published images:

```bash
helm upgrade --install revision helm/revision-tracker \
  --namespace revision-tracker \
  --set backend.tag=<GIT_COMMIT_SHA> \
  --set frontend.tag=<GIT_COMMIT_SHA>
```

Verify:

```bash
kubectl get pods -n revision-tracker
kubectl get svc -n revision-tracker
kubectl get hpa -n revision-tracker
helm list -n revision-tracker
```

The chart creates:

- Two frontend replicas
- Two backend replicas
- One PostgreSQL replica with a PVC
- ClusterIP Services
- Liveness and readiness probes
- Optional Nginx Ingress
- Backend HPA
- Optional Prometheus ServiceMonitor

## Monitoring and observability

The backend `/metrics` endpoint returns Prometheus-formatted metrics. The Helm ServiceMonitor connects Prometheus to both backend replicas. Grafana displays application health, request rate, CPU, memory, p95 latency, and HTTP status codes. Prometheus rules demonstrate alerting, while Kubernetes application logs demonstrate event-level diagnosis.

See [monitoring/README.md](monitoring/README.md) for the exact commands.

See [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md) for the three pillars—metrics, logs, and traces—why observability is required, common tooling, and Kubernetes-specific practices.

## GitOps with Argo CD

Git is the source of truth for the Helm chart. The declarative Argo CD `Application` continuously compares Git with the cluster and uses automated synchronization, pruning, and self-healing to correct drift.

```bash
kubectl apply -f argocd/application.yaml
kubectl get applications -n argocd
```

The verified demo reports `revision-tracker` as both `Synced` and `Healthy`. See [argocd/README.md](argocd/README.md) for the complete workflow and installation commands.

## Troubleshooting

The project includes deliberate `ImagePullBackOff` and empty-Service-endpoint exercises. See [troubleshooting/README.md](troubleshooting/README.md).

Golden flow:

```text
kubectl get
  -> kubectl describe
  -> kubectl get events
  -> kubectl logs
  -> kubectl logs --previous
  -> kubectl exec
  -> check Service selectors/endpoints
  -> fix and verify
```

## Security decisions

- Containers run as non-root users.
- `.env`, virtual environments, Node modules, Terraform state, and credentials are ignored.
- CI scans both runtime images with Trivy.
- Images use immutable commit-SHA tags instead of `latest` in CI.
- Kubernetes database credentials are stored in a Secret rather than a Deployment.
- CPU and memory requests/limits are defined.

The initial findings and remediation are documented in [docs/SECURITY_SCAN.md](docs/SECURITY_SCAN.md). Both rebuilt runtime images currently pass the configured Trivy HIGH/CRITICAL gate with zero fixed findings.

## Evidence and submission

The final evidence checklist is in [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md). All screenshots below were captured from the verified local or GitHub run. The Argo CD password screenshot is intentionally excluded because credentials must never be published.

The presentation deck is available at [presentation/devops-revision-tracker-capstone-final.pptx](presentation/devops-revision-tracker-capstone-final.pptx).

### Successful CI/CD pipeline

The GitHub Actions workflow completed the automated tests, built and security-scanned both container images, published the images to GHCR, and verified the Helm deployment on a kind cluster.

![Successful GitHub Actions pipeline](screenshots/07-github-actions-success.png)

<details>
<summary><strong>Complete evidence gallery — 23 screenshots</strong></summary>

### 01 — Application dashboard

![RevisionOS application dashboard](screenshots/01-application-dashboard.png)

### 02 — Swagger API documentation

![FastAPI Swagger documentation](screenshots/02-api-documentation.png)

### 03 — Application health

![Application health endpoint](screenshots/03-application-health.png)

### 04 — Raw Prometheus metrics

![Prometheus metrics endpoint](screenshots/04-prometheus-metrics.png)

### 05 — Automated tests

![Nine passing Pytest tests](screenshots/05-pytest-results.png)

### 06 — Docker Compose services

![Docker containers running](screenshots/06-docker-containers.png)

### 07 — GitHub Actions pipeline

![Successful GitHub Actions pipeline](screenshots/07-github-actions-success.png)

### 08 — Kubernetes pods

![Kubernetes application pods](screenshots/08-kubernetes-pods.png)

### 09 — Kubernetes resources and HPA

![Kubernetes deployments services and HPA](screenshots/09-kubernetes-resources.png)

### 10 — Helm release

![Helm release deployed](screenshots/10-helm-release.png)

### 11 — Terraform validation

![Terraform initialized and validated](screenshots/11-terraform-validation.png)

### 12 — Monitoring stack pods

![Prometheus Grafana and Alertmanager pods](screenshots/12-monitoring-stack-pods.png)

### 13 — Prometheus Kubernetes targets

![Prometheus target overview](screenshots/13-prometheus-targets.png)

### 14 — Grafana available

![Grafana home screen](screenshots/14-grafana-home.png)

### 15 — Application targets UP

![Both backend replicas scraped by Prometheus](screenshots/15-prometheus-application-target.png)

### 16 — Prometheus query

![Application HTTP request metric](screenshots/16-prometheus-query.png)

### 17 — Grafana monitoring dashboard

![Application health CPU memory latency and request metrics](screenshots/17-grafana-dashboard.png)

### 18 — Alert rules created

![PrometheusRule created in Kubernetes](screenshots/18-alert-rule-created.png)

### 19 — Application alert rules

![Backend-down and high-memory alert rules](screenshots/19-prometheus-alert-rules.png)

### 20 — Kubernetes application logs

![Backend health readiness and metrics logs](screenshots/20-kubernetes-application-logs.png)

### 21 — Argo CD components

![Argo CD pods](screenshots/21-argocd-pods.png)

### 22 — GitOps reconciliation status

![Argo CD application synced and healthy](screenshots/22-argocd-synced-healthy.png)

### 23 — Argo CD dashboard

![Argo CD dashboard showing Healthy and Synced](screenshots/23-argocd-dashboard.png)

</details>

## Author

**MD Kaif Molla**

Built as the final DevOps capstone project for the Scaler School of Technology DevOps & Cloud course.
