import os
import tempfile
yolo_dir = os.path.join(tempfile.gettempdir(), 'Ultralytics')
try:
    os.makedirs(yolo_dir, exist_ok=True)
    os.environ['YOLO_CONFIG_DIR'] = yolo_dir
except Exception:
    pass

YOLO = None
try:
    from ultralytics import YOLO
except Exception as e:
    print(f"Warning: YOLO / Torch could not be loaded: {e}")

class ImageAIService:
    def __init__(self):
        self.model = None
        self.models_loaded = False
        self._load_attempted = False

    def _ensure_model_loaded(self):
        if self._load_attempted:
            return
        self._load_attempted = True

        global YOLO
        if YOLO is None:
            try:
                from ultralytics import YOLO as _YOLO
                YOLO = _YOLO
            except Exception as e:
                print(f"Warning: YOLO / Torch could not be loaded: {e}")
                return

        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(current_dir)
            model_path = os.path.join(backend_dir, 'models', 'best.pt')
            
            if os.path.exists(model_path):
                self.model = YOLO(model_path)
                self.models_loaded = True
                print("Image AI Model (YOLOv8) loaded successfully.")
            else:
                print(f"YOLO model not found at {model_path}")
        except Exception as e:
            print(f"Error loading Image AI model: {e}")

    def analyze(self, image_path):
        self._ensure_model_loaded()
        if not self.models_loaded or self.model is None:
            return {"detected_issue": "Unknown", "confidence": 0.0, "objects": []}

        try:
            results = self.model(image_path)
            detections = []
            max_conf = 0.0
            detected_issue = "None"
            
            for result in results:
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    label = self.model.names[cls_id]
                    
                    detections.append({
                        "label": label,
                        "confidence": conf
                    })
                    
                    if conf > max_conf:
                        max_conf = conf
                        detected_issue = label
            
            return {
                "detected_issue": detected_issue, 
                "confidence": max_conf,
                "objects": detections,
                "description": f"Detected {len(detections)} issues."
            }
        except Exception as e:
            print(f"Error during image analysis: {e}")
            return {"detected_issue": "Error", "confidence": 0.0, "error": str(e)}

image_ai_service = ImageAIService()
