# Session 16 — GitHub Actions: Practice Questions and Lab Tasks

## MCQs with answers

1. **Where are workflow files stored?** `.github/workflows/`
2. **Which YAML key defines workflow triggers?** `on`
3. **What is a job?** A group of steps that run on a runner.
4. **What does `runs-on` select?** The runner environment.
5. **Which action checks out repository code?** `actions/checkout`.
6. **What does `run` do?** Executes shell commands.
7. **What does `uses` do?** Runs a reusable action.
8. **How should sensitive tokens be supplied?** GitHub Actions secrets.
9. **What does `needs` do?** Defines job dependencies.
10. **Which trigger runs after a push?** `push`.

---

## Exam-style practical tasks

### Task 1 — Create a workflow that runs on push

**Exam story:** Create a GitHub Actions workflow that runs whenever code is pushed to `main`, checks out code, and prints the operating system.

Create `.github/workflows/hello.yml`:

```yaml
name: Hello CI

on:
  push:
    branches: [main]

jobs:
  hello:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Show operating system
        run: uname -a
```

```bash
# Track and push the workflow file; the push triggers the workflow.
git add .github/workflows/hello.yml
git commit -m "Add hello GitHub Actions workflow"
git push origin main
```

**Verify:** Open repository → **Actions** → open the latest `Hello CI` run. It should show a successful `hello` job.

### Task 2 — Build and test a Python application

**Exam story:** Extend a workflow so it installs development dependencies, checks Python syntax, and runs unit tests.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - name: Install dependencies
        run: pip install -r requirements-dev.txt
      - name: Build/check source
        run: python -m compileall app.py
      - name: Run unit tests
        run: pytest -v
```

**Expected result:** If `pytest` fails, the job fails and the pipeline stops at that point. Correct the failing code/test, commit, and push again.

### Task 3 — Make Docker wait for CI success

**Exam story:** Build a Docker image only after the test job passes.

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pytest -v

  docker:
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t my-app:test .
```

**Answer:** `needs: ci` makes `docker` wait for the successful `ci` job. If tests fail, Docker job is skipped.

### Task 4 — Upload a build artifact

**Exam story:** The build produces a `dist/` directory. Save it so it can be downloaded from the Actions run.

```yaml
- name: Upload build artifact
  uses: actions/upload-artifact@v4
  with:
    name: application-build
    path: dist/
    retention-days: 7
```

**Verify:** Open the completed workflow run and find `application-build` in the **Artifacts** section.

### Task 5 — Use a secret safely

**Exam story:** Log in to a registry without placing a password in workflow YAML.

```yaml
- name: Login to registry
  env:
    DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  run: echo "$DOCKER_PASSWORD" | docker login -u my-user --password-stdin
```

**Setup:** Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Create `DOCKER_PASSWORD` there.

**Answer:** Use `${{ secrets.NAME }}`. Never hard-code passwords or print them.

### Task 6 — Publish only from the main branch

**Exam story:** Tests should run for pull requests, but a container image should be pushed only after a direct push to `main`.

```yaml
publish:
  needs: docker
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Publish image
      run: echo "Push verified image here"
```

**Answer:** The `if` condition prevents publishing during pull-request runs.
