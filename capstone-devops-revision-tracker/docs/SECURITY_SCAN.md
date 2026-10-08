# Trivy security scan result

**Author:** MD Kaif Molla

## What was scanned

Trivy scanned the final backend and frontend container images for operating-system packages and application dependencies with known HIGH or CRITICAL vulnerabilities. Unfixed findings were ignored because no vendor patch can yet be installed for them.

The CI pipeline also runs Bandit against the FastAPI source, `pip-audit` against the Python dependency lock list, and Gitleaks against the complete Git history. The repository-level Gitleaks configuration excludes only the deliberately insecure Session 12 classroom fixtures; all other paths remain enforced by the secret-scanning gate.

## Initial result

- Backend: 3 fixed HIGH findings in the older Starlette dependency
- Frontend: 45 fixed HIGH/CRITICAL findings in the older Nginx Alpine runtime packages

## Remediation

- FastAPI was updated to a maintained release.
- Starlette was explicitly updated to a patched release.
- The Prometheus FastAPI instrumentator was updated for compatibility.
- Pytest was updated to 9.0.3 after `pip-audit` identified PYSEC-2026-1845 in 8.3.4.
- The frontend now uses the maintained `nginx:alpine` base image.
- Alpine security updates are installed during the frontend runtime build.

## Verified result

```text
Backend HIGH/CRITICAL fixed vulnerabilities: 0
Frontend HIGH/CRITICAL fixed vulnerabilities: 0
```

The GitHub Actions pipeline uses the same severity, `ignore-unfixed`, and failure policy. A new fixed HIGH or CRITICAL vulnerability will stop image publishing and deployment.
