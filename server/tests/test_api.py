from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_reports_mock_provider():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok", "provider": "mock"}


def test_act_returns_done_action_for_toy_page():
    resp = client.post(
        "/v1/act",
        json={
            "url": "https://mock.sih/toy.html",
            "dom": [
                {"tag": "input", "id": "email"},
                {"tag": "button", "text": "Submit"},
            ],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["actions"][0]["type"] == "done"
    assert body["meta"]["url"] == "https://mock.sih/toy.html"


def test_act_rejects_malformed_dom_node():
    resp = client.post(
        "/v1/act",
        json={"url": "https://mock.sih/toy.html", "dom": [{"nope": True}]},
    )
    assert resp.status_code == 422
