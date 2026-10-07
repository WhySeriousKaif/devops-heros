import os
from http.server import BaseHTTPRequestHandler, HTTPServer


def greeting():
    return "Hello from the Session 16 CI/CD demo!"


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self._send_response(200, greeting())
        elif self.path == "/health":
            self._send_response(200, "OK")
        else:
            self._send_response(404, "Not Found")

    def _send_response(self, status_code, body):
        payload = body.encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format, *args):
        return


def main():
    port = int(os.environ.get("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"Session 16 demo is running on port {port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
