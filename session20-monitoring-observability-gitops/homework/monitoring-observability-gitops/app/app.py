#!/usr/bin/env python3
"""Small dependency-free application used by the Session 20 monitoring lab."""

from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
import json
import os
import resource
import sys
import time


STARTED_AT = time.time()
READY = True
REQUESTS = 0
ERRORS = 0
DURATION_SUM = 0.0


def metric_snapshot() -> str:
    """Return application and process metrics in Prometheus text format."""
    max_rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    memory_bytes = max_rss if sys.platform == "darwin" else max_rss * 1024
    return f"""# HELP app_info Static information about the demo application.
# TYPE app_info gauge
app_info{{version=\"1.0.0\"}} 1
# HELP app_health Whether the application is ready to serve traffic.
# TYPE app_health gauge
app_health {1 if READY else 0}
# HELP app_requests_total Total HTTP requests handled by the application.
# TYPE app_requests_total counter
app_requests_total {REQUESTS}
# HELP app_errors_total Total simulated HTTP errors.
# TYPE app_errors_total counter
app_errors_total {ERRORS}
# HELP app_request_duration_seconds_sum Total request handling time.
# TYPE app_request_duration_seconds_sum counter
app_request_duration_seconds_sum {DURATION_SUM:.6f}
# HELP app_request_duration_seconds_count Number of timed requests.
# TYPE app_request_duration_seconds_count counter
app_request_duration_seconds_count {REQUESTS}
# HELP process_cpu_seconds_total Total user and system CPU time.
# TYPE process_cpu_seconds_total counter
process_cpu_seconds_total {time.process_time():.6f}
# HELP process_resident_memory_bytes Resident memory used by the process.
# TYPE process_resident_memory_bytes gauge
process_resident_memory_bytes {memory_bytes}
# HELP process_uptime_seconds Time since the process started.
# TYPE process_uptime_seconds gauge
process_uptime_seconds {time.time() - STARTED_AT:.3f}
"""


class Handler(BaseHTTPRequestHandler):
    server_version = "Session20Demo/1.0"

    def log_message(self, fmt: str, *args: object) -> None:
        event = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "level": "INFO",
            "client": self.client_address[0],
            "message": fmt % args,
        }
        print(json.dumps(event), flush=True)

    def send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, indent=2).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        global READY, REQUESTS, ERRORS, DURATION_SUM
        parsed = urlparse(self.path)

        if parsed.path == "/metrics":
            body = metric_snapshot().encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; version=0.0.4")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        started = time.perf_counter()
        REQUESTS += 1
        status = 200
        payload = {"service": "session20-demo", "status": "ok"}

        if parsed.path == "/healthz":
            payload = {"status": "alive"}
        elif parsed.path == "/readyz":
            status = 200 if READY else 503
            payload = {"status": "ready" if READY else "not-ready"}
        elif parsed.path == "/error":
            ERRORS += 1
            status = 500
            payload = {"status": "error", "message": "simulated failure"}
        elif parsed.path == "/work":
            milliseconds = min(int(parse_qs(parsed.query).get("ms", ["100"])[0]), 2000)
            deadline = time.perf_counter() + milliseconds / 1000
            while time.perf_counter() < deadline:
                pass
            payload = {"status": "ok", "cpu_work_ms": milliseconds}
        elif parsed.path == "/admin/ready":
            READY = parse_qs(parsed.query).get("value", ["1"])[0] not in {"0", "false"}
            payload = {"status": "ready" if READY else "not-ready", "ready": READY}
        elif parsed.path not in {"/", "/api"}:
            status = 404
            payload = {"status": "not-found", "path": parsed.path}

        DURATION_SUM += time.perf_counter() - started
        self.send_json(status, payload)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    print(json.dumps({"level": "INFO", "message": "application started", "port": port}), flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
