from app import greeting


def test_greeting_message():
    assert greeting() == "Hello from the Session 16 CI/CD demo!"


def test_greeting_mentions_session():
    assert "Session 16" in greeting()


def test_greeting_mentions_cicd():
    assert "CI/CD" in greeting()
