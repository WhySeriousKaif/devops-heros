# Session 15 — Helm Package Manager: Practice Questions

These are the Helm practice questions with concise answers and the practical meaning needed for revision.

## MCQs

### 1. What is Helm?

**Answer:** Helm is a package manager for Kubernetes.

It bundles related Kubernetes resources into reusable charts and manages installed releases.

### 2. What is a Helm chart?

**Answer:** A Helm chart is a package containing Kubernetes templates, default configuration values, and metadata.

### 3. Which file contains Helm chart metadata such as the chart name and version?

**Answer:** `Chart.yaml`

### 4. Which file usually stores default configuration values for a Helm chart?

**Answer:** `values.yaml`

### 5. Which command creates a starter Helm chart?

```bash
# Creates a folder named my-chart with a starter chart structure.
helm create my-chart
```

### 6. Which command installs a Helm chart as a release?

```bash
# Installs local chart ./my-chart using release name my-release.
helm install my-release ./my-chart
```

### 7. Which command upgrades an existing Helm release?

```bash
# Updates an existing release from the current chart files.
helm upgrade my-release ./my-chart
```

### 8. Which command rolls a release back to an earlier revision?

```bash
# Returns my-release to revision 1.
helm rollback my-release 1
```

### 9. Which option overrides a Helm value directly from the command line?

**Answer:** `--set`

```bash
# Overrides a default value for this command.
helm upgrade my-release ./my-chart --set replicaCount=3
```

### 10. What does `helm template` do?

**Answer:** It renders a Helm chart into Kubernetes YAML without installing anything in the cluster.

```bash
# Preview the generated Kubernetes manifests locally.
helm template my-release ./my-chart
```

---

## Quick practical patterns

```bash
# Check a chart before deploying it.
helm lint ./my-chart

# Install a chart in a namespace and create the namespace if necessary.
helm install my-release ./my-chart -n demo --create-namespace

# List installed releases in a namespace.
helm list -n demo

# See release status and deployment notes.
helm status my-release -n demo

# See the history/revision numbers before rollback.
helm history my-release -n demo

# Install if absent, otherwise upgrade; useful in automation.
helm upgrade --install my-release ./my-chart -n demo --create-namespace

# Remove the installed release and its managed resources.
helm uninstall my-release -n demo
```

## Fast revision reminders

- Chart = package/blueprint; release = installed copy of the chart.
- `Chart.yaml` = metadata; `values.yaml` = defaults; `templates/` = manifest templates.
- `helm install` fails if that release name already exists.
- `helm upgrade` needs an existing release.
- `helm upgrade --install` safely handles both cases.
- `helm rollback RELEASE REVISION` restores an earlier known configuration.
- `helm template` is safe for preview because it does not modify the cluster.
