import pickle
import os
import re

class SentimentService:
    def __init__(self):
        self.vectorizer = None
        self.model = None
        self.models_loaded = False
        self._load_models()

    def _load_models(self):
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)
            models_dir = os.path.join(backend_dir, 'models')
            
            vec_path = os.path.join(models_dir, 'vectorizer.pkl') # Shared vectorizer usually
            model_path = os.path.join(models_dir, 'sentiment_model.pkl')
            
            if os.path.exists(vec_path) and os.path.exists(model_path):
                with open(vec_path, 'rb') as f:
                     # If separate vectorizer needed, load it. Assuming shared for simplicty or specific one.
                     # For this task, user said "vectorizer.pkl" is used for both.
                    self.vectorizer = pickle.load(f)
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.models_loaded = True
                print("Sentiment AI Models loaded successfully.")
            else:
                print(f"Sentiment AI models not found at {models_dir}")
        except Exception as e:
            print(f"Error loading Sentiment AI models: {e}")

    def _heuristic_priority(self, text):
        t = text.lower()
        high_indicators = [
            "urgent", "emergency", "danger", "hazard", "spark", "fire", "accident",
            "severe", "critical", "burst", "flood", "shock", "collapse", "risk", "death",
            "immediately", "life", "children", "hospital", "toxic", "poison"
        ]
        low_indicators = [
            "minor", "suggestion", "slow", "cosmetic", "paint", "feedback", "inconvenience",
            "request", "query"
        ]
        if any(w in t for w in high_indicators):
            return {"priority": "High", "confidence": 0.85}
        if any(w in t for w in low_indicators):
            return {"priority": "Low", "confidence": 0.75}
        return {"priority": "Medium", "confidence": 0.70}

    def analyze(self, text):
        if not text:
            return {"priority": "Medium", "confidence": 0.0}

        if self.models_loaded:
            try:
                # Simple cleaning
                cleaned_text = text.lower()
                
                # Check if model is an sklearn Pipeline (has tfidf built-in)
                if hasattr(self.model, 'steps') or hasattr(self.model, 'named_steps'):
                    prediction = self.model.predict([cleaned_text])[0]
                    if hasattr(self.model, 'predict_proba'):
                        probabilities = self.model.predict_proba([cleaned_text])[0]
                        confidence = max(probabilities)
                    else:
                        confidence = 0.8
                else:
                    text_vector = self.vectorizer.transform([cleaned_text])
                    prediction = self.model.predict(text_vector)[0]
                    probabilities = self.model.predict_proba(text_vector)[0]
                    confidence = max(probabilities)
                
                return {
                    "priority": prediction, # High, Medium, Low
                    "confidence": float(confidence)
                }
            except Exception as e:
                print(f"Error in Sentiment AI analysis: {e}")

        return self._heuristic_priority(text)

sentiment_service = SentimentService()
