import numpy as np
import pandas as pd
from typing import List, Dict, Tuple
from schemas.session import TelemetryEvent, SessionMetrics, EngineeredFeatures
from config import POPULATION_MEANS, POPULATION_STDS

class FeatureExtractor:
    @staticmethod
    def extract(
        events: List[TelemetryEvent],
        duration_seconds: int,
        metric_history: List[Dict] = None
    ) -> Tuple[SessionMetrics, EngineeredFeatures, pd.DataFrame]:
        duration = max(5, duration_seconds)

        # 1. Segregate events by type
        keydowns = [e for e in events if e.type == "keydown"]
        reactions = [e for e in events if e.type == "reaction" and e.reactionTimeMs is not None]
        mouse_moves = [e for e in events if e.type == "mousemove" and e.cursorVelocity is not None]

        # 2. Reaction time calculation
        # Filter out false-start penalties (isError=True) when calculating pure psychomotor reaction latency
        valid_reactions = [r for r in reactions if not getattr(r, "isError", False) and r.reactionTimeMs is not None]
        if valid_reactions:
            rt_list = [r.reactionTimeMs for r in valid_reactions if r.reactionTimeMs is not None]
            mean_rt = float(np.mean(rt_list))
            std_rt = float(np.std(rt_list)) if len(rt_list) > 1 else POPULATION_STDS["std_rt_ms"]
        elif reactions:
            rt_list = [r.reactionTimeMs for r in reactions if r.reactionTimeMs is not None]
            mean_rt = float(np.mean(rt_list))
            std_rt = POPULATION_STDS["std_rt_ms"]
        else:
            mean_rt = POPULATION_MEANS["mean_rt_ms"]
            std_rt = POPULATION_STDS["std_rt_ms"]

        # 3. Inter-key interval calculation
        iki_list = []
        for k in keydowns:
            if k.interKeyInterval is not None and 20.0 < k.interKeyInterval < 2500.0:
                iki_list.append(k.interKeyInterval)
        
        # If no explicit IKI provided in events, compute from keydown timestamps
        if not iki_list and len(keydowns) > 1:
            stamps = sorted([k.timestamp for k in keydowns])
            deltas = [stamps[i] - stamps[i - 1] for i in range(1, len(stamps))]
            iki_list = [d for d in deltas if 20.0 < d < 2500.0]

        if iki_list:
            mean_iki = float(np.mean(iki_list))
            std_iki = float(np.std(iki_list)) if len(iki_list) > 1 else POPULATION_STDS["std_iki_ms"]
        else:
            mean_iki = POPULATION_MEANS["mean_iki_ms"]
            std_iki = POPULATION_STDS["std_iki_ms"]

        # 4. Keystroke rate & errors
        if keydowns:
            total_keys = len(keydowns)
            typing_corrections = [e for e in keydowns if getattr(e, "isError", False)] + [e for e in events if e.type == "correction"]
            error_rate = float(len(typing_corrections) / total_keys)
            keys_per_sec = float(len(keydowns) / duration)
        else:
            # When testing reaction only, do not artificially inflate error rate or degrade typing speed
            error_rate = POPULATION_MEANS["error_rate"]
            keys_per_sec = POPULATION_MEANS["keys_per_sec"]

        typing_speed_wpm = int(round(keys_per_sec * 12.0))

        # 5. Pauses (Hesitation pauses apply to keystrokes)
        pauses = [e for e in events if e.type == "pause" or (e.type == "keydown" and e.interKeyInterval and e.interKeyInterval > 650)]
        pause_count = len(pauses) if keydowns else 0
        if pauses and keydowns:
            max_pause = max([p.duration or p.interKeyInterval or 650.0 for p in pauses])
        else:
            max_pause = POPULATION_MEANS["max_pause_ms"]

        # 6. Mouse metrics
        if mouse_moves:
            velocities = [m.cursorVelocity for m in mouse_moves if m.cursorVelocity is not None]
            jitters = [m.jitter for m in mouse_moves if m.jitter is not None]
            mouse_speed = float(np.mean(velocities)) if velocities else POPULATION_MEANS["mouse_speed_mean"]
            mouse_jitter = float(np.mean(jitters)) if jitters else POPULATION_MEANS["mouse_jitter"]
        else:
            mouse_speed = POPULATION_MEANS["mouse_speed_mean"]
            mouse_jitter = POPULATION_MEANS["mouse_jitter"]

        # 7. Compute rolling 30-second trends incorporating historical snapshots
        history = metric_history or []
        recent_samples = history[-3:] if history else []

        def get_roll_mean(cur_val: float, key: str) -> float:
            vals = [s[key] for s in recent_samples if key in s] + [cur_val]
            return float(np.mean(vals))

        std_rt_roll = get_roll_mean(std_rt, "std_rt_ms")
        mean_rt_roll = get_roll_mean(mean_rt, "mean_rt_ms")
        mouse_jitter_roll = get_roll_mean(mouse_jitter, "mouse_jitter")
        mouse_speed_roll = get_roll_mean(mouse_speed, "mouse_speed_mean")
        error_rate_roll = get_roll_mean(error_rate, "error_rate")
        keys_per_sec_roll = get_roll_mean(keys_per_sec, "keys_per_sec")
        max_pause_roll = get_roll_mean(max_pause, "max_pause_ms")
        pause_count_roll = get_roll_mean(float(pause_count), "pause_count")

        # 8. Compute standardized Z-scores
        def z_score(val: float, col: str) -> float:
            return float((val - POPULATION_MEANS[col]) / POPULATION_STDS[col])

        features_dict = {
            "std_rt_ms_z": z_score(std_rt, "std_rt_ms"),
            "std_rt_ms_roll_mean_30s": std_rt_roll,
            "std_rt_ms": std_rt,
            "std_iki_ms_z": z_score(std_iki, "std_iki_ms"),
            "mean_rt_ms_z": z_score(mean_rt, "mean_rt_ms"),
            "mouse_jitter_roll_mean_30s": mouse_jitter_roll,
            "std_iki_ms": std_iki,
            "mean_iki_ms_z": z_score(mean_iki, "mean_iki_ms"),
            "mouse_jitter_z": z_score(mouse_jitter, "mouse_jitter"),
            "mouse_speed_mean_roll_mean_30s": mouse_speed_roll,
            "mouse_jitter": mouse_jitter,
            "error_rate_roll_mean_30s": error_rate_roll,
            "mean_rt_ms_roll_mean_30s": mean_rt_roll,
            "keys_per_sec_z": z_score(keys_per_sec, "keys_per_sec"),
            "max_pause_ms_roll_mean_30s": max_pause_roll,
            "mouse_speed_mean_z": z_score(mouse_speed, "mouse_speed_mean"),
            "mouse_speed_mean": mouse_speed,
            "keys_per_sec_roll_mean_30s": keys_per_sec_roll,
            "mean_rt_ms": mean_rt,
            "pause_count_roll_mean_30s": pause_count_roll,
        }

        # Structure response models
        metrics = SessionMetrics(
            typing_speed_wpm=typing_speed_wpm,
            mean_response_time_ms=int(round(mean_rt)),
            pause_count=pause_count,
            mean_iki_ms=int(round(mean_iki)),
            std_iki_ms=int(round(std_iki)),
            std_rt_ms=int(round(std_rt)),
            error_rate=float(round(error_rate * 100.0, 1)),
            keys_per_sec=float(round(keys_per_sec, 2)),
            mouse_speed_mean=int(round(mouse_speed)),
            mouse_jitter=float(round(mouse_jitter, 3)),
            max_pause_ms=int(round(max_pause)),
        )

        engineered = EngineeredFeatures(**{k: float(round(v, 4)) for k, v in features_dict.items()})

        # Feature order expected by the ExtraTreesClassifier model
        feature_order = [
            "std_rt_ms_z", "std_rt_ms_roll_mean_30s", "std_rt_ms", "std_iki_ms_z", "mean_rt_ms_z",
            "mouse_jitter_roll_mean_30s", "std_iki_ms", "mean_iki_ms_z", "mouse_jitter_z",
            "mouse_speed_mean_roll_mean_30s", "mouse_jitter", "error_rate_roll_mean_30s",
            "mean_rt_ms_roll_mean_30s", "keys_per_sec_z", "max_pause_ms_roll_mean_30s",
            "mouse_speed_mean_z", "mouse_speed_mean", "keys_per_sec_roll_mean_30s",
            "mean_rt_ms", "pause_count_roll_mean_30s"
        ]

        df = pd.DataFrame([[features_dict[col] for col in feature_order]], columns=feature_order)

        return metrics, engineered, df
