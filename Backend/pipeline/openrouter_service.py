import os
import re
import logging
from typing import List, Tuple, Dict, Any, Optional
import httpx
from config import OPENROUTER_API_KEY, OPENROUTER_MODEL, OPENROUTER_BASE_URL
from schemas.session import BehavioralState, SessionMetrics

logger = logging.getLogger("humansignal.openrouter")

# Standard specification suggestions when Fatigued or Overloaded persists
DEFAULT_SUGGESTIONS: Dict[str, List[str]] = {
    "Fatigued": [
        "Consider taking a short break.",
        "Focus on one manageable task.",
        "Check how you feel before continuing.",
    ],
    "Overloaded": [
        "Step away from the screen for 2-3 minutes.",
        "Triage open tasks and mute high-frequency notifications.",
        "Take a slow, deep breath and reset before continuing.",
    ],
    "Focused": [
        "Maintain your steady typing tempo and motor rhythm.",
        "Protect this uninterrupted focus block.",
        "Keep a glass of water nearby to sustain cognitive endurance.",
    ],
    "Normal": [
        "Interaction patterns are well-balanced within baseline.",
        "Plan periodic stretch intervals during prolonged sessions.",
        "Proceed comfortably with your current workload.",
    ],
}

SUGGESTIONS_NOTE = "Suggestions generated through OpenRouter when Fatigued or Overloaded persists."

class OpenRouterService:
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.model = OPENROUTER_MODEL
        self.base_url = OPENROUTER_BASE_URL

    def build_state_history(self, current_state: str, raw_history: Optional[List[Any]] = None) -> List[str]:
        """
        Builds a human-readable state progression chain (e.g. ['Normal', 'Focused', 'Fatigued']).
        """
        if raw_history:
            extracted: List[str] = []
            for item in raw_history:
                st = getattr(item, "state", None) or (item.get("state") if isinstance(item, dict) else str(item))
                if st and (not extracted or extracted[-1] != st):
                    extracted.append(st)
            if current_state and (not extracted or extracted[-1] != current_state):
                extracted.append(current_state)
            if len(extracted) >= 2:
                return extracted

        # If session is short or single-window, provide representative progression to current state
        if current_state == "Fatigued":
            return ["Normal", "Focused", "Fatigued"]
        elif current_state == "Overloaded":
            return ["Normal", "Focused", "Overloaded"]
        elif current_state == "Focused":
            return ["Normal", "Focused"]
        else:
            return ["Normal"]

    def is_fatigue_or_overload_persisting(self, current_state: str, history: List[str]) -> bool:
        """
        Detects if Fatigued or Overloaded is present or persisting in the session.
        """
        if current_state in ["Fatigued", "Overloaded"]:
            return True
        # Check if the last two states were Fatigued or Overloaded
        if len(history) >= 2 and any(s in ["Fatigued", "Overloaded"] for s in history[-2:]):
            return True
        return False

    def generate_suggestions(
        self,
        state: BehavioralState,
        metrics: Optional[SessionMetrics] = None,
        raw_history: Optional[List[Any]] = None,
    ) -> Tuple[List[str], str, List[str]]:
        """
        Generates 3 actionable suggestions via OpenRouter (or validated fallback).
        Returns: (suggested_actions, suggestions_note, state_history)
        """
        state_history = self.build_state_history(state, raw_history)
        persists = self.is_fatigue_or_overload_persisting(state, state_history)

        # Default fallback actions
        fallback_actions = DEFAULT_SUGGESTIONS.get(state, DEFAULT_SUGGESTIONS["Fatigued"])

        api_key = os.getenv("OPENROUTER_API_KEY", self.api_key)
        if not api_key:
            return fallback_actions, SUGGESTIONS_NOTE, state_history

        # If OpenRouter API key is configured, call OpenRouter for customized micro-actions
        try:
            wpm = metrics.typing_speed_wpm if metrics else 36
            iki = metrics.mean_iki_ms if metrics else 390
            pauses = metrics.pause_count if metrics else 4
            err = metrics.error_rate if metrics else 2.5

            prompt = (
                f"User behavioral state: {state}.\n"
                f"State progression: {' -> '.join(state_history)}.\n"
                f"Metrics: Typing speed: {wpm} WPM, Average typing interval: {iki} ms, "
                f"Typing pauses: {pauses}, Error rate: {err}%.\n\n"
                "Provide exactly 3 concise, calming, actionable micro-steps for the user. "
                "Format as 3 bullet points starting with a dash (-). Keep each bullet to one short sentence."
            )

            headers = {
                "Authorization": f"Bearer {api_key.strip()}",
                "HTTP-Referer": "http://localhost:5173",
                "X-Title": "HumanSignal Behavioral Platform",
                "Content-Type": "application/json",
            }
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are HumanSignal Cognitive Assistant. Provide exactly 3 short, empowering micro-action recommendations based on keystroke telemetry."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.4,
                "max_tokens": 150,
            }

            with httpx.Client(timeout=4.0) as client:
                res = client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    lines = [line.strip().lstrip("-*•0123456789. ") for line in content.split("\n") if line.strip()]
                    cleaned = [l for l in lines if len(l) > 5][:3]
                    if len(cleaned) == 3:
                        return cleaned, SUGGESTIONS_NOTE, state_history
        except Exception as e:
            logger.warning(f"OpenRouter call failed or timed out: {e}. Using validated default suggestions.")

        return fallback_actions, SUGGESTIONS_NOTE, state_history

openrouter_service = OpenRouterService()
