# Session 16 — GitHub Actions and CI/CD Complete Notes

GitHub Actions is GitHub's built-in automation platform. It runs defined tasks automatically when an event happens in a repository—for example, a push, pull request, schedule, or manual button click.

The common DevOps use case is a **CI/CD pipeline**:

```text
Code change → Build → Test → Package/image → Deploy or publish → Monitor
```

---

## 1. CI, Continuous Delivery, and Continuous Deployment

| Term | Meaning | Example |
|---|---|---|
| CI | Continuous Integration | Every push builds and tests the application automatically. |
| Continuous Delivery | A successful build is prepared for release, but a person may approve production deployment. | Build and push a tested image, then wait for approval. |
| Continuous Deployment | Every successful change is deployed automatically. | A passed pipeline deploys directly to production. |

Easy rule:

```text
CI = build/test before deployment.
CD = deliver/deploy the validated output.
Delivery may include a manual approval; deployment does not.
```

---

## 2. Pipeline vocabulary

| Word | Meaning |
|---|---|
| Workflow | Entire YAML automation file. |
| Trigger | Event that starts a workflow. |
| Job | A group of steps run on one runner. |
| Step | One shell command or reusable action inside a job. |
| Runner | Machine/VM that executes a job. |
| Action | Reusable packaged automation, such as checkout or upload artifact. |
| Artifact | File/folder saved from a workflow run. |
| Secret | Protected value supplied at runtime. |

Relationship:

```text
Workflow
  └── Job(s)
        └── Step(s)
              ├── run: shell command
              └── uses: reusable action
```

---

## 3. Workflow location and minimum structure

Workflow files must be in:

```text
.github/workflows/NAME.yml
```

Example: `.github/workflows/ci.yml`

```yaml
name: Build and Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout source code
        uses: actions/checkout@v4

      - name: Run a command
        run: echo "Pipeline is running"
```

What each key does:

- `name` — workflow name shown in the Actions tab.
- `on` — triggers.
- `jobs` — all jobs in the workflow.
- `runs-on` — runner environment for a job.
- `steps` — ordered work inside that job.
- `run` — execute shell command(s).
- `uses` — invoke a reusable GitHub Action.

### MCQ must-know

- Workflow directory: **`.github/workflows/`**
- Trigger key: **`on`**
- Runner key: **`runs-on`**
- Shell command key: **`run`**
- Reusable action key: **`uses`**

---

## 4. Workflow triggers

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: "0 0 * * *"
```

| Trigger | Meaning |
|---|---|
| `push` | Runs after a push to the configured branch/path. |
| `pull_request` | Runs when a PR targets the configured branch. |
| `workflow_dispatch` | Adds a manual **Run workflow** button. |
| `schedule` | Runs using cron in UTC. |

Path filter example:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "backend/**"
      - ".github/workflows/ci.yml"
```

This avoids a pipeline run when only unrelated files change.

---

## 5. `run` versus `uses`

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Show operating system
    run: uname -a
```

- `uses` runs a maintained, reusable action.
- `run` runs the shell command you write on the runner.

Frequently used actions:

| Action | Purpose |
|---|---|
| `actions/checkout@v4` | Downloads repository code onto the runner. |
| `actions/setup-python@v5` | Installs/selects Python version. |
| `actions/upload-artifact@v4` | Saves files from a run. |
| `actions/download-artifact@v4` | Retrieves saved artifact files in another job. |
| `docker/login-action@v3` | Logs into a container registry. |
| `docker/build-push-action@v6` | Builds and optionally pushes a Docker image. |

Always use a version tag such as `@v4` or a pinned commit, rather than an unversioned action name.

---

## 6. Jobs, job order, and `needs`

Steps inside one job run in order. Different jobs run in parallel by default.

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python -m compileall app.py
      - run: pytest -v

  docker-test:
    runs-on: ubuntu-latest
    needs: build-and-test
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t my-app:test .
```

`needs: build-and-test` means `docker-test` starts only after `build-and-test` succeeds.

```text
No needs:      job-a and job-b may run together
needs: job-a:  job-b waits for successful job-a
```

If an earlier required job fails, later dependent jobs are skipped. This prevents publishing/deploying untested code.

---

## 7. Runners

`runs-on` chooses the machine that runs a job.

```yaml
runs-on: ubuntu-latest
```

| Runner type | Meaning |
|---|---|
| GitHub-hosted | Fresh VM managed by GitHub, such as `ubuntu-latest`, `windows-latest`, or `macos-latest`. |
| Self-hosted | Your own registered machine. It can access private networks/custom hardware, but needs maintenance and cleanup. |

Important: each GitHub-hosted job gets a fresh VM. Files created in one job do **not** automatically exist in another job. Use artifacts or a registry to share outputs.

### Matrix testing

```yaml
strategy:
  matrix:
    python-version: ["3.10", "3.11", "3.12"]
```

The job is repeated for every matrix value, often in parallel.

---

## 8. Build, test, and application health-check example

```yaml
name: Python CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install test dependencies
        run: pip install -r requirements-dev.txt

      - name: Build/check Python source
        run: python -m compileall app.py

      - name: Run unit tests
        run: pytest -v
```

For the Session 16 homework, the project flow is:

```text
Push or PR
→ CI: install dependencies, compile, run pytest, upload artifact
→ Docker: build image, start container, call /health
→ Publish: push tested image to GHCR only on a push to main
```

---

## 9. Artifacts

An artifact is a saved output from a run, such as a test report, built web files, package, or Docker image archive.

```yaml
- name: Upload application artifact
  uses: actions/upload-artifact@v4
  with:
    name: application-build
    path: build/
    retention-days: 7
```

In another job:

```yaml
- name: Download application artifact
  uses: actions/download-artifact@v4
  with:
    name: application-build
    path: build/
```

Key difference:

- **Artifact**: saved downloadable file(s) from a workflow run; can share files between jobs.
- **Cache**: speeds up future runs by reusing dependencies; it is not the intended deployment output.

---

## 10. Secrets and `GITHUB_TOKEN`

Never hard-code passwords, tokens, keys, or cloud credentials in source code or workflow YAML.

Create repository secrets through:

```text
GitHub repository → Settings → Secrets and variables → Actions → New repository secret
```

Use a secret:

```yaml
- name: Login securely
  env:
    DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  run: echo "$DOCKER_PASSWORD" | docker login --username my-user --password-stdin
```

Important facts:

- Workflow syntax is `${{ secrets.SECRET_NAME }}`.
- GitHub masks known secret values in workflow logs.
- You cannot view a saved secret value later; you can only update/delete it.
- `GITHUB_TOKEN` is automatically provided for a workflow run.
- Give the token only the permissions the workflow needs.

Example least-privilege permissions:

```yaml
permissions:
  contents: read
  packages: write
```

`contents: read` lets the workflow read repository content; `packages: write` is needed when publishing an image/package to GitHub Container Registry.

---

## 11. Conditions

Use `if:` to decide whether a job or step should run.

```yaml
publish:
  needs: docker-test
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
```

This protects the registry: pull-request checks can build/test, but only a push to `main` publishes the image.

Cleanup even after failure:

```yaml
- name: Remove temporary container
  if: always()
  run: docker rm -f test-container || true
```

`always()` means the cleanup step runs even if an earlier step failed.

---

## 12. Debugging a failed workflow

1. Open the repository **Actions** tab.
2. Open the failed workflow run.
3. Open the failed job and the red step.
4. Read the command output and error message.
5. Fix the code, dependency, YAML, secret, or permissions issue.
6. Commit and push the fix—or use **Re-run jobs** only when the configuration has already been corrected outside the run.

Common failure patterns:

| Failure | Usual reason | First check |
|---|---|---|
| Workflow does not start | Wrong workflow path or trigger branch/path filter | `.github/workflows/` and `on:` |
| `pytest` fails | Test/application bug or missing dependency | Test logs and requirements file |
| Later job skipped | Earlier job required by `needs` failed | First failing job |
| Registry push denied | Missing permission/token/login | `permissions`, token, registry action |
| Secret unavailable | Wrong secret name or not configured | `${{ secrets.NAME }}` and repository settings |
| Artifact missing | Wrong `path` or build did not produce files | Build output and upload path |

---

## 13. Practice MCQs with answers

1. **Where do workflow files live?** `.github/workflows/`
2. **Which key declares triggers?** `on`
3. **What is a job?** A group of steps that run on a runner.
4. **What does `runs-on` specify?** Runner environment/machine.
5. **Which action checks out code?** `actions/checkout`.
6. **What does `run` do?** Executes shell commands.
7. **What does `uses` do?** Invokes a reusable action.
8. **Where should tokens be stored?** GitHub Actions secrets.
9. **What does `needs` do?** Defines job dependencies/order.
10. **Which trigger runs on code pushes?** `push`.

---

## 14. Last-minute exam sheet

```text
Workflow location = .github/workflows/
on:               = trigger
jobs:             = job definitions
runs-on:          = runner machine
steps:            = ordered job operations
run:              = shell command
uses:             = reusable action
needs:            = job waits for another job
workflow_dispatch = manual run button
push              = trigger after push
artifact          = saved run output
secret            = protected runtime value
GITHUB_TOKEN      = automatic token for each workflow run
```

### One-line memory rule

**A GitHub Actions workflow is YAML in `.github/workflows/`: triggers start jobs, runners execute steps, `needs` controls order, artifacts save outputs, and secrets protect credentials.**
