from langdetect import detect
from deep_translator import GoogleTranslator

LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "ar": "Arabic",
    "ja": "Japanese",
}

class MultilingualService:

    def detect_language(self, text):
        try:
            code = detect(text)
            name = LANGUAGE_NAMES.get(code, code)
            return {"code": code, "name": name}
        except:
            return {"code": "en", "name": "English"}

    def translate_to_english(self, text, source_lang):
        # If already English, return as is
        if source_lang == "en":
            return text
        try:
            translated = GoogleTranslator(
                source=source_lang,
                target="en"
            ).translate(text)
            return translated
        except:
            return text

    def translate_from_english(self, text, target_lang):
        # If target is English, return as is
        if target_lang == "en":
            return text
        try:
            translated = GoogleTranslator(
                source="en",
                target=target_lang
            ).translate(text)
            return translated
        except:
            return text