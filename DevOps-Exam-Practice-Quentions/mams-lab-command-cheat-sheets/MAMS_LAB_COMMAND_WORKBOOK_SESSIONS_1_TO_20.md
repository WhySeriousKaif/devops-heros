# Mam's Lab Command Workbook — Sessions 1 to 20

This workbook contains **only the 60 lab tasks given in Mam's original practice files**, in order. Under each original task, use the command sequence as your practice answer. Replace placeholders such as APP, NAMESPACE, FILE and IMAGE with the names supplied in the exam.

Do not run destructive cleanup commands unless the question asks for them.

---

## Session 1 — DevOps engineer roadmap

### Lab 1

**Mam's task:** Draw a simple CI/CD workflow from code commit to deployment. Label build, test, package, deploy and monitoring stages.

**Submission:** No terminal command is required. Draw:

~~~text
Code commit → Build → Test → Package/container image → Deploy → Monitor
~~~

### Lab 2

**Mam's task:** Compare a monolithic application and a microservices application for an online shopping use case. Identify two operational benefits and two challenges of microservices.

**Submission:** No terminal command is required. Write:

~~~text
Benefits: independent deployment/scaling; team/service ownership.
Challenges: network/observability complexity; distributed data/deployment complexity.
~~~

### Lab 3

**Mam's task:** Create a one-page DevOps roadmap for a small team that deploys manually. Prioritize version control, automated tests, containerization, CI/CD and monitoring.

**Submission:** No terminal command is required. Use:

~~~text
Git → automated tests → Docker → CI/CD → monitoring and alerting
~~~

---

## Session 2 — Linux

### Lab 1

**Mam's task:** Create a project directory with app, logs and config subdirectories. Create sample files and demonstrate listing, copying, moving, searching and deleting files.

~~~bash
mkdir -p exam-project/{app,logs,config}
touch exam-project/app/app.txt exam-project/config/app.conf
ls -R exam-project
cp exam-project/app/app.txt exam-project/logs/app-copy.txt
mv exam-project/logs/app-copy.txt exam-project/logs/app-moved.txt
rg "PATTERN" exam-project
rm exam-project/logs/app-moved.txt
~~~

### Lab 2

**Mam's task:** Create user examuser and group devops. Add the user to the group and configure ownership and permissions on a project directory.

~~~bash
sudo groupadd devops
sudo useradd -m examuser
sudo usermod -aG devops examuser
sudo chown -R examuser:devops exam-project
sudo chmod -R 750 exam-project
id examuser
ls -ld exam-project
~~~

### Lab 3

**Mam's task:** Check Linux service status, inspect logs and document commands used to diagnose a simulated service problem.

~~~bash
systemctl status SERVICE
journalctl -u SERVICE -n 50 --no-pager
ps aux | rg SERVICE
ss -tulpn
~~~

---

## Session 3 — Shell scripting

### Lab 1

**Mam's task:** Write a script that accepts a directory path and displays number of files and subdirectories. Handle missing or invalid argument.

Create count-items.sh:

~~~bash
#!/bin/bash
if [ "$#" -ne 1 ] || [ ! -d "$1" ]; then
  echo "Usage: $0 DIRECTORY" >&2
  exit 1
fi
echo "Files: $(find "$1" -maxdepth 1 -type f | wc -l)"
echo "Directories: $(find "$1" -mindepth 1 -maxdepth 1 -type d | wc -l)"
~~~

~~~bash
chmod +x count-items.sh
./count-items.sh DIRECTORY
~~~

### Lab 2

**Mam's task:** Write a script that checks whether a supplied file exists and is readable, writable and executable.

Create check-file.sh:

~~~bash
#!/bin/bash
file="$1"
[ -e "$file" ] && echo "Exists" || echo "Does not exist"
[ -r "$file" ] && echo "Readable" || echo "Not readable"
[ -w "$file" ] && echo "Writable" || echo "Not writable"
[ -x "$file" ] && echo "Executable" || echo "Not executable"
~~~

~~~bash
chmod +x check-file.sh
./check-file.sh FILE
~~~

### Lab 3

**Mam's task:** Write a reusable system-health script using variables, conditions, loops and functions. Report disk usage, memory and uptime.

Create health.sh:

~~~bash
#!/bin/bash
report() {
  echo "=== $1 ==="
  "$2"
}
for item in disk memory uptime; do
  case "$item" in
    disk) report "Disk" "df";;
    memory) report "Memory" "free";;
    uptime) report "Uptime" "uptime";;
  esac
done
~~~

~~~bash
chmod +x health.sh
./health.sh
~~~

---

## Session 4 — Networking

### Lab 1

**Mam's task:** Display machine IP address, subnet information, default route and listening ports.

~~~bash
ip addr
ip route
ip -4 addr show
ss -tulpn
~~~

### Lab 2

**Mam's task:** Use ping, ss and curl to troubleshoot a web service. Decide whether failure is reachability, closed port or HTTP response.

~~~bash
ping -c 4 HOST
ss -tulpn
curl -I http://HOST:PORT
nc -vz HOST PORT
~~~

### Lab 3

**Mam's task:** Resolve a domain using nslookup or dig, then verify HTTP/HTTPS connectivity.

~~~bash
nslookup DOMAIN
dig DOMAIN
curl -I http://DOMAIN
curl -I https://DOMAIN
~~~

---

## Session 5 — Git and GitHub

### Lab 1

**Mam's task:** Create a Git repository, add README, make at least three meaningful commits and push it to GitHub.

~~~bash
mkdir exam-git && cd exam-git
git init
echo "# Exam project" > README.md
git add README.md
git commit -m "Add README"
# Edit/add one meaningful file, then repeat the following twice.
git add FILE
git commit -m "Describe change"
git remote add origin REPOSITORY_URL
git branch -M main
git push -u origin main
git log --oneline
~~~

### Lab 2

**Mam's task:** Create a feature branch, implement change, push branch and merge it into main through Pull Request after reviewing diff.

~~~bash
git switch -c feature-name
# Edit FILE.
git add FILE
git commit -m "Add feature"
git push -u origin feature-name
git diff main...feature-name
# Create/review/merge Pull Request in GitHub.
git switch main
git pull origin main
~~~

### Lab 3

**Mam's task:** Create merge conflict by editing same line on two branches. Resolve it, commit resolution and verify history.

~~~bash
git switch -c branch-one
# Edit same line in FILE.
git add FILE && git commit -m "Change from branch one"
git switch main
git switch -c branch-two
# Edit the same line differently.
git add FILE && git commit -m "Change from branch two"
git merge branch-one
# Edit conflict markers in FILE and keep intended final text.
git add FILE
git commit -m "Resolve merge conflict"
git log --oneline --graph --all
~~~

---

## Sessions 6–7 — Docker

### Lab 1

**Mam's task:** Run Nginx with host port 8080 mapped to container port 80. Verify curl access and inspect logs.

~~~bash
docker run -d --name exam-nginx -p 8080:80 nginx:alpine
curl -I http://localhost:8080
docker logs exam-nginx
docker ps
~~~

### Lab 2

**Mam's task:** Create Dockerfile for simple HTML page using FROM, WORKDIR, COPY and CMD. Build, run and verify it.

Create index.html and Dockerfile:

~~~dockerfile
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY index.html .
CMD ["nginx", "-g", "daemon off;"]
~~~

~~~bash
docker build -t exam-web:1.0 .
docker run -d --name exam-web -p 8080:80 exam-web:1.0
curl http://localhost:8080
docker logs exam-web
~~~

### Lab 3

**Mam's task:** Add .dockerignore and environment variable to Docker build. Rebuild/run image and explain purpose.

Create .dockerignore:

~~~text
.git
node_modules
*.log
~~~

~~~dockerfile
FROM nginx:alpine
ENV APP_ENV=production
WORKDIR /usr/share/nginx/html
COPY index.html .
CMD ["nginx", "-g", "daemon off;"]
~~~

~~~bash
docker build -t exam-web:2.0 .
docker run -d --name exam-web-v2 -p 8081:80 exam-web:2.0
docker exec exam-web-v2 printenv APP_ENV
curl http://localhost:8081
~~~

---

## Session 8 — Docker networking, volumes and Compose

### Lab 1

**Mam's task:** Create custom Docker network, run two containers on it and demonstrate name-based communication.

~~~bash
docker network create exam-net
docker run -d --name web --network exam-net nginx:alpine
docker run --rm --network exam-net busybox:1.36 ping -c 2 web
docker network inspect exam-net
~~~

### Lab 2

**Mam's task:** Run database with named volume, create sample data, remove/recreate container and verify data persists.

~~~bash
docker volume create db-data
docker run -d --name exam-db -e POSTGRES_PASSWORD=samplepass \
  -v db-data:/var/lib/postgresql/data postgres:16
docker exec -it exam-db psql -U postgres -c "CREATE TABLE demo(id int);"
docker rm -f exam-db
docker run -d --name exam-db -e POSTGRES_PASSWORD=samplepass \
  -v db-data:/var/lib/postgresql/data postgres:16
docker exec -it exam-db psql -U postgres -c "\dt"
~~~

### Lab 3

**Mam's task:** Write compose.yaml for web application and database. Start stack, verify service communication, inspect logs and shut it down.

~~~bash
docker compose up -d --build
docker compose ps
docker compose logs --tail=50
docker compose exec WEB_SERVICE sh
docker compose down
~~~

---

## Session 9 — Kubernetes fundamentals

### Lab 1

**Mam's task:** Connect to Kubernetes cluster and inspect nodes, namespaces and cluster resources.

~~~bash
kubectl config current-context
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
kubectl get pods -A
~~~

### Lab 2

**Mam's task:** Deploy simple web application and inspect it using get, describe and logs. Confirm healthy state.

~~~bash
kubectl create deployment exam-web --image=nginx:alpine -n default
kubectl get deployment,pods -n default
kubectl describe deployment exam-web -n default
kubectl logs deployment/exam-web -n default
kubectl rollout status deployment/exam-web -n default
~~~

### Lab 3

**Mam's task:** Identify API Server, Scheduler, Controller Manager, etcd, kubelet and kubectl in a cluster architecture diagram.

**Submission:** No terminal command is required. Draw:

~~~text
kubectl → API Server → etcd
                 ↓
    Scheduler / Controller Manager
                 ↓
 Worker Node: kubelet → container runtime
~~~

---

## Session 10 — Kubernetes core objects

### Lab 1

**Mam's task:** Create Nginx Pod and inspect status, labels, IP address and logs.

~~~bash
kubectl run nginx-pod --image=nginx:alpine --labels=app=nginx
kubectl get pod nginx-pod --show-labels -o wide
kubectl describe pod nginx-pod
kubectl logs nginx-pod
~~~

### Lab 2

**Mam's task:** Create Deployment with two replicas, scale to five, then back to two. Verify after each step.

~~~bash
kubectl create deployment exam-app --image=nginx:alpine
kubectl scale deployment exam-app --replicas=2
kubectl get deployment,pods
kubectl scale deployment exam-app --replicas=5
kubectl get deployment,pods
kubectl scale deployment exam-app --replicas=2
kubectl get deployment,pods
~~~

### Lab 3

**Mam's task:** Deploy app version 1, rolling update to version 2, verify rollout, then roll back to version 1.

~~~bash
kubectl create deployment exam-app --image=nginx:1.25
kubectl set image deployment/exam-app nginx=nginx:1.27
kubectl rollout status deployment/exam-app
kubectl rollout history deployment/exam-app
kubectl rollout undo deployment/exam-app
kubectl rollout status deployment/exam-app
~~~

---

## Session 11 — Kubernetes Services

### Lab 1

**Mam's task:** Deploy multiple replicas and create ClusterIP Service selecting correct Pods. Verify endpoints.

~~~bash
kubectl create deployment exam-app --image=nginx:alpine
kubectl scale deployment exam-app --replicas=3
kubectl expose deployment exam-app --name=exam-service --port=80 --target-port=80
kubectl get svc exam-service
kubectl get endpoints exam-service
kubectl get pods --show-labels
~~~

### Lab 2

**Mam's task:** Create NodePort Service and demonstrate access through exposed node port.

~~~bash
kubectl expose deployment exam-app --name=exam-nodeport \
  --type=NodePort --port=80 --target-port=80
kubectl get svc exam-nodeport
minikube service exam-nodeport --url
~~~

### Lab 3

**Mam's task:** Configure Service with different port and targetPort. Verify traffic reaches intended container port.

~~~bash
kubectl expose deployment exam-app --name=exam-service \
  --port=80 --target-port=8080
kubectl get svc exam-service -o yaml
kubectl get endpoints exam-service
kubectl port-forward svc/exam-service 8080:80
~~~

---

## Session 12 — Ingress, ConfigMaps and Secrets

### Lab 1

**Mam's task:** Deploy application and configure Ingress rule routing host or URL path to correct Service.

~~~bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl get ingress
kubectl describe ingress INGRESS_NAME
~~~

### Lab 2

**Mam's task:** Create ConfigMap, inject values into Deployment environment variables and verify inside Pod.

~~~bash
kubectl create configmap app-config --from-literal=APP_ENV=production
kubectl apply -f deployment.yaml
kubectl get configmap app-config -o yaml
kubectl get pods
kubectl exec POD_NAME -- printenv APP_ENV
~~~

### Lab 3

**Mam's task:** Create Secret for sample credential and consume it from Pod without hard-coding credential in Deployment manifest.

~~~bash
kubectl create secret generic app-secret --from-literal=DB_PASSWORD='sample-value'
kubectl apply -f deployment.yaml
kubectl describe secret app-secret
kubectl get pods
kubectl exec POD_NAME -- printenv DB_PASSWORD
~~~

---

## Session 13 — Storage, HPA and probes

### Lab 1

**Mam's task:** Create PVC, mount into Pod, write file, recreate Pod and verify file remains.

~~~bash
kubectl apply -f pvc.yaml
kubectl get pvc
kubectl apply -f pod.yaml
kubectl exec POD_NAME -- sh -c "echo saved > /data/message.txt"
kubectl delete pod POD_NAME
kubectl apply -f pod.yaml
kubectl exec POD_NAME -- cat /data/message.txt
~~~

### Lab 2

**Mam's task:** Configure readiness and liveness probes. Demonstrate reaction when app is not ready or unhealthy.

~~~bash
kubectl apply -f deployment-with-probes.yaml
kubectl get pods
kubectl describe pod POD_NAME
kubectl get endpoints SERVICE_NAME
kubectl get events --sort-by=.lastTimestamp
~~~

### Lab 3

**Mam's task:** Configure HPA with CPU requests, generate load, observe scaling and document prerequisites.

~~~bash
kubectl apply -f deployment-with-cpu-request.yaml
kubectl autoscale deployment APP --cpu-percent=50 --min=1 --max=5
kubectl get hpa
kubectl top pods
kubectl describe hpa APP
~~~

Prerequisite: Metrics Server must be available; CPU requests must be defined.

---

## Session 14 — Kubernetes troubleshooting

### Lab 1

**Mam's task:** Deploy invalid image, diagnose ImagePullBackOff with get, describe and events, then correct image.

~~~bash
kubectl apply -f bad-image.yaml
kubectl get pods
kubectl describe pod POD_NAME
kubectl get events --sort-by=.lastTimestamp
kubectl set image deployment/APP CONTAINER=nginx:alpine
kubectl rollout status deployment/APP
~~~

### Lab 2

**Mam's task:** Diagnose CrashLoopBackOff with logs and describe. Identify root cause, fix configuration and verify recovery.

~~~bash
kubectl get pods
kubectl describe pod POD_NAME
kubectl logs POD_NAME
kubectl logs POD_NAME -p
kubectl apply -f fixed-deployment.yaml
kubectl rollout status deployment/APP
kubectl get pods
~~~

### Lab 3

**Mam's task:** Create Service with incorrect selector. Use labels, selectors, endpoints and Service configuration to fix it.

~~~bash
kubectl get pods --show-labels
kubectl get svc SERVICE_NAME -o yaml
kubectl get endpoints SERVICE_NAME
kubectl label pod POD_NAME app=correct-value --overwrite
kubectl apply -f fixed-service.yaml
kubectl get endpoints SERVICE_NAME
~~~

---

## Session 15 — Helm

### Lab 1

**Mam's task:** Create Helm chart for simple web application. Explain Chart.yaml, values.yaml and templates directory.

~~~bash
helm create exam-chart
find exam-chart -maxdepth 2 -type f
helm lint ./exam-chart
~~~

### Lab 2

**Mam's task:** Deploy chart with configurable image, replica count and Service port. Verify rendered and installed resources.

~~~bash
helm template exam-release ./exam-chart \
  --set image.repository=nginx --set replicaCount=2 --set service.port=80
helm install exam-release ./exam-chart \
  --set image.repository=nginx --set replicaCount=2 --set service.port=80
helm status exam-release
kubectl get deployment,pods,svc
~~~

### Lab 3

**Mam's task:** Upgrade Helm release, inspect revision history and roll back to previous revision. Verify final status.

~~~bash
helm upgrade exam-release ./exam-chart --set replicaCount=3
helm history exam-release
helm rollback exam-release 1
helm status exam-release
~~~

---

## Session 16 — GitHub Actions

### Lab 1

**Mam's task:** Create GitHub Actions workflow on push that checks out repository, installs dependencies and builds application.

Create .github/workflows/ci.yml:

~~~yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
~~~

~~~bash
git add .github/workflows/ci.yml
git commit -m "Add build workflow"
git push
~~~

### Lab 2

**Mam's task:** Add automated test step. Show failing test fails workflow and corrected test passes.

Add this step after dependency installation:

~~~yaml
      - run: npm test
~~~

~~~bash
git add .github/workflows/ci.yml
git commit -m "Add automated tests"
git push
~~~

### Lab 3

**Mam's task:** Extend workflow to upload build artifact and make it downloadable from Actions run.

Add this step after build:

~~~yaml
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
~~~

---

## Session 17 — DevSecOps

### Lab 1

**Mam's task:** Create CI/CD pipeline that builds Docker image and pushes it to registry using repository secrets.

Relevant GitHub Actions steps:

~~~yaml
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: REPOSITORY_ACTOR
          password: GITHUB_TOKEN_SECRET
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/OWNER/IMAGE:COMMIT_SHA
~~~

### Lab 2

**Mam's task:** Add SAST, dependency scanning and secret scanning. Configure required security check to block later stages when it fails.

~~~yaml
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bandit -r . -ll
      - run: pip-audit -r requirements.txt
      - run: gitleaks detect --no-git --redact

  deploy:
    needs: security
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy only after security passes"
~~~

### Lab 3

**Mam's task:** Add container vulnerability scan and gate deployment when agreed severity threshold is exceeded.

~~~bash
docker build -t app:scan .
trivy image --severity HIGH,CRITICAL --exit-code 1 app:scan
~~~

The deployment job must use needs: security-or-scan-job so it cannot run after a failed scan.

---

## Session 18 — Terraform and IaC

### Lab 1

**Mam's task:** Write Terraform provider/resource configuration. Run fmt, init, validate and plan, then explain output.

~~~bash
terraform fmt -recursive
terraform init
terraform validate
terraform plan
~~~

### Lab 2

**Mam's task:** Use variables and outputs. Pass variable through .tfvars and print useful output after apply.

~~~bash
terraform plan -var-file=dev.tfvars
terraform apply -var-file=dev.tfvars
terraform output
terraform output OUTPUT_NAME
~~~

### Lab 3

**Mam's task:** Modify resource configuration, inspect plan, and explain state mapping. Do not commit secrets or state.

~~~bash
# Edit the Terraform resource configuration.
terraform plan
terraform state list
terraform state show RESOURCE_ADDRESS
git status
~~~

---

## Session 19 — Cloud and Terraform

### Lab 1

**Mam's task:** Design cloud network with VPC/VNet, public/private subnets, route tables and security rules. Submit diagram and traffic flow.

**Submission:** No terminal command is required. Draw:

~~~text
Internet → Internet Gateway → public subnet/web tier
Private subnet/app or database tier has no direct Internet Gateway route
Route tables direct traffic; Security Groups allow only needed ports
~~~

### Lab 2

**Mam's task:** Use Terraform to provision small cloud network and low-cost compute in sandbox. Plan before apply and destroy resources afterward.

~~~bash
aws sts get-caller-identity
terraform fmt -recursive
terraform init
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform output
terraform plan -destroy
terraform destroy
~~~

### Lab 3

**Mam's task:** Configure security group/firewall to permit only required application port. Demonstrate SSH/admin is not open to entire internet.

~~~bash
aws ec2 describe-security-groups --group-ids SECURITY_GROUP_ID --region REGION
aws ec2 describe-security-group-rules \
  --filters Name=group-id,Values=SECURITY_GROUP_ID --region REGION
~~~

Expected rule principle: permit required app port only, restrict SSH port 22 to a trusted IP/CIDR rather than 0.0.0.0/0.

---

## Session 20 — Monitoring, observability and GitOps

### Lab 1

**Mam's task:** Expose application metrics and configure Prometheus to scrape them. Verify healthy target and identify at least two metrics.

~~~bash
# Start supplied monitoring environment if the lab provides it.
docker compose up -d
docker compose ps
~~~

PromQL to enter in Prometheus:

~~~promql
up{job="demo-app"}
app_health{job="demo-app"}
rate(app_requests_total{job="demo-app"}[1m])
~~~

### Lab 2

**Mam's task:** Create Grafana dashboard panels for request rate, errors and latency, or use supplied metrics. Explain each.

PromQL panels:

~~~promql
rate(app_requests_total{job="demo-app"}[1m])
rate(app_errors_total{job="demo-app"}[1m])
rate(app_request_duration_seconds_sum{job="demo-app"}[1m])
rate(app_request_duration_seconds_count{job="demo-app"}[1m])
~~~

### Lab 3

**Mam's task:** Configure basic GitOps deployment with Argo CD or supplied GitOps environment. Change desired replica count in Git and verify cluster reconciliation.

~~~bash
# Register the Argo CD Application once.
kubectl apply -f argocd-application.yaml
kubectl get applications -n argocd

# Edit Deployment replicas in Git, then commit desired state.
git diff
git add PATH/TO/deployment.yaml
git commit -m "Scale application replicas"
git push

# Verify Argo CD reconciles the cluster.
kubectl get deployment,pods -n NAMESPACE
kubectl get deployment -n NAMESPACE -w
~~~
