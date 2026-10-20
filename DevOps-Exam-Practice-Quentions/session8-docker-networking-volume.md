# MCQs — session8-docker-networking-volume

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. Why use Docker volumes?

A. Increase CPU frequency
B. Disable networking
C. Persist data beyond a container lifecycle
D. Replace container images

### Q2. Which command lists Docker volumes?

A. `docker volumes show`
B. `docker storage ps`
C. `docker volume ls`
D. `docker volume ps`

### Q3. What is a bind mount?

A. A remote Git branch
B. A Kubernetes namespace
C. A host path mounted inside a container
D. An image registry

### Q4. Which Docker network driver is the typical default for standalone containers?

A. overlay
B. macvtap only
C. host-only VM
D. bridge

### Q5. What does a user-defined bridge network provide?

A. Host kernel upgrades
B. Container-to-container name resolution
C. Automatic cloud load balancing
D. Persistent image layers

### Q6. Which flag publishes a container port?

A. `-w`
B. `-e`
C. `-v`
D. `-p`

### Q7. Which command creates a Docker network?

A. `docker net init`
B. `docker bridge build`
C. `docker network create`
D. `docker network push`

### Q8. What is Docker Compose mainly for?

A. Replacing source control
B. Defining and running multi-container applications
C. Managing Linux users
D. Creating DNS root servers

### Q9. Which file is commonly used by Docker Compose?

A. `Chart.yaml`
B. `terraform.tfstate`
C. `Jenkinsfile`
D. `compose.yaml`

### Q10. Which command starts services from a Compose file?

A. `docker compose attach-all`
B. `docker compose init-only`
C. `docker compose up`
D. `docker compose commit`

## Answer key

`1-C, 2-C, 3-C, 4-D, 5-B, 6-D, 7-C, 8-B, 9-D, 10-C`

## Kaif’s revision help

- **Q1:** A container’s writable layer is removed with the container. A named volume lives independently, so database data can survive container replacement.
- **Q2:** Remember the object pattern: `docker network ls` and `docker volume ls`.
- **Q3:** Bind mount = a real folder/file from your laptop appears inside the container. It is very useful during development because edits appear immediately.
- **Q4:** `bridge` is the normal default network for local, standalone Docker containers.
- **Q5:** On a **user-defined** bridge network, containers can reach one another by container name. Example: backend can use `database` as the database host.
- **Q6:** `-p HOST_PORT:CONTAINER_PORT` publishes a container port to your laptop. Example: `-p 8080:80` means browser `localhost:8080` reaches Nginx port `80` in the container.
- **Q7:** Create a custom network with `docker network create app-net`.
- **Q8–Q10:** Compose describes an application with multiple services in one YAML file. `docker compose up -d` creates and starts the stack in the background.

## Practical / lab answer patterns

### Lab 1 — custom network and name-based communication

```bash
# Create a private network for the application.
docker network create app-net

# Run two containers on the same user-defined bridge network.
docker run -dit --name api --network app-net alpine sh
docker run -it --rm --network app-net alpine ping -c 2 api
```

The second container can find `api` by its name because both containers use the same user-defined bridge network.

### Lab 2 — named volume survives container replacement

```bash
# Create storage independent from any one container.
docker volume create db-data

# Mount it where the database stores its files.
docker run -d --name mysql-1 -e MYSQL_ROOT_PASSWORD=example \
  -v db-data:/var/lib/mysql mysql:8.0

# After adding sample data, remove only the container, not the volume.
docker rm -f mysql-1
docker run -d --name mysql-2 -e MYSQL_ROOT_PASSWORD=example \
  -v db-data:/var/lib/mysql mysql:8.0
```

The second container uses the same volume, so the data remains. Never place a real password directly in a committed Compose file.

### Lab 3 — a web service plus database with Compose

```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80" # laptop port : container port
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: example # use a secret in real projects
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

```bash
docker compose up -d      # start services
docker compose ps         # verify service status
docker compose logs       # inspect logs
docker compose down       # stop/remove services; named volumes remain by default
```
