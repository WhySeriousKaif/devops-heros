# Docker Fundamentals — Complete Beginner Notes

These are Session 6 learning notes based on the Docker Fundamentals transcript, class files, and completed homework. They explain the concepts first, then show the commands and exam-style questions.

## 1. Why Docker exists

An application often works on one laptop but fails elsewhere because the other machine has a different runtime version, missing dependency, operating system setting, or configuration. This is the classic **“works on my machine”** problem.

Docker packages an application together with the environment it needs to run: its runtime, dependencies, files, and startup command. The package can then run consistently on another machine that has Docker.

Example:

- Your Node.js application works with Node 18.
- A teammate has Node 20 and gets dependency errors.
- A Docker image can specify `node:18-alpine`, so both machines run the same Node environment.

---

## 2. What is a container?

A **container** is an isolated running process created from an image. It shares the host machine's kernel but has its own filesystem view, process space, networking, and configuration.

Containers are lightweight compared with virtual machines because they do not each include a full guest operating system.

### Container versus virtual machine

| Container | Virtual machine |
|---|---|
| Shares host OS kernel | Has its own guest OS |
| Usually starts in seconds | Usually takes longer to boot |
| Smaller and lighter | Larger and uses more resources |
| Good for packaging/running applications | Good for running a full separate operating system |

Containers are not tiny VMs. They are isolated application processes.

---

## 3. Docker architecture

```text
You / Docker CLI or Docker Desktop
              ↓ command
Docker daemon (Docker Engine)
              ↓ creates/manages
Images, containers, networks, volumes
              ↕ pulls/pushes
Registry (for example Docker Hub)
```

- **Docker client:** the `docker` command or Docker Desktop interface you use.
- **Docker daemon/Engine:** background service that builds images and runs containers.
- **Registry:** online storage for images. Docker Hub is the common public registry.
- **Repository:** collection of image versions under one name, such as `nginx`.
- **Tag:** version/variant label, such as `nginx:latest` or `node:18-alpine`.

---

## 4. Four core Docker objects

### Image

An **image** is an immutable template used to create containers. It contains the application files, required runtime, dependencies, and default startup instructions.

Examples: `nginx:latest`, `python:3.11-slim`, `node:18-alpine`.

### Container

A **container** is a running or stopped instance created from an image. You can create multiple containers from one image.

Analogy: image = recipe; container = cooked meal made from that recipe.

### Volume

A **volume** stores persistent data outside the container's writable layer. Use it for data that must survive container removal, such as database files.

### Network

A **Docker network** lets containers communicate safely by name and isolates their traffic from unrelated containers.

For this session, know the definitions. Volumes and networking become more important in later Docker/Compose work.

---

## 5. Image lifecycle and container lifecycle

### Image lifecycle

```text
Dockerfile or registry image → docker build / docker pull → local image → docker run
```

### Container lifecycle

```text
docker run → created and running
docker stop → stopped / exited
docker start → running again
docker rm → removed
```

Useful commands:

```bash
docker ps                 # only running containers
docker ps -a              # running + stopped containers
docker stop CONTAINER
docker start CONTAINER
docker restart CONTAINER
docker rm CONTAINER       # remove stopped container
docker rm -f CONTAINER    # force stop + remove
```

A container remains running while its main process (PID 1 inside the container) runs. If that process exits, the container exits too.

**Important correction:** `docker stop` stops a container; it does not pause it. `docker pause` is a separate command that temporarily freezes processes.

---

## 6. Images: pull, list, build, remove

```bash
docker pull nginx
docker pull nginx:alpine
docker image ls
docker images             # common older equivalent
docker image inspect nginx:latest
docker rmi IMAGE
```

- `docker pull nginx` normally pulls `nginx:latest` when no tag is written.
- Always prefer a deliberate version tag in real projects, for example `python:3.11-slim`, instead of relying on `latest`.
- `docker build` creates an image from a Dockerfile.

```bash
docker build -t nginx-hello:1.0 .
```

- `-t` gives the image a readable name/tag.
- `.` is the **build context**: the current folder whose files Docker may use in `COPY` instructions.

---

## 7. Run a container and port mapping

Basic form:

```bash
docker run IMAGE
```

Useful form:

```bash
docker run -d --name web -p 8080:80 nginx:alpine
```

Breakdown:

| Part | Meaning |
|---|---|
| `docker run` | Creates a new container from an image and starts it. |
| `-d` | Detached mode: run in background. |
| `--name web` | Gives the container a fixed friendly name. |
| `-p 8080:80` | Host port 8080 forwards to container port 80. |
| `nginx:alpine` | Image and tag to use. |

Open `http://localhost:8080` to reach Nginx.

### Host port versus container port

```text
Browser → localhost:8080  ── Docker port mapping ──> container:80
```

In `-p HOST_PORT:CONTAINER_PORT`, the left number is on your laptop/server and the right number is inside the container.

Examples from the completed homework:

| App | Container port | Host port | Open in browser |
|---|---:|---:|---|
| Node.js | 3000 | 3000 | `http://localhost:3000` |
| Python | 5000 | 5001 | `http://localhost:5001` |
| Java | 8080 | 8080 | `http://localhost:8080` |
| Apache | 80 | 8081 | `http://localhost:8081` |
| Nginx | 80 | 8082 | `http://localhost:8082` |

**MCQ trap:** `EXPOSE 80` in a Dockerfile documents the intended container port. It does **not** publish it to your host. Publishing happens with `docker run -p 8080:80`.

---

## 8. Useful container commands

```bash
docker ps
docker ps -a
docker logs CONTAINER
docker logs -f CONTAINER
docker exec -it CONTAINER sh
docker exec -it CONTAINER bash
docker inspect CONTAINER
docker port CONTAINER
docker cp local.txt CONTAINER:/app/local.txt
docker cp CONTAINER:/app/output.txt ./output.txt
```

- `docker logs` reads standard output/error from the container.
- `docker logs -f` follows new logs live.
- `docker exec -it` runs a command inside a currently running container.
- Alpine images often have `sh`, but may not have `bash`.
- `docker inspect` gives detailed JSON configuration such as IP, mounts, and port bindings.

---

## 9. Dockerfile: what it is

A **Dockerfile** is a text file containing ordered instructions for building an image. Each major instruction often forms a cached image layer.

Example Nginx site:

```dockerfile
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EXPOSE 80
```

Build and run it:

```bash
docker build -t nginx-hello .
docker run -d --name nginx-hello -p 8080:80 nginx-hello
```

### Core Dockerfile instructions

| Instruction | Meaning | Example |
|---|---|---|
| `FROM` | Selects base image. Required first instruction in most Dockerfiles. | `FROM python:3.11-slim` |
| `WORKDIR` | Sets working folder for later instructions. Creates it if needed. | `WORKDIR /app` |
| `COPY` | Copies files from build context into image. | `COPY app.py .` |
| `RUN` | Executes a build-time command to create the image layer. | `RUN pip install -r requirements.txt` |
| `ENV` | Sets environment variable in image/container. | `ENV APP_ENV=production` |
| `ARG` | Build-time variable, available while building. | `ARG NODE_VERSION=20` |
| `EXPOSE` | Documents intended container port. | `EXPOSE 3000` |
| `CMD` | Default command/arguments when container starts. | `CMD ["python", "app.py"]` |
| `ENTRYPOINT` | Fixed executable for container startup. | `ENTRYPOINT ["python"]` |

### A simple Python application image

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
```

Read it as: start with Python → work in `/app` → copy dependency list → install dependencies → copy code → document port → start app.

### `COPY` versus `ADD`

- Prefer `COPY` for normal local files. It is explicit and predictable.
- `ADD` has extra features such as automatic archive extraction. In modern Dockerfiles, prefer `COPY` unless you specifically need an `ADD` feature.

---

## 10. CMD versus ENTRYPOINT

Both define what should run when the container starts.

- `CMD` provides default command or default arguments. It is easy to replace by giving a command at the end of `docker run`.
- `ENTRYPOINT` defines the primary executable. It is harder to replace, though Docker permits override with `--entrypoint`.

Example:

```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```

By default it runs `python app.py`.

```bash
docker run IMAGE other.py
```

This replaces the `CMD` argument with `other.py`, so it runs `python other.py`.

**Exam shortcut:** CMD = default/replaceable command; ENTRYPOINT = primary fixed executable.

---

## 11. Docker build cache and `.dockerignore`

Docker reuses unchanged layers during a build. This makes builds faster.

For a Node project, copy package files and install dependencies before copying the rest of the source:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

If only application code changes, Docker can often reuse the earlier dependency-install layer.

Create `.dockerignore` to keep unnecessary or secret files out of the build context:

```text
node_modules/
.git/
.env
*.log
```

Never copy secrets such as `.env` files or private keys into an image.

---

## 12. Volumes: persistence in one minute

Container writable data is temporary. If you remove a container, data written only inside it is usually lost.

```bash
docker volume create postgres-data
docker run -d --name db -v postgres-data:/var/lib/postgresql/data postgres:16
docker volume ls
```

Here `postgres-data` persists database files even when the `db` container is replaced.

Use a **bind mount** when you deliberately map a local folder during development:

```bash
docker run -v "$(pwd)":/app IMAGE
```

For now, remember: image = template; container = running instance; volume = persistent data.

---

## 13. Beginner troubleshooting

### Problem: `port is already allocated`

Another container or local app already uses the host port.

```bash
docker ps
docker stop OLD_CONTAINER
# Or choose a different host port:
docker run -d -p 8081:80 nginx
```

### Problem: container exits immediately

```bash
docker ps -a
docker logs CONTAINER
```

Likely reasons: the startup command failed, the application crashed, or the main process finished.

### Problem: site does not open but container is running

```bash
docker ps
docker logs CONTAINER
docker port CONTAINER
curl -I http://localhost:HOST_PORT
```

Check that:

1. You used `-p HOST:CONTAINER`.
2. The container port is the one the application really listens on.
3. The application binds to `0.0.0.0` inside the container, not only `127.0.0.1`.
4. No firewall/security rule blocks outside traffic when running on a server.

### Problem: `docker build` cannot find a copied file

Check that you run the build from the correct directory, the file is inside the build context, and `.dockerignore` is not excluding it.

---

## 14. Safe cleanup

```bash
docker container prune     # remove stopped containers; asks for confirmation
docker image prune         # remove dangling unused images; asks for confirmation
docker system df           # inspect Docker disk use
```

Be cautious with broad cleanup commands such as `docker system prune -a` or commands that remove every image/container. They can delete local images, stopped containers, and caches you may still need.

---

## 15. Exam-style questions with answers

### Q1. Why use Docker?

**Answer:** Docker packages an application with its required runtime and dependencies so it runs consistently across environments, avoiding many “works on my machine” problems.

### Q2. Image versus container?

**Answer:** An image is the immutable template; a container is a running or stopped instance created from that image.

### Q3. Container versus virtual machine?

**Answer:** A container shares the host kernel and is lighter/faster; a VM includes a full guest OS and uses more resources.

### Q4. What does `docker build -t app:1.0 .` do?

**Answer:** It builds an image from the Dockerfile in the current build context and tags it `app:1.0`.

### Q5. Explain `docker run -d -p 8080:80 nginx`.

**Answer:** It creates/runs an Nginx container in background and forwards host port 8080 to port 80 inside the container.

### Q6. Difference between `docker ps` and `docker ps -a`?

**Answer:** `docker ps` shows only running containers; `docker ps -a` includes stopped/exited containers.

### Q7. What does `EXPOSE 3000` do?

**Answer:** It documents the application's intended container port. It does not itself publish the port to the host.

### Q8. Which Dockerfile instruction selects a base image?

**Answer:** `FROM`.

### Q9. Which instruction executes while building an image?

**Answer:** `RUN`, for example `RUN npm install`.

### Q10. CMD versus ENTRYPOINT?

**Answer:** CMD gives a default command/arguments that can be replaced at runtime; ENTRYPOINT defines the primary executable and is normally fixed.

### Q11. What command reads a failed container's output?

**Answer:** `docker logs CONTAINER_NAME_OR_ID`.

### Q12. Why use a volume?

**Answer:** To persist important data outside a container so it survives container removal/replacement.

---

## 16. Final memory map

```text
Docker solves environment/dependency consistency problems
Image = immutable template; container = running instance
Registry = image storage; Docker Hub is common registry
docker pull = download image
docker build = make image from Dockerfile
docker run = create + start container
docker ps = running; docker ps -a = all containers
docker logs = inspect app output
docker exec -it = run a command inside running container
-p HOST:CONTAINER maps ports
FROM base image; WORKDIR folder; COPY files; RUN build step
CMD default start command; ENTRYPOINT primary executable
EXPOSE documents port; it does not publish it
Volume = persistent data; network = container communication
```
