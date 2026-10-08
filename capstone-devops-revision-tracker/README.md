# DevOps Revision Tracker

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

## Monitoring

The backend `/metrics` endpoint returns Prometheus-formatted metrics. The Helm ServiceMonitor connects Prometheus to the backend Service, and the Grafana dashboard displays request rate, latency, and HTTP status codes.

See [monitoring/README.md](monitoring/README.md) for the exact commands.

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

The final evidence checklist is in [docs/SUBMISSION_CHECKLIST.md](docs/SUBMISSION_CHECKLIST.md). Screenshots will be embedded here after the final pipeline and monitoring demonstration.

## Author

Built as the final DevOps capstone project for the Scaler School of Technology DevOps & Cloud course.
