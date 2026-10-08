# Final Capstone Recording Script

Use this order for the mandatory presentation video. Keep terminals zoomed in and never display passwords, access keys, kubeconfig contents, or the Argo CD admin password.

## 1. Presentation slides

Open `demo/presentation.pptx` and briefly cover:

1. Project purpose and original application domain.
2. Technology stack.
3. End-to-end architecture.
4. CI/CD and security gates.
5. Terraform VPC and EKS infrastructure.
6. Kubernetes, Helm, and Argo CD.
7. Prometheus and Grafana.
8. Troubleshooting and lessons learned.

## 2. Codebase walkthrough

Show the project root and briefly explain:

- `backend/` — FastAPI, SQLAlchemy, Alembic, and Pytest.
- `frontend/` — React/Vite and non-root Nginx image.
- `.github/workflows/capstone-ci-cd.yml` — pipeline definition.
- `terraform/` — VPC, subnets, EKS, and node group.
- `helm/revision-tracker/` — application Kubernetes package.
- `monitoring/` — Prometheus, alerts, and Grafana dashboard.
- `argocd/` — declarative GitOps application.

## 3. CI/CD live run

Make a small meaningful documentation change, commit it, and push it to `main`. Show the complete GitHub Actions run:

1. Pytest and frontend build.
2. Bandit SAST.
3. `pip-audit` SCA.
4. Gitleaks secret scan.
5. Backend and frontend Docker builds.
6. Both Trivy image gates.
7. SHA-tagged GHCR image push.
8. Helm deployment and Kubernetes verification.

Open the GHCR package pages and show the commit-SHA image tags.

## 4. Terraform and AWS

From `capstone-devops-revision-tracker/terraform` show:

```bash
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
```

Then show the AWS Console in the configured region:

- VPC and its two public subnets.
- EKS cluster in Active state.
- Managed worker node group in Active state.

Do not display credentials or the contents of Terraform state.

## 5. Argo CD and Kubernetes

Show Argo CD reporting `Synced` and `Healthy`, then run:

```bash
kubectl get applications -n argocd
kubectl get pods -n revision-tracker
kubectl get deployments,services,hpa -n revision-tracker
kubectl get ingress -n revision-tracker
helm list -n revision-tracker
```

Open the application through the Ingress hostname and demonstrate creating or updating a revision topic.

## 6. Prometheus and Grafana

Show:

- The backend `/metrics` endpoint.
- Prometheus Targets with both backend replicas `UP`.
- The DevOps Revision Tracker Grafana dashboard with populated request, latency, CPU, memory, and status-code panels.

## 7. Closing and cleanup

Summarize the project and lessons learned. After all AWS evidence is captured, run:

```bash
terraform destroy
```

Capture the successful destroy output for the README and submission evidence.
