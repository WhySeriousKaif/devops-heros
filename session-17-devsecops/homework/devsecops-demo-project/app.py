import os

from flask import Flask, jsonify


def create_app():
    app = Flask(__name__)

    @app.get("/")
    def home():
        return jsonify(
            application="Session 17 DevSecOps Demo",
            message="Build, test, scan, secure, push, and deploy.",
        )

    @app.get("/health")
    def health():
        return jsonify(status="healthy"), 200

    @app.get("/ready")
    def ready():
        return jsonify(status="ready"), 200

    return app


app = create_app()


if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8080"))
    app.run(host=host, port=port, debug=False)
