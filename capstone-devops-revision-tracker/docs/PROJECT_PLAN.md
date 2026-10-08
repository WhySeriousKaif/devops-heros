# Project Plan

## Why this application?

The application solves a real student problem: keeping track of difficult DevOps topics during exam preparation. It is intentionally small so the focus remains on the DevOps lifecycle rather than complex application code.

## Data stored for each topic

- Title
- Category such as Kubernetes, Docker, Terraform, or CI/CD
- Priority: LOW, MEDIUM, or HIGH
- Revision status: NOT_STARTED, IN_PROGRESS, or COMPLETED
- Notes

## Implementation stages

1. Project structure and planning
2. FastAPI CRUD backend and PostgreSQL model
3. Pytest test suite using a test database
4. Responsive React frontend
5. Dockerfiles and Docker Compose
6. GitHub Actions testing and image build
7. Trivy security gates and image publishing
8. Terraform AWS VPC and EKS configuration
9. Kubernetes manifests and Helm chart
10. Prometheus, Grafana, troubleshooting, and final documentation

## Required screenshots

- Passing Pytest tests
- Docker Compose services running
- Application frontend
- FastAPI `/docs`, `/health`, and `/metrics`
- Successful GitHub Actions pipeline
- Trivy scan output
- GHCR images with commit-SHA tags
- Terraform plan
- Kubernetes Pods and Services
- Helm release
- Application through Ingress
- Prometheus target in the UP state
- Grafana dashboard with live metrics

## Safety rules

- Never commit passwords, access keys, tokens, `.env`, `terraform.tfvars`, or Terraform state.
- Destroy chargeable AWS resources after collecting evidence.
- Verify every screenshot before making the single final submission.

