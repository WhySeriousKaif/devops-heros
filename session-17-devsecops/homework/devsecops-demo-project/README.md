# Session 17: Complete CI/CD and DevSecOps — Homework

> **Status:** Work in progress — execute the pipeline and replace the screenshot placeholders before submission.

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

## Project Overview

This project demonstrates a secure software delivery pipeline. Code must compile and pass tests and security checks before a container image is pushed to a registry and deployed to Kubernetes.

The implementation files are in [`session-17-devsecops/demo`](../../demo/).

## Expected Pipeline

```text
Code
  |
  v
Build -> Unit Test -> SAST -> SCA -> Secret Scan
                                      |
                                      v
                                 Docker Build
                                      |
                                      v
                            Container Image Scan
                                      |
                                      v
                                Security Gate
                                      |
                             +--------+--------+
                             |                 |
                           fail              pass
                             |                 |
                       stop pipeline      Push to GHCR
                                               |
                                               v
                                      Deploy to Kubernetes
```

## Technologies

| Area | Tool / approach |
|---|---|
| Application | Python application and Pytest |
| CI/CD | GitHub Actions |
| SAST | Bandit or CodeQL |
| SCA | `pip-audit` / dependency review |
| Secret scanning | Gitleaks |
| Image scanning | Trivy |
| Registry | GitHub Container Registry (GHCR) |
| Deployment | Kubernetes manifests and `kubectl` |

## Folder Structure

```text
devsecops-demo-project/
├── README.md
└── screenshots/
    ├── png1.png   # Complete successful pipeline
    ├── png2.png   # Unit test and SAST results
    ├── png3.png   # SCA and secret-scan results
    ├── png4.png   # Trivy image scan and security gate
    ├── png5.png   # Image in container registry
    └── png6.png   # Kubernetes deployment verification
```

## Run Locally

```bash
cd session-17-devsecops/demo
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt -r requirements-dev.txt
pytest -v
```

Build and test the container:

```bash
docker build -t devsecops-demo:local .
docker run --rm -p 8080:8080 devsecops-demo:local
curl http://localhost:8080/health
```

## Security Checks

### SAST

Static application security testing inspects source code without executing it.

```bash
bandit -r app -ll
```

### SCA

Software composition analysis identifies known vulnerabilities in third-party dependencies.

```bash
pip-audit -r requirements.txt
```

### Secret Scanning

Secret scanning detects credentials, tokens, and private keys committed accidentally.

```bash
gitleaks detect --source . --redact --verbose
```

### Container Image Scanning

```bash
trivy image --severity HIGH,CRITICAL --exit-code 1 devsecops-demo:local
```

The non-zero exit code is the security gate: a high or critical finding stops promotion. Any documented exception should be time-limited and approved; the scan should not be silently disabled.

## Registry and Kubernetes Deployment

The workflow should authenticate using `GITHUB_TOKEN`, tag the verified image with an immutable commit SHA, and push it to GHCR only after all gates pass.

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl rollout status deployment/devsecops-demo
kubectl get pods,svc
kubectl describe deployment devsecops-demo
```

Use the exact deployment and service names defined in the manifests if they differ from the examples above.

## Security Gate Test

1. Introduce a safe test fixture that a scanner will flag.
2. Run the workflow and verify the relevant job fails.
3. Remove the fixture.
4. Rerun the workflow.
5. Confirm that image push and deployment occur only on the clean run.

Never commit a real credential for this demonstration.

## Screenshots

```markdown
![Successful pipeline](screenshots/png1.png)
![Tests and SAST](screenshots/png2.png)
![SCA and secret scan](screenshots/png3.png)
![Image scan and gate](screenshots/png4.png)
![Container registry](screenshots/png5.png)
![Kubernetes deployment](screenshots/png6.png)
```

## Deliverables Checklist

- [ ] Application build and unit tests pass.
- [ ] SAST, SCA, secret scanning, and image scanning run.
- [ ] Security gates block unacceptable findings.
- [ ] Verified image is pushed to the registry.
- [ ] Kubernetes rollout completes successfully.
- [ ] Pipeline logs and deployment screenshots are added.
- [x] Pipeline workflow and security process are documented.

---

*Maintained by MD Kaif Molla (24BCS10221) — DevOps Homework Submission*
