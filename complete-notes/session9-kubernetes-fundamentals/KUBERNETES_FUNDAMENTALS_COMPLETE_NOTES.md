# Session 9 — Kubernetes Fundamentals

## 1. The big idea: why Kubernetes exists

Docker can run one or a few containers on one machine. In real systems, applications may need many containers across many servers. Containers can fail, traffic can increase, and a new version may need to be deployed safely.

**Kubernetes (K8s)** is a container orchestration platform. It manages containerized applications by keeping the cluster close to the state you declare.

Examples of what Kubernetes helps with:

- Run application containers across multiple machines.
- Restart or replace failed containers.
- Keep the required number of copies running.
- Decide which machine should run a new workload.
- Organize, expose, and later scale application workloads.

**Exam definition:** Kubernetes orchestrates containerized applications.

---

## 2. Kubernetes cluster, control plane, and worker nodes

A **cluster** is the complete Kubernetes environment. It contains:

```text
Kubernetes cluster
├── Control plane: makes decisions and keeps the desired state
└── Worker node(s): run your application Pods
```

In a beginner local setup such as Minikube, one machine can act as both the control plane and a worker node. In production, they are commonly separated and there can be several worker nodes.

### Control plane versus worker node

| Part | Simple meaning | Main job |
| --- | --- | --- |
| Control plane | The cluster’s brain | Accepts requests, stores state, makes scheduling/reconciliation decisions |
| Worker node | The machine doing the work | Runs Pods and their containers |

Do not think of a worker node as a Pod. A **node** is a machine; a **Pod** runs on a node.

---

## 3. Pod: the smallest deployable unit

A **Pod** is the smallest deployable unit in Kubernetes.

```text
Cluster -> Worker node -> Pod -> Container(s)
```

A Pod contains one or more closely related containers that share network and storage context. In most basic application cases, one Pod has one main application container. Some Pods also use helper or sidecar containers.

### Pod versus container

| Container | Pod |
| --- | --- |
| Runs one application process | Kubernetes wrapper for one or more containers |
| A Docker/container-runtime concept | A Kubernetes deployable object |
| Can run by itself with Docker | Is scheduled onto a Kubernetes node |

**MCQ answer:** If asked “smallest deployable unit in Kubernetes,” choose **Pod**, not container or node.

---

## 4. Control-plane components

### `kube-apiserver`: the front door

The API server exposes Kubernetes’ API. `kubectl`, dashboards, controllers, and other components communicate through it.

When you run a command such as:

```bash
kubectl get pods # asks the API server for Pod information
```

`kubectl` sends the request to `kube-apiserver`; it does not directly connect to every node.

### `etcd`: the cluster state database

`etcd` is a distributed key-value store that keeps Kubernetes cluster state and configuration.

It holds information such as:

- Which Deployments, Pods, and Services are desired.
- Configuration and metadata of cluster objects.
- The desired state that Kubernetes tries to maintain.

**Exam pair:** `etcd` = state database; `kube-apiserver` = API/front door.

### `kube-scheduler`: the placement decision maker

When a new Pod does not yet have a node, the scheduler checks possible nodes and chooses one that can run it. It considers available CPU/memory and other rules.

**Exam pair:** scheduler = Pod-to-node placement.

### `kube-controller-manager`: the desired-state checker

Kubernetes works declaratively: you say what you want, then controllers work to make reality match it.

For example, if a Deployment requests three replicas and only two Pods are running, a controller creates another Pod. If too many are running, it removes the extra one.

**Exam pair:** controller manager = reconciliation / desired state versus actual state.

### Control-plane memory sentence

```text
API server receives requests -> etcd stores state -> scheduler chooses a node ->
controllers keep actual state aligned with desired state.
```

---

## 5. Worker-node components

### `kubelet`: the node agent

The kubelet runs on every worker node. It receives Pod specifications assigned to its node and makes sure the required containers are running.

If Kubernetes assigns a Pod to Node A, the kubelet on Node A works with the container runtime to pull the image and start its containers.

**MCQ answer:** kubelet ensures Pod containers run on a node.

### `kube-proxy`: node-level network rules

`kube-proxy` maintains networking rules on nodes and helps Kubernetes Services route traffic to healthy Pods.

For this session, remember only:

```text
kube-proxy = networking/service traffic rules on each node
```

### Container runtime: `containerd`

The container runtime performs the actual container work: pull images, unpack them, and run containers. Modern Kubernetes commonly uses `containerd` through the Container Runtime Interface (CRI).

Do not confuse it with `kubectl`:

- `kubectl` = your command-line client.
- `containerd` = software on the node that runs containers.

---

## 6. What happens after `kubectl apply -f deployment.yaml`?

This is an important interview and exam flow.

```text
1. kubectl sends the YAML manifest to the API server.
2. API server authenticates/validates it and stores desired state in etcd.
3. Deployment/ReplicaSet controllers create the required Pod objects.
4. Scheduler selects a suitable worker node for each unassigned Pod.
5. Kubelet on that node sees the assigned Pod.
6. Kubelet asks containerd to pull the image and start container(s).
7. Controllers continue checking that actual state matches desired state.
```

Simple version to say aloud:

> `kubectl` talks to the API server. The desired state is stored in etcd. The scheduler selects a node, and the kubelet on that node starts the Pod through the container runtime.

---

## 7. Local Kubernetes with Minikube

**Minikube** creates a small local Kubernetes cluster on your own computer. It is useful for learning and testing without paying for cloud infrastructure.

```bash
minikube version             # verify Minikube installation
minikube start --driver=docker # start a local Kubernetes cluster using Docker
minikube status              # check host, kubelet, API server, and kubeconfig status
kubectl cluster-info         # show cluster/API endpoint information
kubectl get nodes            # show node name, role, and readiness
minikube stop                # stop the local cluster when you are finished
```

When `minikube status` is healthy, you normally see:

- host: Running
- kubelet: Running
- apiserver: Running
- kubeconfig: Configured

---

## 8. `kubectl`: your Kubernetes command-line client

`kubectl` is the CLI used to interact with Kubernetes through the API server.

### Commands to memorize

```bash
kubectl get nodes            # list cluster machines
kubectl get pods             # list Pods in current namespace
kubectl get pods -A          # list Pods in all namespaces
kubectl get namespaces       # list logical groupings
kubectl get all              # common workload resources in current namespace

kubectl describe pod POD_NAME # detailed status, events, image, node, and conditions
kubectl logs POD_NAME         # application logs from a Pod/container

kubectl apply -f file.yaml    # create/update objects declared in YAML
kubectl delete -f file.yaml   # delete objects declared in YAML
```

### `get`, `describe`, and `logs`

| Command | Use it when you want |
| --- | --- |
| `kubectl get` | Quick list/status, e.g. Running or Pending |
| `kubectl describe` | Detailed configuration and recent events; best first debugging command |
| `kubectl logs` | Output written by the application inside the container |

---

## 9. Namespace

A **namespace** logically groups Kubernetes resources in one cluster. It is not a separate physical server or a Docker image.

Examples:

- `default`: used when no namespace is specified.
- `kube-system`: Kubernetes system components.
- `development`, `testing`, `production`: common team/environment namespaces.

```bash
kubectl get namespaces                 # list namespaces
kubectl get pods -n kube-system         # Pods in kube-system
kubectl get pods -n development         # Pods in development
```

**MCQ answer:** namespace = logical grouping for cluster resources.

---

## 10. First deployment example

A **Deployment** describes an application and the desired number of replicas. You will study Deployments more deeply later; for Session 9, understand that it creates and manages Pods.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
```

```bash
kubectl apply -f web-deployment.yaml # ask Kubernetes to create/manage two web Pods
kubectl get deployments              # check desired and ready replicas
kubectl get pods                     # see the Pods created for the Deployment
```

Key idea: you declare `replicas: 2`; Kubernetes works to keep two matching Pods running.

---

## 11. Practice questions explained

1. Kubernetes primarily orchestrates containerized apps → **D**.
2. Pod is the smallest deployable unit and contains one/more containers → **C**.
3. etcd stores cluster state → **C**.
4. kube-scheduler places Pods on nodes → **A**.
5. kubelet ensures assigned Pod containers run → **D**.
6. kubectl is the CLI that interacts with Kubernetes API → **B**.
7. `kubectl get pods` lists Pods → **D**.
8. Namespace is a logical grouping of resources → **B**.
9. kube-apiserver exposes the Kubernetes API → **B**.
10. Worker node is a machine that runs application Pods → **D**.

---

## 12. Fast troubleshooting checklist

| Situation | Start with |
| --- | --- |
| Cannot connect to cluster | `kubectl cluster-info`; for local cluster, `minikube status` |
| Pod not Running | `kubectl get pods`, then `kubectl describe pod POD_NAME` |
| App crashes after starting | `kubectl logs POD_NAME` |
| Need to know which node runs a Pod | `kubectl get pods -o wide` |
| Need resources in another namespace | Add `-n NAMESPACE` |
| Need system Pods | `kubectl get pods -n kube-system` |

---

## 13. Last-minute exam memory sheet

- Kubernetes = container orchestration.
- Cluster = control plane + worker nodes.
- Pod = smallest deployable unit; it holds one or more containers.
- Node = machine that runs Pods.
- API server = front door/API endpoint.
- etcd = cluster state key-value database.
- Scheduler = chooses a node for unassigned Pods.
- Controller manager = keeps actual state aligned with desired state.
- Kubelet = node agent; ensures assigned containers run.
- Kube-proxy = node networking/service rules.
- containerd = container runtime.
- kubectl = CLI that talks to the API server.
- Namespace = logical resource grouping.
- `kubectl get pods` = list Pods.
- `kubectl describe pod NAME` = events/details.
- `kubectl logs NAME` = application logs.
