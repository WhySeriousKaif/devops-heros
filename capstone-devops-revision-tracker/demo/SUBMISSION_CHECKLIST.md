# Final Submission Checklist

## Mandatory files

- [x] Complete project `README.md`.
- [x] PPT slide deck at `demo/presentation.pptx`.
- [ ] Presentation video at `demo/presentation-video.mp4`.

## Evidence still to capture

- [ ] Commit history showing at least ten meaningful commits.
- [ ] GHCR pages showing backend and frontend SHA tags.
- [ ] Expanded backend and frontend Trivy scan output.
- [ ] Successful non-empty `terraform plan`.
- [ ] AWS VPC and two public subnets.
- [ ] Active EKS cluster and managed node group.
- [ ] Kubernetes Ingress resource and browser access through its hostname.
- [ ] Successful `terraform destroy` after the demonstration.

## Video checks

- [ ] Slides are presented first.
- [ ] Codebase and architecture are explained.
- [ ] A push triggers the complete green GitHub Actions pipeline.
- [ ] Terraform plan/apply and AWS VPC/EKS are shown.
- [ ] Argo CD is Synced and Healthy.
- [ ] Pods, services, Ingress, and Helm release are healthy.
- [ ] Prometheus target is UP.
- [ ] Grafana panels contain live data.
- [ ] No credential, token, kubeconfig, or password is visible.
