from deep_translator import GoogleTranslator
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
from langdetect import detect
import re

class NormalizationService:
    def __init__(self):
        self.translator = GoogleTranslator(source='auto', target='hi')

    def detect_language(self, text):
        try:
            return detect(text)
        except:
            return "en" # Fallback

    def _is_error_response(self, text):
        if not text or not isinstance(text, str):
            return True
        lower = text.lower().strip()
        error_keywords = [
            "error 500", "server error", "that’s an error", "that's an error",
            "please try again later", "that’s all we know", "<html", "<!doctype",
            "404 not found", "502 bad gateway", "503 service unavailable",
            "unusual traffic", "captcha", "forbidden", "too many requests"
        ]
        if any(k in lower for k in error_keywords):
            return True
        # If response starts with html tags or is suspiciously long compared to short input
        if lower.startswith("<") or "http" in lower:
            return True
        return False

    def translate_to_hindi(self, text):
        """
        Translates text to Hindi (Devanagari script)
        """
        try:
            translated = self.translator.translate(text)
            if self._is_error_response(translated):
                print(f"[TRANSLATE] Google Translate returned error response. Falling back to original text.")
                return text
            return translated
        except Exception as e:
            print(f"[TRANSLATE] Translation Error: {e}")
            return text

    def transliterate_to_hinglish(self, hindi_text):
        """
        Converts Hindi (Devanagari) -> Hinglish (Roman Script)
        Example: "पानी नहीं है" -> "pani nahi hai"
        """
        if self._is_error_response(hindi_text):
            return ""

        try:
            roman_text = transliterate(hindi_text, sanscript.DEVANAGARI, sanscript.ITRANS)
            return roman_text.lower()
        except Exception as e:
            print(f"Transliteration Error: {e}")
            return hindi_text

    def clean_text(self, text):
        """
        Simple cleanup: lowercase, remove special chars
        """
        text = text.lower()
        return text

    def normalize(self, text):
        """
        Main pipeline:
        1. Detect Language
        2. If NOT Hindi/Hinglish (Devanagari or Roman Hindi), Translate to Hindi
        3. Transliterate Hindi -> Hinglish (Roman)
        4. Clean
        """
        if not text:
            return ""

        original_text = text.strip()
        lang = self.detect_language(original_text)
        
        # Check for Devanagari characters
        if re.search(r'[\u0900-\u097F]', original_text):
            text_to_transliterate = original_text
        else:
            try:
                translated = self.translate_to_hindi(original_text)
                if translated and not self._is_error_response(translated):
                    text_to_transliterate = translated
                else:
                    text_to_transliterate = original_text
            except Exception:
                text_to_transliterate = original_text

        # If it has Devanagari script, transliterate to Roman
        if re.search(r'[\u0900-\u097F]', text_to_transliterate):
            hinglish = self.transliterate_to_hinglish(text_to_transliterate)
        else:
            hinglish = text_to_transliterate

        # Cleanup
        normalized_text = self.clean_text(hinglish)
        
        # Final safeguard: if normalized text somehow has error string or is empty, use original
        if self._is_error_response(normalized_text) or not normalized_text.strip():
            normalized_text = original_text.lower()

        print(f"Normalization: '{original_text}' -> '{normalized_text}'")
        return normalized_text

normalization_service = NormalizationService()
