# Session 21: Final End-to-End DevOps Project — Homework

> **Status:** Work in progress — the project source is present; cloud execution, pipeline evidence, monitoring evidence, and screenshots must be completed before submission.

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

## Project Overview

TaskBoard is a full-stack project used to demonstrate the complete DevOps delivery lifecycle. It contains a React frontend, FastAPI backend, PostgreSQL database, automated tests, Docker packaging, GitHub Actions, security scanning, Terraform AWS infrastructure, Kubernetes, Helm, monitoring, GitOps concepts, and intentionally broken resources for troubleshooting practice.

The complete implementation and detailed operating guide are in the [Session 21 project README](../../README.md).

## End-to-End Flow

```text
Application code
      |
Git and GitHub
      |
GitHub Actions CI
      |
Build and unit tests
      |
SAST + SCA + secret scanning
      |
Docker image build
      |
Trivy image gate
      |
GitHub Container Registry
      |
Terraform-provisioned AWS infrastructure
      |
Kubernetes / Helm deployment
      |
Prometheus and Grafana
      |
GitOps reconciliation
```

## Architecture

```text
                             GitHub
                       source + workflows
                              |
                    build / test / scan
                              |
                             GHCR
                              |
Internet --> Ingress --> Frontend Service --> React/Nginx Pods
                 |
                 +------> Backend Service --> FastAPI Pods
                                             |
                                             v
                                         PostgreSQL

Terraform --> AWS VPC + Kubernetes infrastructure
Git -------> GitOps controller -------> desired cluster state
Prometheus <------ /metrics + cluster metrics ------ workloads
Grafana    <------ Prometheus
```

## Technologies Used

| Category | Technologies |
|---|---|
| Frontend | React, Vite, Nginx |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Pytest |
| Data | PostgreSQL and persistent storage |
| Containers | Docker and Docker Compose |
| CI/CD | GitHub Actions and GHCR |
| Security | SAST, SCA, secret scanning, Trivy, security gates |
| Infrastructure | Terraform and AWS |
| Platform | Kubernetes, Ingress, HPA, probes, ConfigMap, Secret |
| Packaging | Helm |
| Observability | Prometheus, Grafana, logs, health endpoints |
| GitOps | Git as source of truth and continuous reconciliation |

## Project Structure

```text
session21-python/
├── backend/                 # FastAPI, tests, and migrations
├── frontend/                # React/Vite application
├── .github/workflows/       # CI/CD pipeline
├── docker-compose.yml       # local full stack
├── k8s/                     # Kubernetes bootstrap manifests
├── helm/taskboard/          # Helm chart
├── terraform/               # AWS infrastructure
├── monitoring/              # monitoring configuration
├── troubleshooting/         # intentionally broken manifests
├── scripts/                 # helper scripts
└── README.md                # full project guide
```

## Application Setup

Run the full local stack:

```bash
cd session21-python
docker compose up --build
```

Verify the frontend, API, health, and metrics using the ports listed in the main project README:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/ready
curl http://localhost:8000/metrics
```

Run backend tests:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -v
```

Cleanup:

```bash
docker compose down
```

## Docker Setup

```bash
docker build -t taskboard-backend:local ./backend
docker build -t taskboard-frontend:local ./frontend
docker image ls | grep taskboard
```

Use immutable commit-SHA tags in CI. Do not promote an image that has not passed tests and security gates.

## Kubernetes Deployment

The final Kubernetes workload must demonstrate:

- Deployment and Service.
- ConfigMap and Secret.
- Ingress routing.
- Horizontal Pod Autoscaler.
- Startup, readiness, and liveness probes as appropriate.
- Persistent storage for PostgreSQL when it runs inside the cluster.
- Resource requests and limits.

Verify a deployment with:

```bash
kubectl apply -f k8s/
kubectl get all -n taskboard
kubectl get ingress,configmap,secret,pvc,hpa -n taskboard
kubectl rollout status deployment/taskboard-backend -n taskboard
kubectl describe pod <pod-name> -n taskboard
kubectl logs <pod-name> -n taskboard
```

Adjust names to match the final manifests.

## Helm Deployment

```bash
helm lint helm/taskboard
helm template taskboard helm/taskboard -f helm/taskboard/values-dev.yaml
helm upgrade --install taskboard helm/taskboard \
  --namespace taskboard \
  --create-namespace \
  -f helm/taskboard/values-dev.yaml

helm list -n taskboard
helm status taskboard -n taskboard
kubectl get all -n taskboard
```

For rollback practice:

```bash
helm history taskboard -n taskboard
helm rollback taskboard <revision> -n taskboard
```

## Terraform Infrastructure

The Terraform project provisions the required AWS networking and Kubernetes platform. Review resource cost and permissions before applying.

```bash
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
```

After the demonstration:

```bash
terraform destroy
```

Do not commit `.tfstate`, credentials, kubeconfig files, or secrets.

## CI/CD and DevSecOps

The required gate order is:

```text
build -> unit test -> SAST -> SCA -> secret scan
      -> Docker build -> image scan -> security gate
      -> image push -> Kubernetes deployment
```

Required behavior:

- Pull requests build, test, and scan without deploying.
- Protected-branch changes push only verified images.
- Registry authentication uses GitHub-provided or federated credentials.
- The deployment uses a commit-SHA image tag.
- High/critical findings above the documented threshold fail the workflow.
- A failed gate prevents image promotion and deployment.

## Monitoring and GitOps

Application monitoring should cover request volume, errors, latency, health, CPU, memory, restarts, and replica availability. Prometheus scrapes metrics and Grafana displays dashboards. Logs remain available through `kubectl logs` and the selected log backend.

In the GitOps workflow, deployment configuration is changed through Git. The controller reports sync and health status, applies approved changes, detects drift, and restores the declared state.

## Troubleshooting Challenge

The [`troubleshooting`](../../troubleshooting/) directory contains deliberately broken image and service examples. For every issue, record:

1. Symptom and user impact.
2. Initial resource status.
3. Commands and logs used to investigate.
4. Root cause.
5. Exact fix.
6. Verification after the fix.

### Broken Image Exercise

```bash
kubectl apply -f troubleshooting/broken-image.yaml
kubectl get pods
kubectl describe pod <pod-name>
kubectl get events --sort-by=.lastTimestamp
```

Expected investigation: an invalid or inaccessible image produces `ErrImagePull`/`ImagePullBackOff`. Correct the image reference, apply again, and verify the pod becomes Ready.

### Broken Service Exercise

```bash
kubectl apply -f troubleshooting/broken-service.yaml
kubectl get svc,endpoints
kubectl describe svc <service-name>
kubectl get pods --show-labels
```

Expected investigation: compare the Service selector with Pod labels and verify target ports. Correct the mismatch and confirm populated endpoints and successful connectivity.

## Screenshot Plan

```text
screenshots/
├── png1.png    # Local application and passing tests
├── png2.png    # Docker images / Compose stack
├── png3.png    # Complete successful GitHub Actions run
├── png4.png    # Security scanning and gate output
├── png5.png    # Images in GHCR
├── png6.png    # Terraform plan/apply/outputs
├── png7.png    # Kubernetes resources and healthy rollout
├── png8.png    # Helm release and history
├── png9.png    # Prometheus targets/metrics
├── png10.png   # Grafana dashboard
├── png11.png   # Argo CD Synced/Healthy state
├── png12.png   # Broken image diagnosis and fix
├── png13.png   # Broken service diagnosis and fix
└── png14.png   # Terraform destroy / final cleanup
```

Embed the final files with Markdown such as:

```markdown
![Successful CI/CD pipeline](screenshots/png3.png)
![Kubernetes rollout](screenshots/png7.png)
![Grafana dashboard](screenshots/png10.png)
```

## Final Deliverables Checklist

- [x] Full-stack application source is present.
- [x] Docker, Kubernetes, Helm, Terraform, monitoring, and troubleshooting source is present.
- [ ] All application tests pass.
- [ ] CI/CD and security gates complete successfully.
- [ ] Images are published to the registry.
- [ ] Terraform infrastructure is applied and verified.
- [ ] Kubernetes and Helm deployment is healthy.
- [ ] Monitoring and GitOps demonstrations are verified.
- [ ] Both troubleshooting exercises are documented with before/after evidence.
- [ ] All screenshots are added and embedded.
- [ ] Cloud and local lab resources are cleaned up.

## Lessons Learned

- Delivery reliability comes from several small, enforced gates rather than one final check.
- Immutable images and declarative configuration make releases reproducible and auditable.
- Infrastructure state and application state both require secure lifecycle management.
- Metrics reveal trends, logs explain events, and traces connect distributed requests.
- GitOps makes drift visible and gives operational changes the same review history as code.
- Troubleshooting is a cycle of observation, hypothesis, evidence, correction, and verification.

---

*Maintained by MD Kaif Molla (24BCS10221) — Final DevOps Project Submission*
