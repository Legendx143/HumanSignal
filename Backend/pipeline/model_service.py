import joblib
import pandas as pd
from typing import Dict, Tuple, Optional
from config import PRIMARY_MODEL_PATH
from schemas.session import BehavioralState

class ModelService:
    def __init__(self):
        self.model = None
        self.selected_features = []
        self.classes = []
        self.is_loaded = False

    def load_model(self):
        if self.is_loaded:
            return

        if not PRIMARY_MODEL_PATH.exists():
            raise FileNotFoundError(f"AI Model file not found at {PRIMARY_MODEL_PATH}")

        print(f"[ModelService] Loading primary AI model from: {PRIMARY_MODEL_PATH}")
        model_artifact = joblib.load(str(PRIMARY_MODEL_PATH))

        if isinstance(model_artifact, dict):
            self.model = model_artifact["model"]
            self.selected_features = model_artifact.get("selected_features", [])
            self.classes = list(model_artifact.get("classes", []))
        else:
            self.model = model_artifact
            self.selected_features = getattr(model_artifact, "feature_names_in_", []).tolist()
            self.classes = list(getattr(model_artifact, "classes_", ["Fatigued", "Focused", "Normal", "Overloaded"]))

        self.is_loaded = True
        print(f"[ModelService] Successfully loaded model: {type(self.model).__name__}")
        print(f"[ModelService] Selected 20 features: {len(self.selected_features)} features, Classes: {self.classes}")

    def predict(self, feature_df: pd.DataFrame) -> Tuple[BehavioralState, float, Dict[str, float]]:
        if not self.is_loaded:
            self.load_model()

        # Ensure correct column ordering
        ordered_df = feature_df[self.selected_features]

        # Model Inference
        raw_pred = self.model.predict(ordered_df)[0]
        raw_probs = self.model.predict_proba(ordered_df)[0]

        classes_list = [str(c) for c in self.classes]
        prob_dict = {cls_name: float(round(p, 4)) for cls_name, p in zip(classes_list, raw_probs)}

        predicted_state = str(raw_pred)
        if predicted_state in prob_dict:
            confidence = float(round(prob_dict[predicted_state], 4))
        else:
            confidence = float(round(max(raw_probs), 4))

        return predicted_state, confidence, prob_dict

model_service = ModelService()
