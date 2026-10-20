# Session 12 — Ingress, ConfigMaps & Secrets

## What this session adds

Earlier, you learned that a Service provides stable access to Pods. This session adds:

```text
ConfigMap = normal application settings
Secret    = sensitive values
Ingress   = HTTP/HTTPS traffic routing from outside to Services
```

These three objects help make applications configurable, safer, and easier to expose.

---

## 1. ConfigMap: non-sensitive configuration outside code

An application should not need a new image build every time a setting changes between development, testing, and production.

A **ConfigMap** stores non-sensitive key-value configuration, for example:

- Application environment: `dev`, `test`, `production`
- Log level: `INFO`, `DEBUG`
- Feature flags
- Service URL or port
- Timeout value

Do **not** store passwords, API keys, tokens, or private certificates in a ConfigMap.

### ConfigMap manifest

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "INFO"
  PORT: "5000"
```

```bash
kubectl apply -f configmap.yaml
kubectl get configmaps             # list ConfigMaps
kubectl describe configmap app-config # inspect non-sensitive values
```

### Use one ConfigMap key as an environment variable

```yaml
env:
  - name: ENVIRONMENT
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: APP_ENV
```

### Use all ConfigMap keys as environment variables

```yaml
envFrom:
  - configMapRef:
      name: app-config
```

### Mount ConfigMap data as files

```yaml
volumeMounts:
  - name: config-volume
    mountPath: /etc/app-config
volumes:
  - name: config-volume
    configMap:
      name: app-config
```

**Important update behavior:** environment variables do not change inside an already-running Pod after you update a ConfigMap; restart/redeploy the Pod to receive the new environment. ConfigMap files mounted as a volume can be refreshed eventually by Kubernetes, but do not rely on this for instant application reload unless the application supports it.

---

## 2. Secret: sensitive configuration

A **Secret** stores sensitive data such as:

- Database username/password
- API token
- SSH key
- TLS certificate and private key

### ConfigMap versus Secret

| ConfigMap | Secret |
| --- | --- |
| Non-sensitive configuration | Sensitive configuration |
| Log level, environment, URL, port | Password, API key, certificate, token |
| Ordinary text data | Base64-encoded data in YAML `data` field |
| Should not contain credentials | Requires least-privilege access and careful handling |

### Base64 is encoding, not encryption

Kubernetes Secret YAML commonly uses Base64 in its `data` field.

```bash
# Encode without a trailing newline.
printf '%s' 'example-value' | base64

# Decode a Base64 value.
printf '%s' 'ZXhhbXBsZS12YWx1ZQ==' | base64 -d
```

Anyone able to read the encoded YAML can decode it. Therefore:

```text
Base64 != encryption
```

For stronger protection in real clusters, use RBAC, encryption at rest for etcd, and a trusted external secret manager such as AWS Secrets Manager, HashiCorp Vault, or a supported external-secrets system. Never commit real values to Git.

### Secret manifest

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData: # convenient for writing a sample locally; Kubernetes encodes it when stored
  DB_USER: app-user
  DB_PASSWORD: replace-with-a-safe-secret
```

`stringData` is useful when creating a manifest without manually Base64-encoding values. In a repository, keep real secret values out of this file; use a secret manager or secure deployment process.

### Read a Secret value into one environment variable

```yaml
env:
  - name: DATABASE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-secret
        key: DB_PASSWORD
```

### TLS Secret

Ingress TLS normally references a Secret containing a certificate and private key:

```bash
kubectl create secret tls app-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

---

## 3. Ingress: HTTP/HTTPS routing rules

An **Ingress** is a Kubernetes API object that defines how external HTTP/HTTPS requests should go to internal Services.

```text
Browser request
  -> Ingress controller
  -> Ingress host/path rule
  -> Kubernetes Service
  -> selected Pod
```

Ingress does not normally route directly to a Pod or Deployment. It routes to a **Service**.

### Ingress resource versus Ingress controller

| Ingress | Ingress controller |
| --- | --- |
| YAML rule/policy | Running software that reads/enforces the rules |
| Says where `/api` or a host should go | Proxies traffic to the matching Service |
| Does nothing by itself | Required for the Ingress to work |

Common controllers: NGINX Ingress Controller, Traefik, HAProxy, Envoy-based controllers.

For a local Minikube cluster:

```bash
minikube addons enable ingress # install/enable the NGINX Ingress controller
kubectl get pods -n ingress-nginx # verify controller Pods
```

### Path-based routing

One host, different paths, different Services:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.local
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80
```

`/api` is an HTTP request path. It is not a host filesystem path.

### Host-based routing

Different hostnames can go to different Services:

```text
api.example.local     -> backend-service
portal.example.local  -> frontend-service
```

### Path types

- `Prefix`: prefix match, common for paths such as `/api`.
- `Exact`: must match exactly.
- `ImplementationSpecific`: behavior depends on the chosen controller; be careful with controller-specific regular expressions and annotations.

---

## 4. TLS/HTTPS at Ingress

TLS lets a client communicate with the Ingress using HTTPS.

```yaml
spec:
  tls:
    - hosts:
        - app.example.local
      secretName: app-tls
```

The Ingress controller reads the referenced TLS Secret, terminates the encrypted HTTPS client connection, then routes to the internal Service. The connection from Ingress to the Service may be HTTP or HTTPS depending on your configuration.

**MCQ answer:** TLS termination at Ingress provides HTTPS encryption for client connections.

---

## 5. Useful commands

```bash
kubectl get configmaps          # or: kubectl get cm
kubectl get secrets
kubectl get ingress             # or: kubectl get ing

kubectl describe configmap app-config
kubectl describe secret db-secret # metadata only; avoid exposing secret content
kubectl describe ingress app-ingress

kubectl exec POD_NAME -- printenv APP_ENV # verify environment injection
kubectl get pods -n ingress-nginx         # verify controller runs in Minikube
```

---

## 6. Practice questions explained

1. Ingress defines HTTP/HTTPS routes to Services → **A**.
2. Ingress needs an Ingress controller to enforce rules → **D**.
3. ConfigMap stores non-sensitive configuration → **D**.
4. Secret stores sensitive configuration values → **A**.
5. ConfigMap is consumed as env vars or mounted files → **D**.
6. Ingress path matches the HTTP request path → **B**.
7. TLS termination provides HTTPS encryption for clients → **D**.
8. `kubectl get configmaps` lists ConfigMaps → **A**.
9. Base64 is encoding, not encryption → **B**.
10. TLS certificate/key are held by a Secret → **C**.

---

## 7. Fast troubleshooting checklist

| Problem | First checks |
| --- | --- |
| Config value missing in Pod | ConfigMap name/key and `env`/`envFrom` reference; restart after an env-value update |
| Secret value missing | Secret name/key and `secretKeyRef`; confirm correct namespace |
| Ingress has a rule but URL fails | Ensure controller is installed/running; backend Service exists and has endpoints |
| Path goes to wrong backend | Check host, path, `pathType`, and ordering/overlap of rules |
| HTTPS fails | TLS Secret exists in the same namespace and includes matching host certificate/key |
| Ingress shows no address locally | Local cluster setup may need Minikube Ingress addon/tunnel or host-file/DNS configuration |

---

## 8. Last-minute exam memory sheet

- ConfigMap = non-sensitive settings outside the image.
- Secret = sensitive values; Base64 is not encryption.
- ConfigMap/Secret can be injected as environment variables or mounted files.
- Ingress = HTTP/HTTPS host/path rules to Services.
- Ingress controller = active software that enforces Ingress rules.
- Ingress backend = Service, not a direct Pod.
- TLS certificate/key = Secret, commonly `kubernetes.io/tls`.
- `path: /api` = HTTP URL path.
- `kubectl get cm`, `kubectl get secrets`, `kubectl get ingress` = basic listing commands.
