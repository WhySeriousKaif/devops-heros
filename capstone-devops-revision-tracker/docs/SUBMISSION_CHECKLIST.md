# Final submission checklist

The Google Form accepts only one submission. Verify every link and screenshot before submitting.

## Application and testing

- [ ] Frontend works and updates data from the backend
- [ ] PostgreSQL persists a topic after container recreation
- [ ] `pytest -v` shows at least five passing tests
- [ ] `/docs`, `/health`, `/ready`, and `/metrics` work

## Git and Docker

- [ ] Repository is public or instructor access is granted
- [ ] Commit history contains at least ten meaningful commits
- [ ] No credentials or `.env` files are committed
- [ ] Both Dockerfiles build successfully
- [ ] Both runtime containers use non-root users
- [ ] `docker compose ps` shows all services running/healthy

## CI/CD and security

- [ ] GitHub Actions run is green
- [ ] Pytest and frontend build steps are visible
- [ ] Backend and frontend Trivy scans are visible
- [ ] GHCR contains both images with commit-SHA tags
- [ ] kind/Helm deployment verification is green

## Terraform

- [ ] `terraform init` screenshot
- [ ] `terraform validate` screenshot
- [ ] `terraform plan` screenshot if classroom AWS credentials are available
- [ ] AWS VPC/EKS screenshots if resources are created
- [ ] `terraform destroy` evidence after evaluation

## Kubernetes and Helm

- [ ] All five application Pods show Running
- [ ] Frontend and backend each show two replicas
- [ ] Services screenshot
- [ ] Helm release screenshot
- [ ] Application accessed through port-forward or Ingress

## Monitoring

- [ ] `/metrics` output screenshot
- [ ] Prometheus target shows UP
- [ ] Grafana dashboard has populated panels

## Documentation and presentation

- [ ] README screenshots have accurate captions
- [ ] Architecture and technology stack are explained
- [ ] Final presentation is included
- [ ] Optional one-to-two-minute demonstration video is recorded
- [ ] Correct SST email, group, roll number, and GitHub repository URL are entered

