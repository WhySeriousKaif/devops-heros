# Session 11 — Kubernetes Networking & Services

## What problem a Service solves

Pods are temporary. If a Pod crashes or is replaced, its IP address may change. An application must not depend on a particular Pod IP.

A **Kubernetes Service** gives a stable way to reach a selected group of Pods:

```text
Client -> stable Service IP / DNS name -> one healthy matching Pod
```

Services provide:

- A stable virtual IP and DNS name.
- Load balancing across selected healthy Pods.
- Service discovery: applications use a Service name instead of changing Pod IPs.
- A consistent access point while Pods are replaced or scaled.

**Exam definition:** A Service provides stable access to a set of Pods.

---

## 1. Labels, selectors, and endpoints

A Service uses a **selector** to find Pods with matching labels.

```yaml
# Pod/Deployment template label
labels:
  app: backend

# Service selector
selector:
  app: backend
```

If labels and selectors match, Kubernetes creates endpoint records that point to the selected Pods.

```bash
kubectl get pods -l app=backend       # selected Pods
kubectl get endpoints backend-service # addresses chosen for the Service
```

If a Service has no endpoints, likely causes are:

1. Its selector does not match the Pod labels.
2. The Pods are not ready.
3. The Pods do not exist in the Service’s namespace.

Readiness matters: a Pod that fails its readiness probe should not receive normal Service traffic.

---

## 2. The four ports: do not confuse them

```text
External client
  -> nodePort: 30080       (only NodePort / often LoadBalancer path)
  -> Service port: 80
  -> targetPort: 8080
  -> application inside the Pod
```

| Field | Meaning | Example |
| --- | --- | --- |
| `port` | Port exposed by the Service inside the cluster | `80` |
| `targetPort` | Port on selected backend Pods where app listens | `8080` |
| `nodePort` | Port opened on every node for a NodePort Service | `30080` |
| `containerPort` | Port declared in a Pod/Deployment container spec; useful metadata/named-port reference, but does not expose traffic by itself | `8080` |

Example Service: it receives traffic on 80 and sends it to containers on 5000.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 5000
```

**MCQ answer:** `targetPort` means the port on backend Pods.

---

## 3. The five main Service types

| Type | Access | Main use |
| --- | --- | --- |
| ClusterIP | Inside cluster only | Default for frontend-to-backend or backend-to-database traffic |
| NodePort | `NodeIP:nodePort` from outside | Local demos, simple/bare-metal exposure |
| LoadBalancer | External cloud load balancer IP/DNS | Public cloud entry point |
| ExternalName | DNS alias to an external hostname | Stable in-cluster name for an external database/API |
| Headless | Direct Pod addresses through DNS | Stateful applications needing to find individual Pods |

### A. ClusterIP — default internal Service

ClusterIP is the default when `type` is omitted. It creates a virtual internal IP accessible only from inside the cluster.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP # optional because it is the default
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 5000
```

Use it for a database, backend API, Redis, or any service that should not be directly public.

To test a ClusterIP from your laptop without exposing it publicly:

```bash
kubectl port-forward service/backend-service 8080:80
# Visit http://localhost:8080 while this command runs.
```

### B. NodePort — opens a port on every node

NodePort opens a high port on every worker node. The normal default range is `30000–32767` (a cluster administrator can configure a different range).

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-nodeport
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 5000
      nodePort: 30080
```

Access pattern:

```text
browser -> NODE_IP:30080 -> Service -> matching backend Pod
```

Use it mainly for learning, local/bare-metal clusters, or exposing an Ingress controller. It is usually not the preferred direct public interface for an app because it opens a port on every node.

For Minikube:

```bash
minikube service backend-nodeport --url # show a usable local URL
```

### C. LoadBalancer — cloud-managed external access

LoadBalancer asks a supported cloud integration (AWS, GCP, Azure) to provision an external load balancer. It normally receives an external IP or DNS address after provisioning.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: public-api
spec:
  type: LoadBalancer
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 5000
```

```bash
kubectl get svc public-api # wait for EXTERNAL-IP/hostname in a cloud cluster
```

In most common implementations, a LoadBalancer Service builds on Service mechanisms below it (often ClusterIP and NodePort). Exact implementation can vary by cloud/controller. A local Minikube cluster usually does not automatically get a real public cloud load balancer.

### D. ExternalName — DNS alias, no selected Pods

ExternalName does not route to Pods. It returns a DNS CNAME that points to an external hostname.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: payments-api
spec:
  type: ExternalName
  externalName: api.example.com
```

Your application can use `payments-api` while DNS resolves it to `api.example.com`. This helps avoid hard-coding an external domain throughout application configuration.

### E. Headless Service — direct Pod discovery

A headless Service sets `clusterIP: None`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: database-headless
spec:
  clusterIP: None
  selector:
    app: database
  ports:
    - port: 5432
      targetPort: 5432
```

It does not assign one virtual ClusterIP or do normal Service load balancing. DNS returns addresses of the matching Pods directly. This is useful for StatefulSets, where applications may need to communicate with particular members such as `database-0` and `database-1`.

**MCQ answer:** headless Service → `clusterIP: None`.

---

## 4. How traffic reaches Pods: kube-proxy

`kube-proxy` runs on nodes and implements traffic-routing rules for Services. Depending on the cluster, it uses mechanisms such as `iptables` or IPVS.

```text
Request to Service IP/DNS
  -> kube-proxy routing rules
  -> one healthy endpoint Pod
```

You do not normally configure those rules manually. In the exam, remember:

```text
kube-proxy = Service traffic-routing rules on nodes
```

---

## 5. CoreDNS and Service discovery

CoreDNS provides DNS records for Services in Kubernetes.

Within the same namespace, applications normally use only the Service name:

```text
backend-service
```

Across namespaces, use this form:

```text
service-name.namespace.svc.cluster.local
```

Example:

```text
backend-service.production.svc.cluster.local
```

Test DNS from a temporary container if needed:

```bash
kubectl run dns-test --rm -it --image=busybox:1.36 --restart=Never -- \
  nslookup backend-service.default.svc.cluster.local
```

---

## 6. Service commands to know

```bash
kubectl get svc                         # list Services
kubectl get service                     # same long form
kubectl describe svc SERVICE_NAME        # selector, ports, and events
kubectl get endpoints SERVICE_NAME       # backend endpoint addresses
kubectl get pods -l app=backend          # Pods expected to match selector
kubectl port-forward service/SERVICE 8080:80 # temporarily access a ClusterIP locally
```

---

## 7. Practice question answers explained

1. Services provide stable access to selected Pods → **A**.
2. ClusterIP is normally reachable only inside the cluster → **A**.
3. NodePort opens a port on every node → **A**.
4. LoadBalancer commonly provisions a cloud load balancer → **A**.
5. Service finds backend Pods using a label selector → **A**.
6. `targetPort` is the backend Pod’s application port → **C**.
7. kube-proxy implements Service routing rules → **D**.
8. Cross-namespace Service FQDN is `service.namespace.svc.cluster.local` → **C**.
9. Headless Service sets `clusterIP: None` → **D**.
10. `kubectl get svc` lists Services → **C**.

---

## 8. Fast troubleshooting checklist

| Problem | Check |
| --- | --- |
| Service has no endpoints | `kubectl describe svc NAME`, then compare selector to Pod labels |
| Service has endpoints but app fails | Confirm `targetPort` matches the container’s listening port; check Pod readiness/logs |
| DNS name does not resolve | Check namespace and use full FQDN if calling across namespaces |
| NodePort unreachable | Check `kubectl get svc`, node IP, network/firewall, and use `minikube service NAME --url` locally |
| LoadBalancer stays pending locally | Normal for a local cluster without a cloud LB controller |
| App should not be public | Use ClusterIP instead of NodePort/LoadBalancer |

---

## 9. Last-minute exam memory sheet

- Service = stable IP/DNS and load balancing for selected Pods.
- Selector matches Pod labels; matching Pods become endpoints.
- ClusterIP = default, internal only.
- NodePort = high port on every node.
- LoadBalancer = cloud external load balancer.
- ExternalName = DNS CNAME to an external hostname; no Pod routing.
- Headless = `clusterIP: None`; DNS returns individual Pod IPs.
- `port` = Service port; `targetPort` = backend container/Pod port; `nodePort` = node’s external high port.
- kube-proxy = Service traffic rules.
- Service FQDN = `service.namespace.svc.cluster.local`.
- `kubectl get svc` lists Services; `kubectl get endpoints NAME` shows backends.
