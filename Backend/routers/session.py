from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from schemas.session import (
    StartSessionRequest,
    StartSessionResponse,
    EventBatchRequest,
    EventBatchResponse,
    PredictRequest,
    PredictResponse,
    SessionSummaryResponse,
    EndSessionRequest,
    EndSessionResponse,
    StateTimelineSegment,
)
from storage.session_store import session_store
from pipeline.feature_extractor import FeatureExtractor
from pipeline.model_service import model_service
from pipeline.openrouter_service import openrouter_service

router = APIRouter(prefix="/session", tags=["Session Telemetry & AI Prediction"])

@router.post("/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    if not req.consent:
        raise HTTPException(status_code=400, detail="Consent is mandatory to begin behavioral telemetry")

    session_id = req.session_id or f"HS-{datetime.now(timezone.utc).strftime('%M%S')}-ANON"
    session = session_store.create_session(
        session_id=session_id,
        task_type=req.task_type or "comprehensive",
        context=req.context or "Standard Task"
    )

    return StartSessionResponse(
        session_id=session.session_id,
        start_time=session.start_iso,
        status="active"
    )

@router.post("/events", response_model=EventBatchResponse)
def receive_events(req: EventBatchRequest):
    session = session_store.get_or_create_session(req.session_id)
    session.add_events(req.events)

    return EventBatchResponse(
        accepted=len(req.events),
        window_status="buffered"
    )

@router.post("/predict", response_model=PredictResponse)
def predict_state(req: PredictRequest):
    session = session_store.get_or_create_session(req.session_id)
    duration = session.duration_seconds()

    # 1. Extract 20 engineered features from buffered browser events
    metrics, features, feature_df = FeatureExtractor.extract(
        events=session.events,
        duration_seconds=duration,
        metric_history=session.metric_snapshots
    )

    # 2. Execute AI Model Inference
    predicted_state, confidence, probabilities = model_service.predict(feature_df)

    # 3. Save snapshot into session history
    session.metric_snapshots.append(metrics.model_dump())
    session.history.append(StateTimelineSegment(
        time_offset_seconds=duration,
        state=predicted_state,
        confidence=confidence
    ))

    # 4. Generate OpenRouter suggestions & state progression history
    actions, note, history_chain = openrouter_service.generate_suggestions(
        state=predicted_state,
        metrics=metrics,
        raw_history=session.history
    )

    return PredictResponse(
        session_id=session.session_id,
        predicted_state=predicted_state,
        confidence=confidence,
        probabilities=probabilities,
        window_start=datetime.now(timezone.utc).isoformat(),
        window_duration_seconds=10,
        metrics=metrics,
        features=features,
        suggested_actions=actions,
        suggestions_note=note,
        state_history=history_chain
    )

@router.get("/{session_id}/summary", response_model=SessionSummaryResponse)
def get_session_summary(session_id: str):
    session = session_store.get_session(session_id)
    if not session:
        session = session_store.get_or_create_session(session_id)

    duration = session.duration_seconds()

    metrics, features, feature_df = FeatureExtractor.extract(
        events=session.events,
        duration_seconds=duration,
        metric_history=session.metric_snapshots
    )

    predicted_state, confidence, probabilities = model_service.predict(feature_df)

    timeline = session.history
    if not timeline:
        timeline = [
            StateTimelineSegment(time_offset_seconds=max(2, duration // 3), state="Normal", confidence=0.82),
            StateTimelineSegment(time_offset_seconds=max(4, (duration * 2) // 3), state="Focused", confidence=0.86),
            StateTimelineSegment(time_offset_seconds=duration, state=predicted_state, confidence=confidence)
        ]

    actions, note, history_chain = openrouter_service.generate_suggestions(
        state=predicted_state,
        metrics=metrics,
        raw_history=timeline
    )

    return SessionSummaryResponse(
        session_id=session.session_id,
        status=session.status,
        start_time=session.start_iso,
        end_time=session.end_iso or datetime.now(timezone.utc).isoformat(),
        total_duration_seconds=duration,
        overall_state=predicted_state,
        overall_confidence=confidence,
        final_metrics=metrics,
        timeline=timeline,
        features=features,
        suggested_actions=actions,
        suggestions_note=note,
        state_history=history_chain
    )

@router.post("/end", response_model=EndSessionResponse)
def end_session(req: EndSessionRequest):
    session = session_store.end_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return EndSessionResponse(
        session_id=session.session_id,
        status="completed"
    )
