# DevOps Revision Tracker

DevOps Revision Tracker is a three-tier Python application for organizing exam topics and tracking revision progress. A student can create a topic, assign its category and priority, update its revision status, and delete it after completion.

This capstone demonstrates the complete DevOps workflow taught in class:

- React frontend
- FastAPI backend
- PostgreSQL database
- Pytest automated tests
- Docker and Docker Compose
- GitHub Actions CI/CD
- Trivy image scanning
- Terraform for AWS infrastructure
- Kubernetes and Helm
- Prometheus and Grafana
- Troubleshooting exercises

## Application flow

```text
Browser
   |
   v
React frontend
   |
   v
FastAPI backend
   |
   v
PostgreSQL database
```

## Planned API operations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check application health |
| GET | `/ready` | Check database readiness |
| GET | `/metrics` | Expose Prometheus metrics |
| GET | `/api/topics` | List revision topics |
| POST | `/api/topics` | Create a revision topic |
| PUT | `/api/topics/{id}` | Update a revision topic |
| DELETE | `/api/topics/{id}` | Delete a revision topic |

## Project status

The project is being built in small, meaningful stages so each part can be understood and demonstrated separately.

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the implementation plan and evidence checklist.

