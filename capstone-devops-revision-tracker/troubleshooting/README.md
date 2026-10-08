# Kubernetes troubleshooting exercises

These manifests deliberately create two common exam problems.

## Exercise 1: ImagePullBackOff

```bash
kubectl apply -f troubleshooting/broken-image.yaml
kubectl get pods -n revision-tracker
kubectl describe pod <pod-name> -n revision-tracker
kubectl get events -n revision-tracker --sort-by=.lastTimestamp
```

Expected root cause: the requested image tag does not exist.

## Exercise 2: Service without endpoints

```bash
kubectl apply -f troubleshooting/broken-service.yaml
kubectl get svc -n revision-tracker
kubectl get endpoints revision-tracker-broken-service -n revision-tracker
kubectl get pods -n revision-tracker --show-labels
```

Expected root cause: the Service selector does not match any Pod label, so the endpoints list is empty.

## Golden troubleshooting flow

```text
kubectl get
    -> kubectl describe
    -> kubectl get events
    -> kubectl logs
    -> kubectl logs --previous
    -> kubectl exec
    -> check Service selectors and endpoints
    -> fix
    -> verify
```

Delete the deliberate failures after the exercise:

```bash
kubectl delete -f troubleshooting/broken-image.yaml
kubectl delete -f troubleshooting/broken-service.yaml
```

