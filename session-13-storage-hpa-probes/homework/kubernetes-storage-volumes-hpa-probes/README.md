# Kubernetes Storage (Volumes, PV/PVC), HPA & Probes: DevOps Homework

> **⏳ STATUS: PENDING — Work In Progress.** This module corresponds to **Session 13** (`session-13-storage-hpa-probes/`). Tasks will be documented here with execution screenshots once the lab is completed.

A practical laboratory covering Kubernetes ephemeral vs persistent storage (emptyDir, hostPath, PersistentVolumes, PersistentVolumeClaims, StorageClasses), Horizontal Pod Autoscaling (HPA), and application health diagnostics (Startup, Readiness, Liveness probes).

---

## Student Information

- **Name:** MD Kaif Molla
- **Enrollment Number:** 24BCS10221
- **Repository:** [WhySeriousKaif/devops-heros](https://github.com/WhySeriousKaif/devops-heros)

---

## Session Reference

All session materials, manifests and guides live in [`session-13-storage-hpa-probes/`](../../session-13-storage-hpa-probes/):

| Session Topic | Material |
|---|---|
| Volumes (emptyDir, hostPath) | `01-volumes/` |
| Persistent Storage (PV / PVC) | `02-persistent-storage/` |
| StorageClass | `03-storageclass/` |
| Horizontal Pod Autoscaler | `04-hpa/` |
| Probes (Startup / Readiness / Liveness) | `05-probes/` |
| Capstone | `mini-project/` |

---

## Homework Task Checklist

- [ ] **Task 1:** Demonstrate ephemeral `emptyDir` volumes and `hostPath` volumes; show data lifecycle inside/outside the container.
- [ ] **Task 2:** Create a PersistentVolume + PersistentVolumeClaim, bind them to a Pod, and verify data survives Pod deletion/rescheduling.
- [ ] **Task 3:** Deploy with a StorageClass-based dynamic provisioning and inspect `kubectl get sc`, `kubectl get pv`, `kubectl get pvc`.
- [ ] **Task 4:** Enable metrics-server, deploy an HPA (min 2 / max 5, 50% CPU target) and capture scale-out / scale-in evidence under load.
- [ ] **Task 5:** Configure Startup, Readiness and Liveness probes; demonstrate each failure mode (0/1 ready endpoints, kubelet restarts).
- [ ] **Task 6 (Mini Project):** Production-ready web app combining PVC persistence + HPA elastic scaling + full probe triage (`mini-project/`).

## Planned Repository Structure

```text
kubernetes-storage-volumes-hpa-probes/
├── README.md                    # This documentation (to be completed)
├── manifests/                   # PV, PVC, StorageClass, HPA & probe manifests
└── screenshots/                 # Execution & verification proofs (png1–pngN)
```

---

## Execution & Output Screenshots

_Pending — screenshots will be added after the lab is executed._

---

## Key Learnings & Summary

_Pending — to be written after completion._
