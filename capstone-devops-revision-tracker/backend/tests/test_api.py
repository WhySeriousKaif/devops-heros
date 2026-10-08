import os

import pytest


os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient

from app.db import Base, engine
from app.main import app


@pytest.fixture(autouse=True)
def reset_test_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def topic_payload():
    return {
        "title": "Revise Kubernetes troubleshooting",
        "category": "Kubernetes",
        "priority": "HIGH",
        "status": "NOT_STARTED",
        "notes": "Practice kubectl describe, logs, and events.",
    }


def create_topic(client, payload):
    response = client.post("/api/topics", json=payload)
    assert response.status_code == 201
    return response.json()


def test_root_returns_service_information(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "DevOps Revision Tracker API"


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_readiness_endpoint_checks_database(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "READY"}


def test_create_topic(client, topic_payload):
    topic = create_topic(client, topic_payload)
    assert topic["title"] == topic_payload["title"]
    assert topic["priority"] == "HIGH"
    assert topic["id"] > 0


def test_create_topic_rejects_invalid_priority(client, topic_payload):
    topic_payload["priority"] = "URGENT"
    response = client.post("/api/topics", json=topic_payload)
    assert response.status_code == 422


def test_list_and_get_topics(client, topic_payload):
    created = create_topic(client, topic_payload)
    list_response = client.get("/api/topics")
    get_response = client.get(f"/api/topics/{created['id']}")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1
    assert get_response.json()["category"] == "Kubernetes"


def test_update_topic_status(client, topic_payload):
    created = create_topic(client, topic_payload)
    response = client.put(
        f"/api/topics/{created['id']}", json={"status": "COMPLETED"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"


def test_topic_statistics(client, topic_payload):
    create_topic(client, topic_payload)
    second_topic = topic_payload | {
        "title": "Revise Docker Compose",
        "category": "Docker",
        "status": "COMPLETED",
    }
    create_topic(client, second_topic)
    response = client.get("/api/topics/stats")
    assert response.status_code == 200
    assert response.json() == {
        "total": 2,
        "not_started": 1,
        "in_progress": 0,
        "completed": 1,
    }


def test_delete_topic(client, topic_payload):
    created = create_topic(client, topic_payload)
    delete_response = client.delete(f"/api/topics/{created['id']}")
    get_response = client.get(f"/api/topics/{created['id']}")
    assert delete_response.status_code == 204
    assert get_response.status_code == 404

