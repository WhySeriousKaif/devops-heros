# Session 17 — DevSecOps Complete Notes

DevSecOps means integrating security into the normal development and delivery process instead of leaving it until the end.

```text
Old approach: Build → Deploy → Security check later
DevSecOps:   Code → Build/Test → Security checks → Publish → Deploy → Monitor
```

The main idea is **shift left**: detect security problems as early as possible, when they are cheaper and easier to fix.

---

## 1. Why DevSecOps is needed

An application can work correctly and still be insecure. Examples:

- A password was committed to Git.
- Your code has a risky security pattern.
- A third-party library has a known CVE.
- The final container image contains vulnerable OS packages.
- A pipeline deploys even after a severe finding.

DevSecOps adds automated checks to answer: **Is this build safe enough to promote?**

---

## 2. Session 17 pipeline flow

```text
Code
  ↓
Build and unit test
  ↓
SAST — inspect our source code
  ↓
SCA — inspect third-party dependencies
  ↓
Secret scan — detect exposed credentials
  ↓
Docker build
  ↓
Image scan — inspect OS/library packages in final image
  ↓
Security gate
  ├── Fail → stop pipeline; remediate
  └── Pass → publish image → deploy → verify
```

The key is not merely running a scanner. A **security gate** must prevent later stages from running when the agreed policy fails.

---

## 3. Important security scan types

| Scan | Full form | What it checks | Example tool in this session |
|---|---|---|---|
| SAST | Static Application Security Testing | Our source code without running it | Bandit / CodeQL |
| DAST | Dynamic Application Security Testing | A running application from outside | Web security scanner |
| SCA | Software Composition Analysis | Third-party libraries/dependencies and known CVEs | `pip-audit` |
| Secret scanning | — | API keys, tokens, passwords, private keys | Gitleaks |
| Image scanning | — | OS packages and libraries in final container image | Trivy |

### Easy distinctions for MCQs

```text
SAST = our code, not running
DAST = running app, outside-in
SCA  = dependencies
Gitleaks = secrets in files/Git history
Trivy = final container image vulnerabilities
```

No one scan proves an application is completely secure. Use layers.

---

## 4. SAST: source-code security analysis

SAST examines code without first starting the application. It can flag risky coding patterns such as unsafe functions, weak crypto usage, or hard-coded sensitive values.

Python local example with Bandit:

```bash
# Scan app.py recursively using the project's Bandit configuration.
# -ll reports only medium/high severity findings.
bandit -c security/bandit.yaml -r app.py -ll
```

GitHub Actions concept:

```yaml
sast:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Install Bandit
      run: pip install bandit
    - name: Run SAST gate
      run: bandit -r . -ll
```

### SAST versus DAST

| SAST | DAST |
|---|---|
| Looks at code/binaries without running the app | Sends requests to a running app |
| Finds code-pattern problems early | Finds runtime/exposed-behaviour problems |
| Example: Bandit, CodeQL | Example: OWASP ZAP |

---

## 5. SCA: dependency security analysis

Applications use external packages. Even if your own source code is correct, an old dependency might contain a known vulnerability.

For a Python requirements file:

```bash
# Scan dependencies listed in requirements.txt for known vulnerabilities.
pip-audit -r requirements.txt
```

Remediation flow:

```text
Finding → identify package/version → find fixed version
→ update dependency → run tests → run pip-audit again
```

Do not blindly upgrade every package without testing. A fixed dependency version still needs compatibility testing.

---

## 6. Secret scanning and secret hygiene

Secrets include:

- Cloud access keys
- API tokens
- Passwords
- Private keys
- Database credentials
- Webhook URLs

Never do this:

```python
# Bad: a real secret in source code can be copied into Git history.
API_KEY = "real-secret-value"
```

Use an environment variable instead:

```python
import os

# The value is supplied at runtime, not committed to source code.
api_key = os.getenv("API_KEY")
```

Local Gitleaks scan from Session 17:

```bash
# Scan project files without relying on Git history; redact matched values in output.
gitleaks detect \
  --source . \
  --no-git \
  --config security/gitleaks.toml \
  --redact \
  --verbose
```

For pipeline Git history scanning, checkout full history so old commits are checked:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

### If a real secret is committed

Deleting the line is not enough because Git history may still contain it.

```text
1. Treat the secret as compromised.
2. Revoke or rotate it immediately.
3. Check for unauthorized use.
4. Remove it from code/history according to team policy.
5. Store the replacement in a secret manager or GitHub Actions secret.
```

---

## 7. Container registry and image tags

A registry stores built images so another environment can pull them.

GitHub Container Registry naming pattern:

```text
ghcr.io/OWNER/IMAGE:TAG
```

For traceability, tag a published image with the commit SHA:

```text
ghcr.io/whyseriouskaif/session17-devsecops-demo:COMMIT_SHA
```

The `latest` tag is convenient, but a commit-SHA tag precisely identifies the source version deployed.

GitHub Actions permissions for GHCR publishing:

```yaml
permissions:
  contents: read
  packages: write
```

Use the automatic GitHub token instead of hard-coded credentials:

```yaml
- name: Log in to GHCR
  uses: docker/login-action@v3
  with:
    registry: ghcr.io
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

### Least privilege

Give a person, application, or workflow only the permissions required for its job. For example, a pipeline that only tests code does not need `packages: write` or cloud administrator access.

---

## 8. Container image scanning

Source-code scanning is not enough. A built image can include vulnerable:

- Linux/OS packages
- System libraries
- Language packages
- Base-image components

Build and scan locally:

```bash
# Build the image from the current project folder.
docker build -t session17-devsecops:local .

# Run the project's Trivy scan configuration.
trivy image --config security/trivy.yaml session17-devsecops:local
```

Gate example:

```bash
# Fail the command when HIGH or CRITICAL vulnerabilities are found.
trivy image \
  --severity HIGH,CRITICAL \
  --exit-code 1 \
  session17-devsecops:local
```

`--exit-code 1` is important: it gives the command a failure exit status when the policy is violated. GitHub Actions then marks the step/job as failed and dependent jobs do not continue.

The actual severity threshold is a team policy decision. Session 17 uses a strict gate for critical issues.

---

## 9. Security gates and GitHub Actions `needs`

Jobs normally run in parallel unless `needs` makes one wait for another.

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

  deliver:
    needs: sca
    runs-on: ubuntu-latest
    steps:
      - run: echo "Build, scan, publish, then deploy"
```

If `sast` or `sca` fails, `deliver` is skipped. That is a security gate in action.

### Session 17 pipeline gates

```text
Unit test fails       → no SAST/SCA/delivery
SAST fails            → no SCA/delivery
SCA fails             → no secret scan/delivery
Secret scan fails     → no Docker build/push/deploy
Trivy gate fails      → no image push/deploy
```

---

## 10. SBOM

**SBOM** means **Software Bill of Materials**. It is an inventory of software components, dependencies, and versions used in an application or image.

Why it matters:

```text
New CVE announced → find whether that component/version exists in our SBOM → remediate quickly
```

MCQ answer: SBOM = **Software Bill of Materials listing components**.

---

## 11. Kubernetes deployment after a secure build

After the image passes security gates, deploy it using the immutable/tagged image reference.

```bash
# Apply the namespace, Deployment, and Service manifests.
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml

# Wait for the Deployment to become ready.
kubectl rollout status deployment/devsecops-demo -n session17

# Verify Pods and Service.
kubectl get pods,service -n session17
```

For a local test:

```bash
# Forward local port 8080 to Service port 80; leave this terminal running.
kubectl port-forward service/devsecops-demo 8080:80 -n session17
```

In a second terminal:

```bash
# Check liveness and readiness endpoints.
curl http://localhost:8080/health
curl http://localhost:8080/ready
```

Important: a GitHub-hosted runner cannot normally reach Kubernetes running only on your laptop. For a real external deployment, use a reachable cluster or a suitable self-hosted runner.

---

## 12. Practical debugging order

```text
1. Find the first failed job/step in GitHub Actions.
2. Read its logs; do not focus only on later skipped jobs.
3. Fix the root cause.
4. Run the same check locally when possible.
5. Commit/push the correction.
6. Confirm every required gate is green before publish/deploy.
```

| Failure | First place to check |
|---|---|
| Unit-test gate fails | Pytest output and application code |
| SAST fails | Bandit/CodeQL finding, file, line, severity |
| SCA fails | Vulnerable package and fixed version |
| Gitleaks fails | Detected secret; rotate real credential first |
| Trivy fails | Image/base image/dependency and policy severity |
| GHCR push fails | Token, registry login, `packages: write` permission |
| Kubernetes rollout fails | `kubectl describe pod`, logs, image tag, readiness probe |

---

## 13. Practice MCQs with answers

1. **What is DevSecOps?** Security integrated throughout development and delivery.
2. **What does SAST analyze?** Source code/binaries without executing the app.
3. **What does DAST test?** A running app from the outside.
4. **What does dependency scanning identify?** Known vulnerabilities in third-party packages.
5. **What does image scanning inspect?** Image packages and known vulnerabilities.
6. **Least privilege means?** Grant only permissions required.
7. **Why not commit secrets?** Git history can expose them.
8. **What is an SBOM?** Software Bill of Materials listing components.
9. **Why use a security gate?** Block promotion/deployment when policy checks fail.
10. **What is shift left?** Run security checks earlier in development.

---

## 14. Last-minute exam sheet

```text
DevSecOps = security is part of DevOps pipeline
Shift left = test security earlier
SAST      = scan source code without running it
DAST      = scan running app externally
SCA       = scan dependencies
Gitleaks  = scan secrets
Trivy     = scan container image
SBOM      = inventory of components/versions
Gate      = policy decision that stops/continues pipeline
Least privilege = only required permissions
Rotate leaked secret = revoke/replace it; deleting line is not enough
```

### One-line memory rule

**DevSecOps adds layered security scans to CI/CD and uses gates so code is built, tested, scanned, then only published and deployed if it passes policy.**
