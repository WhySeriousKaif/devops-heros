# Session 16: CI/CD and GitHub Actions

> **Status:** Run the commands below, capture the four screenshots, and add them to `screenshots/`.

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

## Project Overview

This is a simple Python web application used to demonstrate a complete GitHub Actions CI/CD pipeline.

The pipeline:

1. Builds the Python application.
2. Runs unit tests.
3. Uploads a build artifact.
4. Builds a Docker image.
5. Starts the container and checks its health.
6. Pushes the verified image to GitHub Container Registry on the `main` branch.

## CI vs CD

- **Continuous Integration (CI):** automatically builds and tests every code change.
- **Continuous Delivery (CD):** prepares and publishes a tested application or image so it is ready to deploy.
- **Continuous Deployment:** automatically deploys every successful change to an environment.

This demo uses CI for build and test, then CD to publish the verified Docker image.

## GitHub Actions Concepts

- **GitHub Actions:** GitHub's automation service.
- **Workflow:** the YAML file that defines the pipeline.
- **Job:** a group of related steps executed by one runner.
- **Step:** one command or reusable action inside a job.
- **Runner:** the machine that executes a job; this demo uses `ubuntu-latest`.
- **Secret:** a protected value used by a workflow. This demo uses the automatic `GITHUB_TOKEN` to log in to GHCR.
- **Artifact:** a file saved from a workflow run. This demo uploads the built application.

## Pipeline Flow

```text
Push or Pull Request
        |
        v
Build Python Application
        |
        v
Run Unit Tests
        |
        v
Upload Build Artifact
        |
        v
Build Docker Image
        |
        v
Run Container Health Check
        |
        v
Push Image to GHCR (main branch only)
```

## Folder Structure

```text
devops-heros/
├── .github/
│   └── workflows/
│       └── session16-cicd.yml
└── session-16-github-actions/
    └── homework/
        └── github-actions-cicd/
            ├── app.py
            ├── Dockerfile
            ├── .dockerignore
            ├── .gitignore
            ├── requirements.txt
            ├── requirements-dev.txt
            ├── pytest.ini
            ├── tests/
            │   └── test_app.py
            ├── screenshots/
            │   ├── png1.png
            │   ├── png2.png
            │   ├── png3.png
            │   └── png4.png
            └── README.md
```

## Application

The application provides two URLs:

- `/` returns a welcome message.
- `/health` returns `OK` for container health checks.

## Commands to Run

Run every command from the repository root unless a command says otherwise.

### 1. Open the Project

```bash
cd /Users/mdkaif/devops-heros/session-16-github-actions/homework/github-actions-cicd
```

### 2. Create a Python Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```

### 3. Build and Test

```bash
python -m compileall app.py
pytest -v
```

Expected result:

```text
3 passed
```

Take a screenshot and save it as:

```text
screenshots/png1.png
```

### 4. Run the Application Locally

Terminal 1:

```bash
python app.py
```

Terminal 2:

```bash
curl http://localhost:8080/
curl http://localhost:8080/health
```

Expected output:

```text
Hello from the Session 16 CI/CD demo!
OK
```

Stop the application with `Ctrl+C`.

### 5. Build and Test the Docker Image

```bash
docker build -t session16-cicd:local .
docker run -d --name session16-cicd -p 8080:8080 session16-cicd:local

until curl --fail http://localhost:8080/health; do
  sleep 1
done

curl http://localhost:8080/
curl http://localhost:8080/health
docker ps
docker logs session16-cicd
docker rm -f session16-cicd
```

Take a screenshot showing the running container and successful `curl` output. Save it as:

```text
screenshots/png2.png
```

### 6. Trigger the GitHub Actions Pipeline

Return to the repository root:

```bash
cd /Users/mdkaif/devops-heros
git status
git add .github/workflows/session16-cicd.yml \
  session-16-github-actions/homework/github-actions-cicd
git commit -m "complete session 16 CI/CD demo"
git push origin main
```

The push automatically starts the workflow.

Open:

```text
https://github.com/WhySeriousKaif/devops-heros/actions
```

Open the latest **Session 16 CI/CD Demo** run.

### 7. Capture GitHub Actions Evidence

Take these screenshots:

- `screenshots/png3.png` — workflow summary showing the `CI - Build and Test`, `Docker Build and Test`, and `CD - Publish Image` jobs.
- `screenshots/png4.png` — successful job steps and the uploaded `session16-application` artifact. The GHCR package may also be included.

## Workflow Behavior

| Event | Build | Test | Artifact | Docker test | Push to GHCR |
|---|---:|---:|---:|---:|---:|
| Pull request | Yes | Yes | Yes | Yes | No |
| Push to `main` | Yes | Yes | Yes | Yes | Yes |
| Manual run | Yes | Yes | Yes | Yes | No |

The jobs use `needs`, so a later job runs only after the required earlier job succeeds. A failed test stops the Docker and publish stages.

## Screenshots

After running the lab, these images will appear here:

### Build and Unit Tests

![Build and unit tests](screenshots/png1.png)

### Docker Build and Health Check

![Docker build and health check](screenshots/png2.png)

### Successful GitHub Actions Pipeline

![Successful GitHub Actions pipeline](screenshots/png3.png)

### Jobs, Steps, Artifact, and Published Image

![Pipeline details and artifact](screenshots/png4.png)

## Deliverables Checklist

- [x] Application source code
- [x] Dockerfile
- [x] GitHub Actions workflow
- [x] CI pipeline
- [x] CD image-publishing pipeline
- [x] Unit tests
- [x] Build artifact configuration
- [ ] Successful pipeline screenshots
- [x] README documentation

## Cleanup

```bash
deactivate
docker rm -f session16-cicd 2>/dev/null || true
docker image rm session16-cicd:local
```

---

*Maintained by MD Kaif Molla (24BCS10221) — DevOps Homework Submission*
