import json
import logging
from typing import Dict
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from storage.session_store import session_store
from pipeline.feature_extractor import FeatureExtractor
from pipeline.model_service import model_service
from pipeline.openrouter_service import openrouter_service
from schemas.session import TelemetryEvent, StateTimelineSegment

logger = logging.getLogger("humansignal.websocket")

router = APIRouter(tags=["Real-time Telemetry WebSocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, list[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)
        logger.info(f"WebSocket client connected for session {session_id}")

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]
        logger.info(f"WebSocket client disconnected for session {session_id}")

manager = ConnectionManager()

@router.websocket("/ws/session/{session_id}")
@router.websocket("/api/session/ws/{session_id}")
async def websocket_telemetry_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    session = session_store.get_or_create_session(session_id)

    # Send handshake confirmation
    await websocket.send_json({
        "type": "connection_established",
        "session_id": session_id,
        "status": "ready",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_loaded": model_service.is_loaded
    })

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "telemetry")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
                continue

            # Process live telemetry events
            events_data = data.get("events", [])
            if not events_data and "event" in data:
                events_data = [data["event"]]

            if events_data:
                parsed_events = []
                for ev in events_data:
                    try:
                        if isinstance(ev, dict):
                            parsed_events.append(TelemetryEvent(**ev))
                    except Exception as err:
                        logger.debug(f"Event parsing error: {err}")

                if parsed_events:
                    session.add_events(parsed_events)

            # Compute real-time state inference
            duration = session.duration_seconds()
            metrics, features, feature_df = FeatureExtractor.extract(
                events=session.events,
                duration_seconds=duration,
                metric_history=session.metric_snapshots
            )

            predicted_state, confidence, probabilities = model_service.predict(feature_df)

            # Update session history
            session.metric_snapshots.append(metrics.model_dump())
            session.history.append(StateTimelineSegment(
                time_offset_seconds=duration,
                state=predicted_state,
                confidence=confidence
            ))

            actions, note, history_chain = openrouter_service.generate_suggestions(
                state=predicted_state,
                metrics=metrics,
                raw_history=session.history
            )

            # Send real-time state prediction update back through the socket
            await websocket.send_json({
                "type": "live_prediction",
                "session_id": session_id,
                "predicted_state": predicted_state,
                "confidence": confidence,
                "probabilities": probabilities,
                "metrics": metrics.model_dump(),
                "suggested_actions": actions,
                "suggestions_note": note,
                "state_history": history_chain,
                "event_count": len(session.events),
                "duration_seconds": duration,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        manager.disconnect(session_id, websocket)
