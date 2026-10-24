from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field, ConfigDict

BehavioralState = Literal["Normal", "Focused", "Fatigued", "Overloaded"]

class StartSessionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    consent: bool = Field(..., description="User explicit consent for timing telemetry")
    task_type: Optional[str] = Field("comprehensive", alias="taskType", description="Type of task: typing, reaction, mouse, comprehensive")
    context: Optional[str] = Field("Standard Task", description="Self-reported context")
    session_id: Optional[str] = Field(None, alias="sessionId", description="Optional client-provided anonymous session ID")

class StartSessionResponse(BaseModel):
    session_id: str
    start_time: str
    status: str = "active"

class TelemetryEvent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: str = Field(..., description="Event type: keydown, keyup, pause, correction, reaction, mousemove, mouseclick")
    timestamp: float
    duration: Optional[float] = None
    interKeyInterval: Optional[float] = Field(None, alias="inter_key_interval")
    reactionTimeMs: Optional[float] = Field(None, alias="reaction_time_ms")
    cursorVelocity: Optional[float] = Field(None, alias="cursor_velocity")
    jitter: Optional[float] = None
    isError: Optional[bool] = Field(None, alias="is_error")

class EventBatchRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    session_id: str = Field(..., alias="sessionId")
    events: List[TelemetryEvent]

class EventBatchResponse(BaseModel):
    accepted: int
    window_status: str

class PredictRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    session_id: str = Field(..., alias="sessionId")

class SessionMetrics(BaseModel):
    typing_speed_wpm: int
    mean_response_time_ms: int
    pause_count: int
    mean_iki_ms: int
    std_iki_ms: int
    std_rt_ms: int
    error_rate: float
    keys_per_sec: float
    mouse_speed_mean: int
    mouse_jitter: float
    max_pause_ms: int

class EngineeredFeatures(BaseModel):
    std_rt_ms_z: float
    std_rt_ms_roll_mean_30s: float
    std_rt_ms: float
    std_iki_ms_z: float
    mean_rt_ms_z: float
    mouse_jitter_roll_mean_30s: float
    std_iki_ms: float
    mean_iki_ms_z: float
    mouse_jitter_z: float
    mouse_speed_mean_roll_mean_30s: float
    mouse_jitter: float
    error_rate_roll_mean_30s: float
    mean_rt_ms_roll_mean_30s: float
    keys_per_sec_z: float
    max_pause_ms_roll_mean_30s: float
    mouse_speed_mean_z: float
    mouse_speed_mean: float
    keys_per_sec_roll_mean_30s: float
    mean_rt_ms: float
    pause_count_roll_mean_30s: float

class PredictResponse(BaseModel):
    session_id: str
    predicted_state: BehavioralState
    confidence: float
    probabilities: Dict[str, float]
    window_start: str
    window_duration_seconds: int
    metrics: SessionMetrics
    features: EngineeredFeatures
    suggested_actions: List[str] = Field(default_factory=list)
    suggestions_note: str = "Suggestions generated through OpenRouter when Fatigued or Overloaded persists."
    state_history: List[str] = Field(default_factory=list)

class StateTimelineSegment(BaseModel):
    time_offset_seconds: int
    state: BehavioralState
    confidence: float

class SessionSummaryResponse(BaseModel):
    session_id: str
    status: str
    start_time: str
    end_time: str
    total_duration_seconds: int
    overall_state: BehavioralState
    overall_confidence: float
    final_metrics: SessionMetrics
    timeline: List[StateTimelineSegment]
    features: EngineeredFeatures
    suggested_actions: List[str] = Field(default_factory=list)
    suggestions_note: str = "Suggestions generated through OpenRouter when Fatigued or Overloaded persists."
    state_history: List[str] = Field(default_factory=list)

class EndSessionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    session_id: str = Field(..., alias="sessionId")

class EndSessionResponse(BaseModel):
    session_id: str
    status: str = "completed"
