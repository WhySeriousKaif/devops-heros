# Final submission checklist

The Google Form accepts only one submission. Verify every link and screenshot before submitting.

## Application and testing

- [x] Frontend works and updates data from the backend
- [x] PostgreSQL persists a topic after container recreation
- [x] `pytest -v` shows at least five passing tests
- [x] `/docs`, `/health`, `/ready`, and `/metrics` work

## Git and Docker

- [x] Repository is public or instructor access is granted
- [x] Commit history contains at least ten meaningful commits
- [x] No credentials or `.env` files are committed
- [x] Both Dockerfiles build successfully
- [x] Both runtime containers use non-root users
- [x] `docker compose ps` shows all services running/healthy

## CI/CD and security

- [x] GitHub Actions run is green
- [x] Pytest and frontend build steps are visible
- [x] Backend and frontend Trivy scans are visible
- [x] GHCR contains both images with commit-SHA tags
- [x] kind/Helm deployment verification is green

## Terraform

- [ ] `terraform init` screenshot
- [ ] `terraform validate` screenshot
- [ ] `terraform plan` screenshot if classroom AWS credentials are available
- [ ] AWS VPC/EKS screenshots if resources are created
- [ ] `terraform destroy` evidence after evaluation

## Kubernetes and Helm

- [x] All five application Pods show Running
- [x] Frontend and backend each show two replicas
- [ ] Services screenshot
- [ ] Helm release screenshot
- [x] Application accessed through port-forward or Ingress

## Monitoring

- [ ] `/metrics` output screenshot
- [ ] Prometheus target shows UP
- [ ] Grafana dashboard has populated panels

## Documentation and presentation

- [ ] README screenshots have accurate captions
- [x] Architecture and technology stack are explained
- [ ] Final presentation is included
- [ ] Optional one-to-two-minute demonstration video is recorded
- [ ] Correct SST email, group, roll number, and GitHub repository URL are entered
