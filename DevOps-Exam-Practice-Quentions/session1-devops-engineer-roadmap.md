# MCQs — session1-devops-engineer-roadmap

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What is the primary objective of DevOps?

A. Faster, reliable delivery through collaboration and automation
B. Replace developers with servers
C. Avoid version control
D. Eliminate all testing

### Q2. What does CI mean?

A. Central Installation
B. Continuous Integration
C. Cloud Inspection
D. Code Isolation

### Q3. Which practice helps catch defects early?

A. Manual deployment only
B. Disabling logs
C. Skipping code reviews
D. Automated tests in CI

### Q4. What is infrastructure as code?

A. Keeping server settings undocumented
B. Writing only frontend code
C. Managing infrastructure using versioned configuration
D. Purchasing hardware manually

### Q5. Which tool is commonly used for source control?

A. Prometheus
B. Nginx
C. Git
D. Grafana

### Q6. What does a CI/CD pipeline automate?

A. Build, test and delivery steps
B. Employee attendance
C. Domain purchases
D. Keyboard configuration

### Q7. Why are containers useful?

A. They package applications with dependencies
B. They remove the need for networks
C. They guarantee zero bugs
D. They replace all databases

### Q8. What is monitoring used for?

A. Formatting YAML
B. Compiling source code
C. Tracking system health and behavior
D. Creating Git branches

### Q9. Which mindset is central to DevOps?

A. Shared ownership across development and operations
B. Only manual changes
C. Separate teams with no communication
D. No production feedback

### Q10. Which is a common DevOps lifecycle activity?

A. Continuous feedback
B. Disabling security scans
C. Ignoring incidents
D. One-time deployment forever

---

## Answer Key

1-A, 2-B, 3-D, 4-C, 5-C, 6-A, 7-A, 8-C, 9-A, 10-A

---

## Practical / Lab Questions (Exam Style)

**Suggested format:** Complete the task in the relevant lab environment, submit commands/configuration files, and include brief evidence of verification. Do not hard-code credentials.

### Lab 1
Given a sample application scenario, draw a simple CI/CD workflow from code commit to deployment. Label the build, test, package, deploy, and monitoring stages.

### Lab 2
Compare a monolithic application and a microservices application for a provided online shopping use case. Identify two operational benefits and two challenges of microservices.

### Lab 3
Create a one-page DevOps roadmap for a small team that currently deploys manually. Prioritize version control, automated tests, containerization, CI/CD, and monitoring, with a short reason for each.
---

## Kaif’s revision help — why the answers are correct

| Question | Correct answer | Why |
|---|---|---|
| Q1 | A | DevOps aims for faster **and reliable** delivery through collaboration, automation, and feedback. |
| Q2 | B | CI means Continuous Integration: developers integrate code frequently and automated checks run. |
| Q3 | D | Automated tests in CI catch defects early, before code reaches production. |
| Q4 | C | Infrastructure as Code manages servers/cloud resources using versioned configuration files. |
| Q5 | C | Git is source/version control; Prometheus and Grafana are monitoring tools. |
| Q6 | A | A CI/CD pipeline automates build, test, package, and delivery/deployment steps. |
| Q7 | A | Containers package application code with dependencies and runtime environment. |
| Q8 | C | Monitoring tracks system health, behaviour, metrics, and failures. |
| Q9 | A | DevOps requires shared ownership between development and operations. |
| Q10 | A | Continuous feedback is part of the DevOps lifecycle; delivery is never a one-time activity. |

### Practical-lab approach

- **Lab 1 — CI/CD flow:** draw `Commit → Build → Test → Package/Image → Deploy → Monitor → Feedback`. Explain each stage in one line.
- **Lab 2 — monolith vs microservices:** monolith = one deployable application; microservices = independently deployable smaller services. Benefits: independent scaling/deployments. Challenges: networking, observability, distributed complexity.
- **Lab 3 — manual-to-DevOps roadmap:** start with Git, then automated tests, containers, CI/CD, and monitoring. This order creates safe, repeatable delivery.
