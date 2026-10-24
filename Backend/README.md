# HumanSignal Behavioral AI Inference Backend

FastAPI backend that ingests real-time behavioral interaction telemetry (keystrokes, reactions, pointer movements), extracts the 20 temporal features expected by the trained `humansignal_realtime_candidate.joblib` model, and serves probabilistic behavioral state predictions.

## Architecture

```
Browser Telemetry Events (Timestamps, Inter-Key Intervals, Reaction Latency, Cursor Vectors)
                                  │
                                  ▼
                     POST /api/session/events
                                  │
                                  ▼
               Feature Extractor & Rolling Window Aggregator
           (20 Features: Z-scores, Rolling Means, Temporal Variance)
                                  │
                                  ▼
                      AI Model Inference Engine
              (AI/Models/humansignal_realtime_candidate.joblib)
                                  │
                                  ▼
         Predicted State (Focused, Normal, Fatigued, Overloaded)
```

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status, model load state, feature list, documentation link |
| `GET` | `/health` | Health check probe |
| `POST` | `/api/session/start` | Initialize anonymous session with user consent |
| `POST` | `/api/session/events` | Buffer batch of behavioral events (zero raw text) |
| `POST` | `/api/session/predict` | Run 20-feature extraction and AI model prediction |
| `GET` | `/api/session/{id}/summary` | Retrieve full timeline, session metrics, and feature vector |
| `POST` | `/api/session/end` | Finalize session |

## 20 Engineered Features Expected by the Model

1. `std_rt_ms_z` — Reaction time standard deviation Z-score
2. `std_rt_ms_roll_mean_30s` — 30-second rolling mean of reaction time std
3. `std_rt_ms` — Raw standard deviation of reaction times (ms)
4. `std_iki_ms_z` — Inter-key interval std Z-score
5. `mean_rt_ms_z` — Mean reaction time Z-score
6. `mouse_jitter_roll_mean_30s` — 30-second rolling mean of cursor jitter
7. `std_iki_ms` — Raw standard deviation of inter-key intervals (ms)
8. `mean_iki_ms_z` — Mean inter-key interval Z-score
9. `mouse_jitter_z` — Cursor jitter Z-score
10. `mouse_speed_mean_roll_mean_30s` — 30-second rolling mean of cursor velocity (px/s)
11. `mouse_jitter` — Raw cursor movement tremor / directional variance
12. `error_rate_roll_mean_30s` — 30-second rolling mean of backspace/correction rate
13. `mean_rt_ms_roll_mean_30s` — 30-second rolling mean of reaction time (ms)
14. `keys_per_sec_z` — Keystroke velocity Z-score
15. `max_pause_ms_roll_mean_30s` — 30-second rolling mean of max pause duration (ms)
16. `mouse_speed_mean_z` — Cursor velocity Z-score
17. `mouse_speed_mean` — Raw mean cursor velocity (px/s)
18. `keys_per_sec_roll_mean_30s` — 30-second rolling mean of keystrokes per second
19. `mean_rt_ms` — Raw mean reaction time (ms)
20. `pause_count_roll_mean_30s` — 30-second rolling count of hesitation pauses (>650ms)

## Model States
- **Normal**: Baseline motor rhythm and reaction latency.
- **Focused**: High motor stability, low IKI dispersion, fast vigilance reaction.
- **Fatigued**: Extended reaction latency, higher IKI dispersion, frequent micro-pauses.
- **Overloaded**: Elevated motor tremor, erratic typing bursts, frequent correction rate.

## How to Run
```bash
# From d:\HumanSignal\Backend
python start_backend.py
# Or with uvicorn directly
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger docs: `http://localhost:8000/docs`
