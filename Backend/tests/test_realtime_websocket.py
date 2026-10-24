import time
import pytest
from fastapi.testclient import TestClient

def test_websocket_realtime_streaming(client: TestClient):
    session_id = "HS-WS-TEST-99"

    with client.websocket_connect(f"/ws/session/{session_id}") as websocket:
        # 1. Verify connection handshake
        handshake = websocket.receive_json()
        assert handshake["type"] == "connection_established"
        assert handshake["session_id"] == session_id
        assert handshake["status"] == "ready"

        # 2. Ping / Pong
        websocket.send_json({"type": "ping"})
        pong = websocket.receive_json()
        assert pong["type"] == "pong"

        # 3. Stream Telemetry Events
        now = time.time()
        test_events = [
            {"type": "keydown", "timestamp": now + 0.1, "interKeyInterval": 150.0},
            {"type": "keydown", "timestamp": now + 0.25, "interKeyInterval": 140.0},
            {"type": "reaction", "timestamp": now + 0.6, "reactionTimeMs": 230.0},
            {"type": "mousemove", "timestamp": now + 0.8, "cursorVelocity": 450.0, "jitter": 1.1},
        ]

        websocket.send_json({
            "type": "telemetry",
            "events": test_events
        })

        # 4. Receive Live Prediction Update
        prediction_update = websocket.receive_json()
        assert prediction_update["type"] == "live_prediction"
        assert prediction_update["session_id"] == session_id
        assert prediction_update["predicted_state"] in ["Normal", "Focused", "Fatigued", "Overloaded"]
        assert 0.0 <= prediction_update["confidence"] <= 1.0
        assert "metrics" in prediction_update
        assert prediction_update["event_count"] >= len(test_events)
