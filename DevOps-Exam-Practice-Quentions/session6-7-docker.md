# MCQs — session6-7-docker

**10 multiple-choice questions | 1 mark each | Answer key at the end**

### Q1. What is a Docker image?

A. A running virtual machine only
B. A Git branch
C. A DNS record
D. A read-only template for creating containers

### Q2. Which command builds an image from a Dockerfile?

A. docker start
B. docker logs
C. docker build
D. docker exec

### Q3. Which Dockerfile instruction sets the base image?

A. COPY
B. CMD
C. EXPOSE
D. FROM

### Q4. Which Dockerfile instruction copies files into an image?

A. USER
B. WORKDIR
C. COPY
D. RUN

### Q5. Which command lists running containers?

A. docker images
B. docker ps
C. docker build
D. docker pull

### Q6. What does docker run -p 8080:80 map?

A. A volume to port 80
B. Host port 80 to container port 8080
C. Host port 8080 to container port 80
D. Two host ports together

### Q7. What does docker logs show?

A. Container standard output and error
B. Registry credentials
C. Git commit history
D. Host kernel source

### Q8. Which command executes a command inside a running container?

A. docker exec
B. docker save
C. docker tag
D. docker push

### Q9. What is the purpose of .dockerignore?

A. Block network access
B. Ignore runtime errors
C. Exclude paths from the build context
D. Hide containers from ps

### Q10. Which Dockerfile instruction defines a default command?

A. LABEL
B. ARG
C. EXPOSE
D. CMD

---

## Answer Key

1-D, 2-C, 3-D, 4-C, 5-B, 6-C, 7-A, 8-A, 9-C, 10-D

---

## Practical / Lab Questions (Exam Style)

**Suggested format:** Complete the task in the relevant lab environment, submit commands/configuration files, and include brief evidence of verification. Do not hard-code credentials.

### Lab 1
Run an Nginx container with host port 8080 mapped to container port 80. Verify access using curl and inspect the container logs.

### Lab 2
Create a Dockerfile for a simple HTML page using FROM, WORKDIR, COPY, and CMD. Build the image, run it, and verify the page.

### Lab 3
Add a .dockerignore file and an environment variable to the Docker build. Rebuild and run the image, then explain the purpose of each added instruction.


---

## Kaif’s revision help — Docker Fundamentals focus for Session 6

The original file combines Sessions 6 and 7. For Session 6, prioritise Questions 1–10 below and normal Docker fundamentals. The Session 7 extension adds multi-stage builds and deeper image optimisation.

| Question | Correct answer | Why |
|---|---|---|
| Q1 | D | A Docker image is a read-only template used to create containers. |
| Q2 | C | `docker build` builds an image from a Dockerfile. |
| Q3 | D | `FROM` chooses the base image. |
| Q4 | C | `COPY` transfers files from build context into the image. |
| Q5 | B | `docker ps` lists running containers. |
| Q6 | C | `-p 8080:80` maps host port 8080 to container port 80. |
| Q7 | A | `docker logs` reads container standard output and standard error. |
| Q8 | A | `docker exec` runs a command inside a running container. |
| Q9 | C | `.dockerignore` excludes paths from build context. |
| Q10 | D | `CMD` provides a default startup command/arguments. |

### Practical-lab answer approach

```bash
docker run -d --name nginx-exam -p 8080:80 nginx:alpine
# -d runs in background; host 8080 forwards to container 80

curl -I http://localhost:8080  # verify HTTP response
docker logs nginx-exam         # inspect container output
docker ps                      # prove the container is running
```

Minimal HTML Dockerfile:

```dockerfile
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY index.html .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t html-exam:1.0 .
docker run -d --name html-exam -p 8080:80 html-exam:1.0
```

Use `.dockerignore` to exclude files such as `.git/`, `node_modules/`, `*.log`, and `.env`. Do not put secrets in images.
