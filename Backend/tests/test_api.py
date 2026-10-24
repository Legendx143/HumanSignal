import time
import pytest
from fastapi.testclient import TestClient

def test_root_endpoint(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["model_loaded"] is True
    assert set(data["classes"]) == {"Normal", "Focused", "Fatigued", "Overloaded"}
    assert data["features_count"] == 20

def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_ready"] is True
    assert len(data["features"]) == 20

def test_start_session_requires_consent(client: TestClient):
    response = client.post("/api/session/start", json={
        "consent": False,
        "taskType": "comprehensive"
    })
    assert response.status_code == 400
    assert "Consent is mandatory" in response.json()["detail"]

def test_session_lifecycle_complete(client: TestClient):
    # 1. Start Session
    start_resp = client.post("/api/session/start", json={
        "consent": True,
        "taskType": "comprehensive",
        "context": "Automated Backend Test",
        "sessionId": "HS-TEST-001"
    })
    assert start_resp.status_code == 200
    start_data = start_resp.json()
    assert start_data["session_id"] == "HS-TEST-001"
    assert start_data["status"] == "active"

    # 2. Ingest Events
    now = time.time()
    events = [
        {"type": "keydown", "timestamp": now + 0.1, "interKeyInterval": 140.0},
        {"type": "keydown", "timestamp": now + 0.25, "interKeyInterval": 150.0},
        {"type": "keydown", "timestamp": now + 0.38, "interKeyInterval": 130.0},
        {"type": "reaction", "timestamp": now + 0.8, "reactionTimeMs": 220.0},
        {"type": "reaction", "timestamp": now + 1.2, "reactionTimeMs": 240.0},
        {"type": "mousemove", "timestamp": now + 1.5, "cursorVelocity": 380.0, "jitter": 1.4},
        {"type": "mousemove", "timestamp": now + 1.6, "cursorVelocity": 410.0, "jitter": 1.2},
    ]

    events_resp = client.post("/api/session/events", json={
        "sessionId": "HS-TEST-001",
        "events": events
    })
    assert events_resp.status_code == 200
    events_data = events_resp.json()
    assert events_data["accepted"] == len(events)
    assert events_data["window_status"] == "buffered"

    # 3. Predict State
    pred_resp = client.post("/api/session/predict", json={
        "sessionId": "HS-TEST-001"
    })
    assert pred_resp.status_code == 200
    pred_data = pred_resp.json()
    assert pred_data["session_id"] == "HS-TEST-001"
    assert pred_data["predicted_state"] in ["Normal", "Focused", "Fatigued", "Overloaded"]
    assert 0.0 <= pred_data["confidence"] <= 1.0
    assert set(pred_data["probabilities"].keys()) == {"Normal", "Focused", "Fatigued", "Overloaded"}
    assert "metrics" in pred_data
    assert "features" in pred_data
    assert pred_data["metrics"]["mean_response_time_ms"] > 0
    assert "suggested_actions" in pred_data
    assert len(pred_data["suggested_actions"]) >= 3
    assert "OpenRouter" in pred_data["suggestions_note"]
    assert "state_history" in pred_data
    assert len(pred_data["state_history"]) >= 1

    # 4. Summary
    sum_resp = client.get("/api/session/HS-TEST-001/summary")
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert sum_data["session_id"] == "HS-TEST-001"
    assert sum_data["overall_state"] in ["Normal", "Focused", "Fatigued", "Overloaded"]
    assert len(sum_data["timeline"]) >= 1
    assert "suggested_actions" in sum_data
    assert len(sum_data["suggested_actions"]) >= 3
    assert "state_history" in sum_data

    # 5. End Session
    end_resp = client.post("/api/session/end", json={
        "sessionId": "HS-TEST-001"
    })
    assert end_resp.status_code == 200
    assert end_resp.json()["status"] == "completed"
