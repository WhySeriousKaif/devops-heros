# Session 8 — Docker Networking, Volumes & Compose

## What this session is about

Until Session 7, you learned how to build and run one container. Real applications usually have several containers: a frontend, a backend API, and a database. Session 8 explains how they **communicate**, how database data **survives**, and how Docker Compose starts the whole application together.

Think of it like this:

- **Network** = private roads between containers.
- **Port publishing** = a gate from your laptop/browser into a container.
- **Volume** = storage that remains after a container is deleted.
- **Compose** = one YAML plan for a multi-container application.

---

## 1. Docker networking

Every container has its own network environment. Containers should not automatically be able to access every other container. Docker networks decide who can communicate.

### The four network drivers to remember

| Driver | Meaning | Best exam memory point |
| --- | --- | --- |
| `bridge` | Private Docker network on one host | Default choice for local standalone containers |
| `host` | Container shares the host machine’s network | No Docker network isolation or normal `-p` mapping |
| `none` | Container gets no external network connectivity | Used to isolate a container |
| `overlay` | Network spanning multiple Docker hosts | Used with Docker Swarm / multi-host setups |

### Bridge network: the usual local default

When you run a normal container locally, Docker uses a bridge network. The container can use its own port 80, but that does **not** make it available in your browser yet.

```bash
# Nginx listens on port 80 inside its own container network.
docker run -d --name web nginx:alpine
```

To access it from your Mac, publish a port:

```bash
# Browser localhost:8080 goes to port 80 inside the container.
docker run -d --name web -p 8080:80 nginx:alpine
```

Open `http://localhost:8080`.

### `EXPOSE` versus `-p`: common MCQ trap

- `EXPOSE 80` in a Dockerfile is metadata/documentation that says the application uses port 80.
- `-p 8080:80` actually publishes/maps a port from the host to the container.

So, **EXPOSE does not by itself make a website accessible from your browser.**

### User-defined bridge networks and names

Create a custom network when application containers need to talk safely to each other:

```bash
# Create a private application network.
docker network create app-net

# Both containers join the same network.
docker run -dit --name backend --network app-net alpine sh
docker run -it --rm --network app-net alpine ping -c 2 backend
```

The important point is that a container on a **user-defined bridge network** can use another container’s name (`backend`) as its address. This is Docker’s built-in DNS/name resolution.

### Three-tier application example

For a frontend, backend, and database:

```text
frontend  <-->  backend  <-->  database
```

Good design is not to put every component on one network:

```text
frontend -- frontend-net -- backend -- backend-net -- database
```

The backend joins both networks. The frontend can reach the backend, and the backend can reach the database; the frontend cannot directly reach the database. This is network isolation and follows least privilege.

```bash
docker network create frontend-net
docker network create backend-net
docker run -dit --name frontend --network frontend-net alpine sh
docker run -dit --name backend --network frontend-net alpine sh
docker network connect backend-net backend # backend now has both networks
docker run -dit --name database --network backend-net alpine sh
```
a
### Inspecting a network

```bash
docker network ls                 # list networks
docker network inspect app-net    # see containers, IP addresses, and settings
docker inspect backend            # see which networks one container joined
docker network rm app-net         # remove an unused network
```

### Host network: why `-p` is not needed

With `--network host`, the container shares the **host machine's network namespace**. In simple words, the application running in the container uses the host's network directly.

```bash
# Nginx listens on port 80 directly through the host network.
docker run -d --name nginx-host --network host nginx:alpine
```

On a native Linux host, if Nginx listens on port `80`, you access it on port `80` of that Linux host. Docker does not need to translate or forward a host port to a separate container port.

```text
Bridge network:
browser -> host port 8080 -> Docker port forwarding/NAT -> container port 80

Host network:
browser -> host port 80 -> Nginx process in the container
```

Therefore, this is unnecessary with host networking:

```bash
# Do not combine this as the normal approach for host networking.
docker run --network host -p 8080:80 nginx:alpine
```

Use this comparison in an exam:

| Bridge | Host |
| --- | --- |
| Container has a separate private network | Container uses the host network directly |
| Usually needs `-p HOST_PORT:CONTAINER_PORT` for browser access | Normal port publishing is not needed |
| Docker performs port forwarding/NAT | No separate Docker bridge/NAT path |
| Multiple containers can use their own internal port 80 | Only one application can use host port 80 at one time |
| Better isolation for ordinary local applications | Less isolation; use deliberately |

**Important:** `host` network does not mean the container has no security concerns. Because it uses the host's network directly, a port collision can occur. For example, if Apache already uses port 80 on the host, an Nginx host-network container cannot also bind port 80.

**macOS/Windows note:** Docker Desktop runs containers in a Linux VM, so host-network behavior can differ from a native Linux server. For the exam, remember the core concept: **host networking shares the host network and removes the usual bridge/NAT port-mapping requirement.**

### None and overlay networks

- `--network none`: disables external/container connectivity. A `ping google.com` from it fails by design. Use it when a container must be isolated.
- Overlay: connects containers across multiple Docker hosts; normally needs Docker Swarm. It is not needed for ordinary local Docker practice.

---

## 2. Docker volumes: persistent storage

### Why volume storage is necessary

Container data is temporary. If you write a file inside a container, then delete that container, the file is gone. That is dangerous for a database containing accounts, orders, or revision topics.

**A named Docker volume has its own lifecycle, separate from the container.** Delete and recreate the container with the same volume, and the data remains.

### Named volume commands

```bash
docker volume create my-data       # create persistent Docker-managed storage
docker volume ls                   # list volumes
docker volume inspect my-data      # show volume details
docker volume rm my-data           # permanently delete the stored data
```

### Mounting a named volume

```bash
# Syntax: -v VOLUME_NAME:PATH_INSIDE_CONTAINER
docker run -dit --name data-one -v my-data:/data alpine sh

# Create data inside the mounted /data path.
docker exec data-one sh -c 'echo "hello students" > /data/data.txt'

# Delete the container, then create a different one using the same volume.
docker rm -f data-one
docker run -dit --name data-two -v my-data:/data alpine sh
docker exec data-two cat /data/data.txt
```

The final command still shows `hello students`. The data belongs to `my-data`, not to either container.

### Database example

```bash
# MySQL stores its database files in /var/lib/mysql.
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=example \
  -v mysql-data:/var/lib/mysql mysql:8.0
```

In an exam answer, say: **Mount the named volume at the database’s data directory so data survives container replacement.**

### Named volume versus bind mount

| Named Docker volume$$ | Bind mount |
| --- | --- |
| Managed by Docker | A specific file/folder from your laptop |
| Best for database/application data | Best for source code and local development |
| Docker chooses its host location | You explicitly provide the host path |
| Syntax: `my-data:/data` | Syntax: `$(pwd)/site:/usr/share/nginx/html` |

### Bind mount: immediate file changes

```bash
# Create a local website folder.
mkdir -p site
echo '<h1>Hello students</h1>' > site/index.html

# Mount the local folder into Nginx’s website location.
docker run -d --name nginx-bind -p 8085:80 \
  -v "$(pwd)/site:/usr/share/nginx/html" nginx:alpine
```

Visit `http://localhost:8085`. Then edit `site/index.html` on your laptop. The browser updates without rebuilding the image or restarting the container because the container is reading the same host folder.

**Exam memory line:** a bind mount connects a host path to a path inside a container.

---

## 3. Docker Compose

### Why Compose exists

Running every service using separate long `docker run` commands is repetitive and easy to get wrong. Docker Compose defines all services, networks, volumes, ports, and environment variables in one file—normally `compose.yaml`.

```text
compose.yaml  ->  frontend + backend + database + networks + volumes
```

### Basic Compose file

```yaml
services:
  frontend:
    image: nginx:alpine
    ports:
      - "8080:80" # host port : container port

  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: example # use secrets in a real project
    volumes:
      - db-data:/var/lib/mysql

volumes:
  db-data:
```

### Essential Compose commands

```bash
docker compose up -d       # create/start the whole stack in background
docker compose ps          # list service containers and status
docker compose logs        # view all logs
docker compose logs backend # view one service’s logs
docker compose down        # stop and remove the stack’s containers/networks
```

`docker compose down` normally does **not** remove named volumes. Using `docker compose down -v` removes them too—be careful because that can destroy database data.

### Important Compose fields

| Field | What it does |
| --- | --- |
| `services` | Defines each container/service |
| `image` | Image to run |
| `build` | Build an image from a local Dockerfile context |
| `ports` | Publishes ports, e.g. `"8080:80"` |
| `environment` | Passes environment variables to a container |
| `volumes` | Attaches named volumes or bind mounts |
| `networks` | Puts services on selected networks |
| `depends_on` | Starts a dependency before the service; it does not prove the dependency is ready to accept traffic |

### Multi-network Compose architecture

```yaml
services:
  frontend:
    image: nginx:alpine
    networks: [frontend-net]

  backend:
    build: ./backend
    networks: [frontend-net, backend-net]
    depends_on: [database]

  database:
    image: mysql:8.0
    networks: [backend-net]
    volumes: [db-data:/var/lib/mysql]

networks:
  frontend-net:
  backend-net:

volumes:
  db-data:
```

This means frontend → backend and backend → database work, while frontend → database is separated. Inside Compose, the backend should use hostname `database`, not `localhost`, because `localhost` means the backend container itself.

---

## 4. Practice questions explained

1. **Why are volumes used?** To persist data beyond container lifecycle → **C**.
2. **List volumes:** `docker volume ls` → **C**.
3. **Bind mount:** a host path mounted into a container → **C**.
4. **Default standalone driver:** bridge → **D**.
5. **User-defined bridge advantage:** container-name resolution → **B**.
6. **Port publishing flag:** `-p` → **D**.
7. **Create a network:** `docker network create` → **C**.
8. **Compose purpose:** define/run a multi-container app → **B**.
9. **Common Compose filename:** `compose.yaml` → **D**.
10. **Start Compose services:** `docker compose up` → **C**.

---

## 5. Fast troubleshooting checklist

| Problem | First check |
| --- | --- |
| Browser cannot open web app | `docker ps`, then confirm `-p HOST:CONTAINER` mapping |
| One container cannot reach another | Check `docker network inspect NETWORK`; ensure both are on the required network |
| Backend cannot connect to database | Use service/container name (`database`), not `localhost` |
| Database data vanished | Confirm a named volume is mounted at the correct DB data path |
| Bind-mounted web change not shown | Confirm the local path and container target path are correct |
| Compose stack fails | `docker compose ps` and `docker compose logs SERVICE` |

---

## 6. Last-minute exam memory sheet

- **Bridge** = default private network for local containers.
- **Host** = shares host network; no normal `-p` mapping; beware port conflicts.
- **None** = isolated/no network.
- **Overlay** = multi-host network, usually Swarm.
- **`-p 8080:80`** = host port 8080 → container port 80.
- **`EXPOSE`** documents a port; it does not publish it.
- **Named volume** = Docker-managed persistent data.
- **Bind mount** = host file/folder mounted in container; edits appear live.
- **`docker volume ls`** and **`docker network ls`** list the two object types.
- **User-defined bridge** = containers can resolve each other by name.
- **Compose** = YAML definition and lifecycle tool for multi-container apps.
- **`docker compose up -d`** starts; **`docker compose down`** stops/removes the stack.
