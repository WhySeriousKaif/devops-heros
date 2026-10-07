from app import create_app


def client():
    application = create_app()
    application.config.update(TESTING=True)
    return application.test_client()


def test_home():
    response = client().get("/")
    assert response.status_code == 200
    assert response.get_json()["application"] == "Session 17 DevSecOps Demo"


def test_health():
    response = client().get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "healthy"}


def test_ready():
    response = client().get("/ready")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ready"}


def test_unknown_route():
    response = client().get("/missing")
    assert response.status_code == 404
