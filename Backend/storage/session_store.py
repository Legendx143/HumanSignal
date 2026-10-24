import time
from typing import Dict, List, Optional
from datetime import datetime, timezone
from schemas.session import TelemetryEvent, StateTimelineSegment, BehavioralState

class SessionData:
    def __init__(self, session_id: str, task_type: str = "comprehensive", context: str = "Standard Task"):
        self.session_id = session_id
        self.task_type = task_type
        self.context = context
        self.start_timestamp = time.time()
        self.start_iso = datetime.now(timezone.utc).isoformat()
        self.end_iso: Optional[str] = None
        self.status = "active"
        self.events: List[TelemetryEvent] = []
        self.history: List[StateTimelineSegment] = []
        self.metric_snapshots: List[Dict] = []

    def add_events(self, new_events: List[TelemetryEvent]):
        self.events.extend(new_events)

    def duration_seconds(self) -> int:
        return max(5, int(time.time() - self.start_timestamp))

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, SessionData] = {}

    def create_session(self, session_id: str, task_type: str = "comprehensive", context: str = "Standard Task") -> SessionData:
        session = SessionData(session_id=session_id, task_type=task_type, context=context)
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[SessionData]:
        return self._sessions.get(session_id)

    def get_or_create_session(self, session_id: str) -> SessionData:
        if session_id not in self._sessions:
            return self.create_session(session_id)
        return self._sessions[session_id]

    def end_session(self, session_id: str) -> Optional[SessionData]:
        session = self._sessions.get(session_id)
        if session:
            session.status = "completed"
            session.end_iso = datetime.now(timezone.utc).isoformat()
        return session

session_store = SessionStore()
