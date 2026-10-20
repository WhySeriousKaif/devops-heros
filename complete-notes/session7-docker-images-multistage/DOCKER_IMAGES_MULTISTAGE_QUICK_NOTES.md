# Docker Images & Multi-Stage Dockerfiles — Session 7 Quick Notes

This is a continuation of Session 6. It intentionally does **not** repeat Docker basics such as why Docker exists, image/container definitions, basic lifecycle, or normal port mapping.

Read Session 6 first if you need those foundations: `complete-notes/session6-docker-fundamentals/`.

## 1. Images are immutable: what that means in practice

A Docker image is treated as a fixed, read-only build artifact. If you edit your source code after building an image, an existing container does not automatically receive those edits.

Correct workflow after code/Dockerfile changes:

```bash
docker build -t my-app:1.1 .    # build a new image version from changed files
docker run -d --name my-app -p 8080:3000 my-app:1.1  # create a new container
```

Think of an image as a saved application package. To change the package, build a new version; then run a new container from it.

### Tags

```text
repository:tag
node:20-alpine
nginx:1.27-alpine
my-app:1.0
```

- A tag labels an image version or variant.
- If no tag is supplied, Docker normally assumes `latest`.
- In real projects, prefer a specific version tag instead of relying on `latest`, because `latest` can change later.

```bash
docker build -t my-app:1.0 .   # name an image with a version tag
docker image ls                # list images and tags stored locally
```

---

## 2. `docker create` versus `docker run`

`docker run` creates **and starts** a container in one command.

```bash
docker run -d --name web -p 8080:80 nginx:alpine  # create + start
```

`docker create` creates the container but leaves it stopped until you start it.

```bash
docker create --name web -p 8080:80 nginx:alpine  # create only
docker start web                                  # start existing container
```

Use `docker create` when you want to inspect/configure a container before starting it. For normal development use, `docker run` is more common.

---

## 3. Entering a running container: `docker exec`

Use `docker exec` to run a command **inside a container that is already running**.

```bash
docker ps                         # find running container name or ID
docker exec -it web sh            # open interactive shell in Alpine-based container
docker exec -it web bash          # use Bash only if Bash exists in the image
docker exec web ls /app           # run one command without opening a shell
```

Command breakdown:

- `exec` = execute an extra command in an existing running container.
- `-i` = keep standard input open.
- `-t` = allocate a terminal.
- `sh` or `bash` = the shell to start.

Why use it? To inspect files, check environment values, run a one-time diagnostic command, or verify what is inside a container.

**Exam trap:** `docker exec` does not start a stopped container. Use `docker start` first.

---

## 4. Docker disk usage and safe cleanup

Docker can consume a lot of disk space through stopped containers, unused image layers, build cache, volumes, and networks.

```bash
docker system df                  # show Docker disk usage by images, containers, volumes, cache
docker container prune            # remove stopped containers; asks confirmation
docker image prune                # remove dangling/unused image layers; asks confirmation
docker system prune               # broader cleanup of stopped containers, unused networks, dangling images, cache
```

### Important terms

- A **dangling image** usually has no repository/tag reference, often left after rebuilds.
- A **stopped container** is no longer running but may still be listed by `docker ps -a`.
- A stopped/unused container is not automatically a “zombie process.” A zombie process is an operating-system process state; do not use the words as synonyms in an exam answer.

Use cleanup commands carefully. `docker system prune -a` is more aggressive and can remove unused images you may want to keep. Do not run cleanup blindly on a project you still need.

---

## 5. ENV versus ARG

Both hold values, but they exist at different times.

| Item | Available when? | Example |
|---|---|---|
| `ARG` | During image build | Select a build version or option. |
| `ENV` | In the built image and at container runtime | Set application environment such as `NODE_ENV=production`. |

Example:

```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=production
```

Build with a different build argument:

```bash
docker build --build-arg NODE_VERSION=22 -t my-node-app .
# --build-arg supplies ARG while building the image
```

Pass/override an environment variable while running:

```bash
docker run -e NODE_ENV=development my-node-app
# -e sets an environment variable in this container
```

**Memory rule:** ARG = build time; ENV = runtime environment too.

Never place passwords, API keys, or tokens in `ARG` or `ENV` values that become part of an image/history. Use a proper secrets mechanism in real deployments.

---

## 6. Run containers as a non-root user

Many container images start as `root` unless the Dockerfile changes the user. Root inside a container can still be dangerous if the container is misconfigured or compromised.

Use the `USER` instruction to run the application with lower privileges:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["node", "server.js"]
```

Meaning:

- `addgroup` and `adduser` create a dedicated low-privilege account.
- `USER appuser` makes later runtime commands run as that user.
- This follows the security principle of least privilege.

Check the user from a running container:

```bash
docker exec web whoami            # shows current user inside container
```

---

## 7. Multi-stage Dockerfile: the main new concept

A **multi-stage build** uses more than one `FROM` instruction in one Dockerfile.

Why? Development/build tools can be large: compilers, test tools, `node_modules`, package caches, and source files. A production container often needs only the final compiled output and the small runtime needed to serve it.

```text
Stage 1: Builder  → install/build tools → create final artifact
Stage 2: Runtime  → copy only final artifact → run application
```

### Minimal example: static site

```dockerfile
# Stage 1: builder
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: production runtime
FROM nginx:alpine
COPY --from=builder /build/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

How to read it:

1. `AS builder` gives the first stage a name.
2. The first stage installs dependencies and creates the output folder (`dist` in this example).
3. The second `FROM` begins a clean, smaller image.
4. `COPY --from=builder SOURCE DESTINATION` copies only the needed output from the first stage.
5. Nginx serves the final static files; the bulky Node build tooling is absent from the final image.

### Build and run

```bash
docker build -t frontend:1.0 .              # build multi-stage image
docker run -d --name frontend -p 8080:80 frontend:1.0
# host port 8080 → Nginx container port 80
curl -I http://localhost:8080               # verify HTTP response
```

### Homework example

The submitted homework used a builder stage named `builder`, then a small `nginx:alpine` runtime stage:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /build
RUN echo "<h1>Hello World from Docker multi-stage build</h1>" > index.html

FROM nginx:alpine
COPY --from=builder /build/index.html /usr/share/nginx/html/index.html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

The key multi-stage syntax to memorise is:

```dockerfile
FROM BUILD_IMAGE AS builder
# build something
FROM RUNTIME_IMAGE
COPY --from=builder /path/to/output /destination
```

---

## 8. Why multi-stage builds matter

| Without multi-stage build | With multi-stage build |
|---|---|
| Final image may include compilers, test tools, caches, and build dependencies. | Final image contains only the needed runtime/artifacts. |
| Larger image to transfer and store. | Smaller image. |
| More software may mean more security exposure. | Smaller attack surface. |
| Build and runtime concerns mixed together. | Build and runtime clearly separated. |

Exam answer: Multi-stage Dockerfiles reduce final image size and attack surface by copying only required build artifacts into the production stage.

---

## 9. Session 7 command mini-reference

```bash
docker create --name app IMAGE        # create stopped container
docker start app                      # start an existing stopped container
docker exec -it app sh                # enter a running container using sh
docker exec app whoami                # run one command inside running container
docker system df                      # inspect Docker disk use
docker container prune                # remove stopped containers
docker image prune                    # remove dangling images
docker build --build-arg KEY=VALUE -t image:tag .
# provide an ARG while building and name the result
docker run -e KEY=VALUE image:tag     # set ENV value at runtime
docker build -t multistage-app .      # build from multi-stage Dockerfile
```

---

## 10. Exam questions

### Q1. Why must an image be rebuilt after source code changes?

**Answer:** An image is a fixed build artifact. Existing images and containers do not automatically include later source-file changes.

### Q2. What is the difference between `docker create` and `docker run`?

**Answer:** `docker create` creates a stopped container; `docker run` creates and immediately starts it.

### Q3. What does `docker exec -it web sh` do?

**Answer:** It opens an interactive `sh` shell inside the already running container named `web`.

### Q4. ARG versus ENV?

**Answer:** ARG is mainly available during image build; ENV is available to the container at runtime as an environment variable.

### Q5. Why use `USER appuser` in a Dockerfile?

**Answer:** To run the application as a non-root user, reducing the impact of a security compromise.

### Q6. What is the key syntax of a multi-stage Dockerfile?

**Answer:** Use `FROM ... AS builder`, then another `FROM ...`, then `COPY --from=builder ...` to transfer only required artifacts.

### Q7. What is a dangling image?

**Answer:** An image layer with no repository/tag reference, often left after rebuilds; `docker image prune` can remove it.

## Final memory map

```text
Image changed? rebuild it, then run a new container
docker create = create stopped; docker run = create + start
docker exec = work inside a running container
docker system df = Docker disk usage
container prune = stopped containers; image prune = dangling images
ARG = build time; ENV = runtime too
USER = run application as non-root
multi-stage = builder stage + clean runtime stage
AS builder + COPY --from=builder are the two key multi-stage pieces
```
