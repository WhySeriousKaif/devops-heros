# Viva and exam notes

**Author:** MD Kaif Molla

## Explain the project in 30 seconds

DevOps Revision Tracker is a React, FastAPI, and PostgreSQL three-tier application. Pytest checks the API before GitHub Actions builds the images. Trivy scans both images, and safe images are pushed to GHCR with commit-SHA tags. Terraform defines AWS VPC and EKS infrastructure. Helm deploys two frontend and two backend replicas with probes, Services, Ingress, HPA, and persistent PostgreSQL storage. Prometheus scrapes `/metrics`, and Grafana displays application behavior.

## Why these components exist

- Git provides version history and GitHub provides remote collaboration and CI/CD.
- Pytest stops defective code before image promotion.
- Docker creates the same runtime package for every environment.
- Docker Compose runs the three local services together.
- Trivy detects operating-system and package vulnerabilities in images.
- Terraform makes infrastructure declarative and repeatable.
- Kubernetes maintains the desired number and health of application replicas.
- Helm turns related Kubernetes manifests into one configurable release.
- Prometheus collects time-series metrics and Grafana visualizes them.

## Health versus readiness

- `/health` answers whether the application process is alive.
- `/ready` answers whether the application can serve requests, including database access.
- A failed liveness probe can restart a container.
- A failed readiness probe removes a Pod from Service endpoints without restarting it.

## Common debugging answers

- `CrashLoopBackOff`: inspect current and previous logs, command, variables, dependencies, and probes.
- `ImagePullBackOff`: describe the Pod and verify image name, tag, registry access, and pull secret.
- `Pending`: inspect Events, resources, selectors, taints, affinity, and PVC status.
- Service has no endpoints: compare Service selectors with Pod labels.
- HPA shows unknown CPU: verify Metrics Server and CPU requests.

## Commands worth memorizing

```bash
docker compose up --build -d
docker compose ps
docker compose logs backend

pytest -v

terraform init
terraform validate
terraform plan
terraform destroy

helm upgrade --install <release> <chart> -n <namespace>
helm list -n <namespace>

kubectl get pods -n <namespace>
kubectl describe pod <pod> -n <namespace>
kubectl logs <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --previous
kubectl get events -n <namespace> --sort-by=.lastTimestamp
kubectl get endpoints <service> -n <namespace>
```
