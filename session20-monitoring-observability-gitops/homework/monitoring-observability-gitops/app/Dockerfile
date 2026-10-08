FROM python:3.13-alpine

WORKDIR /app
COPY app.py .

EXPOSE 8080
USER 65534:65534

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1

CMD ["python", "-u", "app.py"]
