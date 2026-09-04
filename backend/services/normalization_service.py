import re
import concurrent.futures

class NormalizationService:
    def __init__(self):
        self._translator = None

    def _get_translator(self):
        if self._translator is None:
            try:
                from deep_translator import GoogleTranslator
                self._translator = GoogleTranslator(source='auto', target='hi')
            except Exception:
                self._translator = None
        return self._translator

    def detect_language(self, text):
        try:
            from langdetect import detect
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
        if lower.startswith("<") or "http" in lower:
            return True
        return False

    def translate_to_hindi(self, text):
        """
        Translates text to Hindi (Devanagari script) with a strict 2-second timeout.
        """
        translator = self._get_translator()
        if not translator:
            return text

        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(translator.translate, text)
                translated = future.result(timeout=2.0)
                if self._is_error_response(translated):
                    return text
                return translated
        except Exception:
            # If translation times out or Google blocks, return original text immediately
            return text

    def transliterate_to_hinglish(self, hindi_text):
        """
        Converts Hindi (Devanagari) -> Hinglish (Roman Script)
        Example: "पानी नहीं है" -> "pani nahi hai"
        """
        if self._is_error_response(hindi_text):
            return ""

        try:
            from indic_transliteration import sanscript
            from indic_transliteration.sanscript import transliterate
            roman_text = transliterate(hindi_text, sanscript.DEVANAGARI, sanscript.ITRANS)
            return roman_text.lower()
        except Exception:
            return hindi_text

    def clean_text(self, text):
        """
        Simple cleanup: lowercase, remove special chars
        """
        return text.lower()

    def normalize(self, text):
        """
        Fast, resilient normalization:
        1. If already ASCII / English, clean and return directly (no slow external network calls)
        2. If Devanagari script, transliterate to Roman Hinglish
        3. Only use Google Translate with timeout if mixed/non-English text
        """
        if not text:
            return ""

        original_text = text.strip()
        
        # Fast path: If text is standard English/ASCII, clean and return immediately
        if original_text.isascii() and not re.search(r'[\u0900-\u097F]', original_text):
            normalized = self.clean_text(original_text)
            print(f"Normalization (fast-path): '{original_text}' -> '{normalized}'")
            return normalized

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

        normalized_text = self.clean_text(hinglish)
        
        if self._is_error_response(normalized_text) or not normalized_text.strip():
            normalized_text = original_text.lower()

        print(f"Normalization: '{original_text}' -> '{normalized_text}'")
        return normalized_text

normalization_service = NormalizationService()
