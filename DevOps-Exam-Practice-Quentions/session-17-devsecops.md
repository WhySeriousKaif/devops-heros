# Session 17 — DevSecOps: Practice Questions and Lab Tasks

## MCQs with answers

1. **DevSecOps means?** Integrating security throughout development and delivery.
2. **SAST analyzes?** Source code/binaries without executing the application.
3. **DAST tests?** A running application from the outside.
4. **Dependency scanning finds?** Known vulnerabilities in third-party packages.
5. **Container image scanning inspects?** Image packages and known vulnerabilities.
6. **Least privilege means?** Give only the permissions required.
7. **Why not commit secrets to Git?** They can remain exposed in repository history.
8. **SBOM means?** Software Bill of Materials listing components.
9. **Security gate purpose?** Block later promotion/deployment when policy checks fail.
10. **Shift left means?** Run security checks earlier.

---

## Exam-style practical tasks

### Task 1 — Add SAST and SCA checks

**Exam story:** A Python application must be scanned for source-code weaknesses and vulnerable dependencies before Docker build.

```bash
# SAST: inspect application source for security weaknesses.
bandit -c security/bandit.yaml -r app.py -ll

# SCA: inspect packages in requirements.txt for known vulnerabilities.
pip-audit -r requirements.txt
```

**Answer:** Bandit is SAST because it scans your source code. `pip-audit` is SCA because it scans third-party dependencies.

### Task 2 — Detect a leaked secret safely

**Exam story:** Scan the project for committed credentials while redacting any matched value from terminal output.

```bash
# Scan files using the project rules. --redact hides matched values in output.
gitleaks detect \
  --source . \
  --no-git \
  --config security/gitleaks.toml \
  --redact \
  --verbose
```

**If a real secret is detected:** revoke/rotate it first, then remove it from code/history according to policy and store its replacement securely.

### Task 3 — Create a container vulnerability security gate

**Exam story:** Build an image and stop the pipeline if HIGH or CRITICAL vulnerabilities exceed the policy threshold.

```bash
# Build the application image.
docker build -t secure-app:local .

# Scan the final image and return exit code 1 when the threshold is violated.
trivy image --severity HIGH,CRITICAL --exit-code 1 secure-app:local
```

**Answer:** `--exit-code 1` makes the CI step fail when matching vulnerabilities are found; dependent publish/deploy jobs are then blocked.

### Task 4 — Enforce security-job order in GitHub Actions

**Exam story:** Docker delivery must run only after unit tests, SAST, SCA, and secret scanning succeed.

```yaml
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - run: pytest -v

  sast:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - run: bandit -r . -ll

  sca:
    needs: sast
    runs-on: ubuntu-latest
    steps:
      - run: pip-audit -r requirements.txt

  secret-scan:
    needs: sca
    runs-on: ubuntu-latest
    steps:
      - run: echo "Run Gitleaks here"

  deliver:
    needs: secret-scan
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build, scan, publish, then deploy"
```

**Answer:** `needs` creates the gates. If any earlier job fails, `deliver` does not run.

### Task 5 — Publish a verified image to GHCR

**Exam story:** After security gates pass, authenticate to GitHub Container Registry without hard-coding a password and push an image.

```yaml
permissions:
  contents: read
  packages: write

steps:
  - name: Login to GHCR
    uses: docker/login-action@v3
    with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}

  - name: Push verified image
    run: docker push ghcr.io/OWNER/secure-app:${{ github.sha }}
```

**Answer:** `GITHUB_TOKEN` is provided automatically. `packages: write` is required to publish a package/image to GHCR.

### Task 6 — Deploy and verify the scanned image

```bash
# Apply Kubernetes resources after the image has passed all required gates.
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

# Wait for a successful rollout and verify workload resources.
kubectl rollout status deployment/devsecops-demo -n session17
kubectl get pods,service -n session17
```

**Answer:** Deployment is only considered successful after the rollout completes and expected Pods are ready.
