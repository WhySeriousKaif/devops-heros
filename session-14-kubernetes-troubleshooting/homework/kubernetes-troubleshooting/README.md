# Kubernetes Troubleshooting: DevOps Homework

> **⏳ STATUS: PENDING — Work In Progress.** This module corresponds to **Session 14** (`session-14-kubernetes-troubleshooting/`). Tasks will be documented here with execution screenshots once the lab is completed.

A practical laboratory covering the Kubernetes debugging mindset: `kubectl get / describe / logs / exec / events`, and diagnosing the classic failure states — `CrashLoopBackOff`, `ImagePullBackOff`, `Pending` pods, and Service/DNS problems (selector mismatches, empty endpoints).

---

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

---

## Session Reference

All session materials, broken/fixed manifests and guides live in [`session-14-kubernetes-troubleshooting/`](../../session-14-kubernetes-troubleshooting/):

| Session Topic | Material |
|---|---|
| kubectl get | `01-kubectl-get/` |
| kubectl describe | `02-kubectl-describe/` |
| kubectl logs | `03-kubectl-logs/` |
| kubectl exec | `04-kubectl-exec/` |
| Events | `05-events/` |
| CrashLoopBackOff | `06-crashloopbackoff/` |
| ImagePullBackOff | `07-imagepullbackoff/` |
| Pending Pods | `08-pending-pods/` |
| Service & DNS Troubleshooting | `09-service-dns-troubleshooting/` |
| Challenge | `mini-project/` |

---

## Homework Task Checklist

- [ ] **Task 1:** Deploy the challenge app (Deployment + Service) and verify it works end-to-end.
- [ ] **Task 2:** Break a Pod (bad image), diagnose **without editing YAML first** — capture `get`, `describe` events, and root cause.
- [ ] **Task 3:** Answer the 5 broken-Pod questions (status, actual error, diagnostic command, image problem, fix).
- [ ] **Task 4:** Create a Service selector mismatch (`app: wrong-app`), observe empty endpoints, and fix it.
- [ ] **Task 5:** Fill the troubleshooting table (Problem → What I Saw → Command → Root Cause → Fix).
- [ ] **Task 6:** Answer the 10 README questions in own words (get vs describe, logs, exec, CrashLoopBackOff, Pending, DNS…).

## Planned Repository Structure

```text
kubernetes-troubleshooting/
├── README.md                    # This documentation (to be completed)
├── manifests/                   # Broken vs fixed pod/service manifests used in the lab
└── screenshots/                 # Diagnostic evidence: describe events, logs, endpoints (png1–pngN)
```

---

## Troubleshooting Table (to fill)

| Problem | What I Saw | Command I Used | Root Cause | Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Broken Pod** | — | — | — | — |
| **Service Problem** | — | — | — | — |
| **Image Problem** | — | — | — | — |

---

## Execution & Output Screenshots

_Pending — screenshots will be added after the lab is executed._

---

## Key Learnings & Summary

_Pending — to be written after completion._
