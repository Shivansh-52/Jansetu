import pickle
import os
import re

class TextAIService:
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
            
            vec_path = os.path.join(models_dir, 'vectorizer.pkl')
            model_path = os.path.join(models_dir, 'complaint_model.pkl') # Naive Bayes
            
            if os.path.exists(vec_path) and os.path.exists(model_path):
                with open(vec_path, 'rb') as f:
                    self.vectorizer = pickle.load(f)
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.models_loaded = True
                print("Text AI Models loaded successfully.")
            else:
                print(f"Text AI models not found at {models_dir}")
        except Exception as e:
            print(f"Error loading Text AI models: {e}")

    def clean_text(self, text):
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        return text

    def _heuristic_classify(self, text):
        t = text.lower()
        # Department / Category keywords
        rules = [
            ("Roads", ["road", "pothole", "pave", "traffic", "highway", "asphalt", "footpath", "sidewalk", "speed breaker", "crater"]),
            ("Sanitation", ["garbage", "trash", "waste", "dump", "cleaning", "drain", "dirty", "sweep", "dustbin", "litter", "smell", "filth"]),
            ("Electricity", ["electric", "power", "light", "street light", "wire", "pole", "transformer", "blackout", "spark", "current", "bulb"]),
            ("Water", ["water", "leak", "pipe", "pipeline", "sewage", "supply", "tap", "drinking water", "overflow", "drainage", "clog"]),
        ]
        best_cat = "General"
        max_matches = 0
        for cat, keywords in rules:
            matches = sum(1 for k in keywords if k in t)
            if matches > max_matches:
                max_matches = matches
                best_cat = cat

        conf = min(0.5 + 0.15 * max_matches, 0.95) if max_matches > 0 else 0.5
        return {"category": best_cat, "confidence": conf}

    def analyze(self, text):
        if not text:
            return {"category": "General", "confidence": 0.0}

        if self.models_loaded:
            try:
                cleaned_text = self.clean_text(text)
                text_vector = self.vectorizer.transform([cleaned_text])
                
                # Predict Category
                prediction = self.model.predict(text_vector)[0]
                probabilities = self.model.predict_proba(text_vector)[0]
                confidence = max(probabilities)
                
                return {
                    "category": prediction,
                    "confidence": float(confidence)
                }
            except Exception as e:
                print(f"Error in Text AI model prediction: {e}")

        # Heuristic fallback if model failed or not loaded
        return self._heuristic_classify(text)

text_ai_service = TextAIService()
