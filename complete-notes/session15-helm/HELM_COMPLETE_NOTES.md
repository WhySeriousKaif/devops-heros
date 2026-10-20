# Session 15 — Helm Complete Notes

Helm is a **package manager for Kubernetes**. It helps us install, configure, upgrade, roll back, and remove Kubernetes applications without manually applying many YAML files one by one.

Think of it this way:

- A **Chart** is the reusable application package/template.
- A **Release** is one installed copy of that chart in a Kubernetes cluster.
- A **values file** contains configuration values for that installed application.

For example, one `nginx` chart can be installed twice as two different releases: `dev-nginx` and `prod-nginx`, each with different replica counts or image tags.

---

## 1. Why Helm is useful

A real Kubernetes application usually needs several related resources:

- Deployment
- Service
- ConfigMap
- Secret
- Ingress
- HPA

Without Helm, we maintain and apply every YAML manually. Helm groups the application resources into a chart and makes the configuration reusable.

| Without Helm | With Helm |
|---|---|
| Copy/edit many YAML files for each environment | Reuse one chart with different values |
| Upgrades are manual | `helm upgrade` updates a release |
| Rollback is difficult | `helm rollback` returns to a known revision |
| Hard to track an application's versioned deployment history | Helm stores release revisions in the cluster |

---

## 2. Core terms — must know for MCQs

| Term | Meaning | Easy memory rule |
|---|---|---|
| **Helm** | Kubernetes package manager | Like `apt`/`npm`, but for Kubernetes apps |
| **Chart** | Package containing templates, metadata, and default values | The reusable blueprint |
| **Release** | A deployed instance of a chart | The real installed app |
| **Repository** | A place that hosts downloadable charts | Like an app store for charts |
| **`Chart.yaml`** | Chart metadata | Chart name and version details |
| **`values.yaml`** | Default configuration values | Settings used by templates |
| **`templates/`** | Kubernetes YAML templates | Files Helm renders into actual manifests |

Important: a chart is **not** the running app. A chart becomes a running application only after it is installed as a release.

---

## 3. Helm chart structure

After creating a chart, the folder normally looks like this:

```text
my-chart/
├── Chart.yaml          # chart metadata
├── values.yaml         # default user-configurable values
├── charts/             # dependency charts, if any
├── templates/          # templated Kubernetes manifests
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── _helpers.tpl
└── .helmignore         # files Helm should exclude from a package
```

Create a starter chart:

```bash
# Generate a standard Helm chart folder named revision-chart.
helm create revision-chart
```

The generated files are a starting point. Remove templates you do not need and customize the remaining files.

---

## 4. `Chart.yaml`: chart metadata

Example:

```yaml
apiVersion: v2
name: revision-chart
description: A Helm chart for the Revision Tracker application
type: application
version: 0.1.0
appVersion: "1.0.0"
```

What each field means:

- `apiVersion: v2` — Helm 3 chart format.
- `name` — chart name.
- `description` — human-readable purpose.
- `type: application` — this chart deploys an application. (`library` charts provide reusable helpers instead.)
- `version` — **chart version**; change this when the chart itself changes.
- `appVersion` — version of the application/image being deployed; this is informational unless templates use it.

### Exam trap: `version` vs `appVersion`

- `version: 0.2.0` means the Helm **chart package** version.
- `appVersion: "2.4.1"` means the **application** version.

They are related but not the same thing.

---

## 5. `values.yaml`: default configuration

Example:

```yaml
replicaCount: 2

image:
  repository: ghcr.io/example/revision-tracker-backend
  pullPolicy: IfNotPresent
  tag: "1.0.0"

service:
  type: ClusterIP
  port: 8000

ingress:
  enabled: false
```

This is configuration, not a Kubernetes resource by itself. Helm reads these values while rendering the files in `templates/`.

Common configuration examples:

- image repository and tag
- replica count
- CPU/memory resources
- service port/type
- environment name
- ingress enablement and host

Do **not** commit real passwords, cloud keys, or tokens in a normal Git-tracked `values.yaml`. Use an approved secret-management method in real projects.

---

## 6. Helm templates: turning values into Kubernetes YAML

A template can use values and release metadata.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-backend
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-backend
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-backend
    spec:
      containers:
        - name: backend
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.service.port }}
```

Important template objects:

| Template expression | Meaning |
|---|---|
| `.Values.replicaCount` | Reads `replicaCount` from values |
| `.Values.image.tag` | Reads nested value `image.tag` |
| `.Release.Name` | Name chosen during installation, such as `revision-dev` |
| `.Chart.Name` | Name from `Chart.yaml` |

Conditional rendering example:

```yaml
{{- if .Values.ingress.enabled }}
# Ingress YAML is created only when ingress.enabled is true.
{{- end }}
```

This lets one chart support multiple environments without copying all manifests.

---

## 7. Values override priority

Helm starts with the chart's default `values.yaml`. You can replace values at install or upgrade time.

```bash
# Uses only default values.yaml values.
helm install revision-dev ./revision-chart

# Uses defaults plus values from the specified environment file.
helm install revision-prod ./revision-chart -f values-prod.yaml

# Overrides one value directly for this command.
helm install revision-dev ./revision-chart --set replicaCount=3
```

Simple priority rule:

```text
chart values.yaml  <  -f custom-values.yaml  <  --set key=value
```

`--set` is useful for quick demos, but do not pass sensitive values with it because the command can remain in shell history. For repeatable GitOps deployments, keep non-secret configuration in a versioned values file.

---

## 8. Helm repositories

A Helm repository hosts published charts. Before installing a chart from a repository, add it and update your local index.

```bash
# Show configured chart repositories.
helm repo list

# Add the Bitnami chart repository.
helm repo add bitnami https://charts.bitnami.com/bitnami

# Download the newest repository index locally.
helm repo update

# Search available charts in a repository.
helm search repo bitnami/nginx
```

For your own local chart, use its folder path, such as `./revision-chart`, instead of a repository chart name.

---

## 9. Safe Helm workflow: lint → render → install

Always inspect the chart before changing the cluster.

```bash
# Check common chart problems such as invalid metadata or templates.
helm lint ./revision-chart

# Render Kubernetes YAML locally; it does not install anything.
helm template revision-dev ./revision-chart

# Install the chart as a release named revision-dev.
helm install revision-dev ./revision-chart -n revision-tracker --create-namespace
```

Why these commands matter:

- `helm lint` catches simple chart mistakes.
- `helm template` shows exactly what YAML Helm would send to Kubernetes.
- `helm install` actually creates the Kubernetes resources.

### Key exam point

`helm template` **renders only**. It does not create pods, Deployments, Services, or any other cluster resource.

---

## 10. Install, inspect, and remove a release

```bash
# List releases in a namespace.
helm list -n revision-tracker

# Show release status, notes, and basic resource information.
helm status revision-dev -n revision-tracker

# Show values used by an installed release.
helm get values revision-dev -n revision-tracker

# Show rendered Kubernetes manifests stored for a release.
helm get manifest revision-dev -n revision-tracker

# Remove the release and the resources managed by that release.
helm uninstall revision-dev -n revision-tracker
```

`helm uninstall` removes the release's managed Kubernetes resources. It is different from deleting only one Kubernetes object manually.

---

## 11. Upgrade a release

After changing templates, image tags, or values, update the installed release.

```bash
# Update an existing release using the current chart folder.
helm upgrade revision-dev ./revision-chart -n revision-tracker

# Update an existing release and override replicaCount for this run.
helm upgrade revision-dev ./revision-chart -n revision-tracker --set replicaCount=3

# Install if missing; otherwise upgrade. Very useful in automation.
helm upgrade --install revision-dev ./revision-chart -n revision-tracker --create-namespace
```

### `install` vs `upgrade` vs `upgrade --install`

| Command | Use when | What happens if the release already exists? |
|---|---|---|
| `helm install` | First installation only | Fails |
| `helm upgrade` | Release already exists | Updates it |
| `helm upgrade --install` | You want one repeatable command | Installs if absent; upgrades if present |

For CI/CD and GitOps-style automation, `helm upgrade --install` is often preferred because it is repeatable.

---

## 12. Release history and rollback

Every successful install/upgrade has a revision number.

```bash
# Show deployment history and revision numbers.
helm history revision-dev -n revision-tracker

# Return to revision 2.
helm rollback revision-dev 2 -n revision-tracker
```

Example situation:

1. Revision 1 deploys image `1.0.0` successfully.
2. Revision 2 changes the image tag to a missing image and pods enter `ImagePullBackOff`.
3. Run `helm history` to find the previous working revision.
4. Run `helm rollback revision-dev 1`.
5. Kubernetes reconciles the resources back to the previous working configuration.

Rollback does not erase the past. Helm records a new revision whose configuration matches the selected earlier revision.

Helpful safety option:

```bash
# If the upgrade fails within the timeout, Helm rolls back automatically.
helm upgrade --install revision-dev ./revision-chart \
  -n revision-tracker --atomic --timeout 5m
```

---

## 13. Packaging and dependencies

```bash
# Build a distributable .tgz package from a local chart directory.
helm package ./revision-chart

# Download/update dependencies declared in Chart.yaml.
helm dependency update ./revision-chart
```

Use `helm package` when you want to publish or distribute your chart. The output is normally a compressed chart archive such as `revision-chart-0.1.0.tgz`.

---

## 14. Helm 3 facts

- Helm 3 uses `apiVersion: v2` charts.
- Helm 3 does **not** use Tiller. Tiller was the server-side component used by Helm 2.
- Helm uses your Kubernetes access configured through kubeconfig.
- Helm stores release information in the cluster, commonly as Kubernetes Secrets.

MCQ answer: **Helm 3 removed Tiller.**

---

## 15. Practical debugging order

If a Helm deployment is not working, do not guess. Follow this order:

```bash
# 1. Verify the release state.
helm status revision-dev -n revision-tracker

# 2. Inspect the values actually used.
helm get values revision-dev -n revision-tracker

# 3. Inspect the generated Kubernetes YAML.
helm get manifest revision-dev -n revision-tracker

# 4. Check Kubernetes objects and pod errors.
kubectl get all -n revision-tracker
kubectl get pods -n revision-tracker
kubectl describe pod POD_NAME -n revision-tracker

# 5. Check release revisions and roll back if needed.
helm history revision-dev -n revision-tracker
helm rollback revision-dev REVISION_NUMBER -n revision-tracker
```

Typical causes:

- Wrong image repository or tag → `ImagePullBackOff`
- Missing required value → template/render error or broken manifest
- Wrong service/target port → app is running but inaccessible
- Release name already exists → use `helm upgrade` rather than another `helm install`

---

## 16. Practice questions with answers

### Q1. What is Helm in Kubernetes?

**Answer:** Helm is a package manager for Kubernetes. It packages application manifests into reusable charts and manages releases.

### Q2. What is a Helm chart?

**Answer:** A chart is a package containing Kubernetes templates, chart metadata, and configurable default values.

### Q3. Which file contains chart metadata such as name and version?

**Answer:** `Chart.yaml`.

### Q4. Which file holds default configurable values?

**Answer:** `values.yaml`.

### Q5. Which command creates a starter chart?

```bash
# Creates a starter chart folder.
helm create my-chart
```

### Q6. Which command installs a chart?

```bash
# Installs chart ./my-chart as release my-release.
helm install my-release ./my-chart
```

### Q7. Which command updates an existing release?

```bash
# Updates a previously installed release.
helm upgrade my-release ./my-chart
```

### Q8. Which command returns to a previous release revision?

```bash
# Rolls the release back to revision 1.
helm rollback my-release 1
```

### Q9. Which option overrides a value from the command line?

**Answer:** `--set`.

```bash
# Overrides replicaCount without editing values.yaml.
helm upgrade my-release ./my-chart --set replicaCount=3
```

### Q10. What does `helm template` do?

**Answer:** It renders the chart into Kubernetes YAML locally without installing it into the cluster.

---

## 17. Last-minute exam sheet

```text
Helm       = package manager for Kubernetes
Chart      = reusable application package/template
Release    = installed instance of a chart
Chart.yaml = chart metadata
values.yaml= default configuration values
templates/ = Kubernetes manifest templates

helm create        = create starter chart
helm lint          = validate chart basics
helm template      = render only; no installation
helm install       = first installation
helm upgrade       = update existing release
helm upgrade --install = install if absent, upgrade if present
helm history       = see revision history
helm rollback      = return to an earlier revision
helm uninstall     = remove a release
--set              = command-line values override
-f file.yaml       = custom values file
```

### One-line memory rule

**A chart is the blueprint, values customize it, a release is the installed app, and Helm manages its upgrade history.**
