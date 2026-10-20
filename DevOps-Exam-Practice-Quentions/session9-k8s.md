# MCQs — session9-k8s

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What is Kubernetes primarily used for?

A. Replacing Git history
B. Editing photos
C. Compiling Linux kernels
D. Orchestrating containerized applications

### Q2. What is a Kubernetes Pod?

A. A Terraform provider
B. A physical data center
C. Smallest deployable unit containing one or more containers
D. A Docker image registry

### Q3. Which component stores Kubernetes cluster state?

A. containerd
B. CoreDNS
C. etcd
D. kube-proxy

### Q4. Which component schedules Pods onto nodes?

A. kube-scheduler
B. kube-proxy
C. kubectl
D. kubelet

### Q5. What does the kubelet do?

A. Stores all cluster state
B. Builds Helm charts
C. Approves pull requests
D. Ensures Pod containers run on a node

### Q6. What is kubectl?

A. A Linux filesystem
B. A CLI for interacting with the Kubernetes API
C. A DNS protocol
D. A container image format

### Q7. Which command lists Pods?

A. `kubectl show nodes`
B. `kubectl list images`
C. `kubectl build pods`
D. `kubectl get pods`

### Q8. What is a Kubernetes namespace?

A. A Dockerfile instruction
B. A logical grouping for cluster resources
C. A container image tag
D. A dedicated physical server

### Q9. Which component exposes the Kubernetes API?

A. kubelet
B. kube-apiserver
C. CoreDNS
D. kube-proxy

### Q10. What is a worker node?

A. A DNS resolver record
B. A GitHub workflow file
C. A Helm repository
D. A machine that runs application Pods

## Answer key

`1-D, 2-C, 3-C, 4-A, 5-D, 6-B, 7-D, 8-B, 9-B, 10-D`

## Kaif’s revision help

- **Q1:** Kubernetes is a container orchestrator. It deploys, scales, replaces, and manages containerized workloads across machines.
- **Q2:** A Pod—not a container—is Kubernetes’ smallest deployable object. It usually contains one main application container, but can contain helper/sidecar containers.
- **Q3:** `etcd` is the cluster’s key-value database. It stores desired state and cluster metadata.
- **Q4:** `kube-scheduler` chooses a suitable worker node for a newly created Pod.
- **Q5:** The `kubelet` runs on each worker node and makes sure the containers assigned to that node are actually running.
- **Q6:** `kubectl` is your command-line client. It talks to the API server; it does not directly control nodes.
- **Q7:** `kubectl get pods` lists Pods in the current namespace. Add `-A` for all namespaces.
- **Q8:** A namespace is a logical partition inside one cluster, such as `default`, `kube-system`, `dev`, or `production`.
- **Q9:** `kube-apiserver` is the front door of Kubernetes. Requests from `kubectl` and internal components go through it.
- **Q10:** A worker node is the VM/physical machine where application Pods run.

## Practical / lab answer patterns

### Lab 1 — inspect a cluster

```bash
kubectl cluster-info       # API server and core endpoint information
kubectl get nodes          # machines in the cluster and readiness
kubectl get namespaces     # logical resource groups
kubectl get pods -A        # Pods in all namespaces
```

### Lab 2 — deploy and inspect a web application

```bash
kubectl create deployment web --image=nginx:alpine
kubectl get deployments    # desired/ready replica status
kubectl get pods           # created workload Pods
kubectl describe pod POD_NAME # events, image, node, status, useful for debugging
kubectl logs POD_NAME      # application/container output
```

### Lab 3 — architecture explanation

```text
kubectl -> API Server -> etcd (desired state)
                    -> controller manager (creates/reconciles objects)
                    -> scheduler (selects a node)
                    -> kubelet on that node -> container runtime -> Pod starts
```

Remember: API server is the front door, etcd is the state database, scheduler selects a node, and kubelet runs the assigned Pod.
