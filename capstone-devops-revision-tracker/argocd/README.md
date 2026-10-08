# Argo CD GitOps demo

**Author:** MD Kaif Molla

GitOps uses Git as the source of truth for desired system state. Configuration is declarative, changes are reviewed and committed, and a controller continuously compares the live cluster with Git. If drift occurs, the controller reconciles the cluster back to the declared state.

This project uses `application.yaml` to tell Argo CD to deploy the Helm chart from the `main` branch. Automated synchronization, pruning, and self-healing are enabled.

## Workflow

```text
Developer change
  -> Git commit and push
  -> GitHub repository (desired state)
  -> Argo CD detects the change
  -> Helm chart is rendered
  -> Kubernetes resources are reconciled
  -> Argo CD reports Synced and Healthy
```

## Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply --server-side --force-conflicts \
  -n argocd \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Create the application

```bash
kubectl apply -f argocd/application.yaml
kubectl get applications -n argocd
```

The local kind demo overrides the image names to use images already loaded into the cluster. A production environment should use immutable GHCR commit-SHA tags and an image-pull secret when the registry is private.

## Continuous reconciliation

- `automated` synchronizes Git changes without a manual deployment command.
- `prune` removes resources deleted from Git.
- `selfHeal` reverses manual cluster drift.
- `CreateNamespace=true` creates the destination namespace when required.
