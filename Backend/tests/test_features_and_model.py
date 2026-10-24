import math
import pytest
import numpy as np
import pandas as pd
from pipeline.feature_extractor import FeatureExtractor
from pipeline.model_service import model_service
from schemas.session import TelemetryEvent

def test_feature_extractor_empty_events_baseline():
    """Verify feature extractor handles empty events without crashing or NaNs."""
    metrics, features, df = FeatureExtractor.extract(events=[], duration_seconds=10)
    
    assert metrics is not None
    assert features is not None
    assert df.shape == (1, 20)

    # Check for no NaNs or Infs
    for col in df.columns:
        val = df[col].iloc[0]
        assert not math.isnan(val), f"Column {col} produced NaN"
        assert not math.isinf(val), f"Column {col} produced Inf"

def test_feature_extractor_synthetic_focused():
    """Verify feature extractor with sharp, fast psychomotor telemetry."""
    now = 1000.0
    events = []
    # Fast typing (5 keys per second, tight 120ms IKI)
    for i in range(30):
        events.append(TelemetryEvent(
            type="keydown",
            timestamp=now + (i * 0.12),
            interKeyInterval=120.0
        ))
    # Quick, alert reaction times (210ms)
    for i in range(5):
        events.append(TelemetryEvent(
            type="reaction",
            timestamp=now + (i * 1.5),
            reactionTimeMs=210.0
        ))
    # Smooth cursor movement (low jitter, fast speed)
    for i in range(10):
        events.append(TelemetryEvent(
            type="mousemove",
            timestamp=now + (i * 0.5),
            cursorVelocity=520.0,
            jitter=0.8
        ))

    metrics, features, df = FeatureExtractor.extract(events=events, duration_seconds=10)
    assert metrics.typing_speed_wpm > 30
    assert metrics.mean_response_time_ms < 250
    assert df.shape == (1, 20)

    state, confidence, probs = model_service.predict(df)
    assert state in ["Focused", "Normal", "Fatigued", "Overloaded"]
    assert 0.0 <= confidence <= 1.0
    assert sum(probs.values()) == pytest.approx(1.0, abs=1e-2)

def test_feature_extractor_synthetic_fatigued():
    """Verify feature extractor with sluggish, fatigued psychomotor telemetry."""
    now = 2000.0
    events = []
    # Sluggish typing with hesitation pauses
    for i in range(15):
        events.append(TelemetryEvent(
            type="keydown",
            timestamp=now + (i * 0.45),
            interKeyInterval=450.0
        ))
    # Sluggish reactions (430ms)
    for i in range(5):
        events.append(TelemetryEvent(
            type="reaction",
            timestamp=now + (i * 2.0),
            reactionTimeMs=430.0
        ))
    # Multiple hesitation pauses
    for i in range(3):
        events.append(TelemetryEvent(
            type="pause",
            timestamp=now + (i * 3.0),
            duration=950.0
        ))

    metrics, features, df = FeatureExtractor.extract(events=events, duration_seconds=20)
    assert metrics.mean_response_time_ms > 350
    assert metrics.pause_count >= 3
    assert df.shape == (1, 20)

    state, confidence, probs = model_service.predict(df)
    assert state in ["Focused", "Normal", "Fatigued", "Overloaded"]
    assert probs["Fatigued"] >= 0.0
