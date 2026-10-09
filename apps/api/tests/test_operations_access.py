"""Operations endpoints must reject unauthenticated access before database access."""
from fastapi.testclient import TestClient
from app.main import app

def test_operations_disabled_without_server_token(monkeypatch):
    monkeypatch.delenv("CHE_OPERATIONS_API_TOKEN", raising=False)
    client = TestClient(app)
    assert client.get("/api/operations/branches/00000000-0000-0000-0000-000000000001/orders").status_code == 503
    assert client.patch("/api/operations/orders/TEST-1/status", json={"status":"CONFIRMED"}).status_code == 503

def test_operations_reject_unauthenticated_requests(monkeypatch):
    monkeypatch.setenv("CHE_OPERATIONS_API_TOKEN", "a"*48)
    client = TestClient(app)
    assert client.get("/api/operations/branches/00000000-0000-0000-0000-000000000001/orders").status_code == 401
    assert client.patch("/api/operations/orders/TEST-1/status", json={"status":"CONFIRMED"}).status_code == 401

def test_operations_reject_wrong_token(monkeypatch):
    monkeypatch.setenv("CHE_OPERATIONS_API_TOKEN", "a"*48)
    client = TestClient(app)
    assert client.get("/api/operations/branches/00000000-0000-0000-0000-000000000001/orders",headers={"Authorization":"Bearer "+"b"*48}).status_code == 401
