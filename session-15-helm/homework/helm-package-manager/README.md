# Helm — Kubernetes Package Manager: DevOps Homework

> **⏳ STATUS: PENDING — Work In Progress.** This module corresponds to **Session 15** (`session-15-helm/`). Tasks will be documented here with execution screenshots once the lab is completed.

A practical laboratory covering Helm fundamentals: charts, `Chart.yaml`, `values.yaml` overrides, Go templating, `helm install/upgrade`, release history, rollback of a bad upgrade, and packaging & deploying a real application (guestbook / notes app).

---

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

---

## Session Reference

All session materials, charts and guides live in [`session-15-helm/`](../../session-15-helm/):

| Session Topic | Material |
|---|---|
| What is Helm? | `01-what-is-helm/` |
| Helm Charts | `02-helm-charts/` |
| Chart Structure | `03-chart-structure/` |
| Chart.yaml | `04-chart-yaml/` |
| values.yaml | `05-values-yaml/` |
| Templates | `06-templates/` |
| Install & Upgrade | `07-install-upgrade/` |
| Rollback | `08-rollback/` |
| Deploying an Application | `09-deploying-application/` |
| Capstone | `mini-project/` |

---

## Homework Task Checklist

- [ ] **Task 1:** Create the `notes-chart` from scratch (Chart.yaml, values.yaml, values-prod.yaml, deployment/service/configmap templates).
- [ ] **Task 2:** Lint and render the chart locally (`helm lint`, `helm template`) and verify all `{{ }}` placeholders resolve.
- [ ] **Task 3:** `helm install notes-dev` (development values) and verify Pod, Service and ConfigMap.
- [ ] **Task 4:** `helm upgrade` with `values-prod.yaml` (3 replicas, different image tag) and verify revision 2.
- [ ] **Task 5:** Simulate a bad upgrade (`--set image.tag=broken-tag-does-not-exist`) → capture ImagePullBackOff.
- [ ] **Task 6:** `helm rollback notes-dev 2` and verify pods are healthy again; show `helm history`.
- [ ] **Task 7:** Clean up with `helm uninstall` and verify all resources are gone.

## Planned Repository Structure

```text
helm-package-manager/
├── README.md                    # This documentation (to be completed)
├── notes-chart/                 # Packaged chart (Chart.yaml, values*.yaml, templates/)
└── screenshots/                 # install/upgrade/rollback/release-history proofs (png1–pngN)
```

---

## Execution & Output Screenshots

_Pending — screenshots will be added after the lab is executed._

---

## Key Learnings & Summary

_Pending — to be written after completion._
