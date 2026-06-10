from fastapi import APIRouter
from pydantic import BaseModel
import os
from dotenv import load_dotenv
 
from models.classifier import EmailClassifier
from models.spam_detector import SpamDetector
from services.nlp_processor import NLPProcessor
from services.llm_service import LLMService
from services.multilingual_service import MultilingualService
 
load_dotenv()
 
router = APIRouter(prefix="/api/email", tags=["email"])
 
classifier = EmailClassifier()
spam_detector = SpamDetector()
nlp = NLPProcessor()
multilingual = MultilingualService()
 
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
llm = LLMService() if api_key else None
 
LANGUAGE_MAP = {
    'English': 'en',
    'Kannada': 'kn',
    'Hindi': 'hi',
    'Tamil': 'ta',
    'Telugu': 'te',
    'French': 'fr',
    'Spanish': 'es',
}
 
class EmailRequest(BaseModel):
    sender: str
    sender_email: str
    subject: str
    body: str
    language: str = 'English'
 
class ReplyRequest(BaseModel):
    sender: str
    subject: str
    body: str
    language: str = 'English'
 
@router.post("/analyze")
def analyze_email(request: EmailRequest):
 
    full_text = request.subject + " " + request.body
    lang_info = multilingual.detect_language(full_text)
    detected_lang = lang_info["code"]
 
    subject_en = multilingual.translate_to_english(request.subject, detected_lang)
    body_en = multilingual.translate_to_english(request.body, detected_lang)
 
    processed = nlp.preprocess(subject_en + " " + body_en)
 
    spam_result = spam_detector.predict(subject_en, body_en, request.sender_email)
 
    if spam_result["is_spam"]:
        return {
            "is_spam": True,
            "spam_confidence": spam_result["confidence"],
            "keywords_found": spam_result["keywords_found"],
            "message": "Email quarantined as spam"
        }
 
    classification = classifier.predict(processed["processed_text"])
 
    if llm is None:
        return {
            "is_spam": False,
            "detected_language": lang_info["name"],
            "category": classification["category"],
            "confidence": classification["confidence"],
            "message": "Add API key to .env to enable AI reply generation"
        }
 
    try:
        # Get selected language code
        selected_lang = LANGUAGE_MAP.get(request.language, 'en')
 
        llm_result = llm.analyze_and_reply(request.sender, subject_en, body_en, reply_language=request.language)
 
        # If user selected a non-English language, translate reply to that language
        if selected_lang != 'en':
            reply_translated = multilingual.translate_from_english(
                llm_result["reply"], selected_lang
            )
        else:
            reply_translated = llm_result["reply"]
 
        return {
            "is_spam": False,
            "detected_language": lang_info["name"],
            "reply_language": request.language,
            "category": classification["category"],
            "confidence": classification["confidence"],
            "intent": llm_result["intent"],
            "urgency": llm_result["urgency"],
            "sentiment": llm_result["sentiment"],
            "suggested_reply": reply_translated
        }
    except Exception as e:
        return {
            "is_spam": False,
            "detected_language": lang_info["name"],
            "category": classification["category"],
            "confidence": classification["confidence"],
            "intent": "N/A",
            "urgency": "N/A",
            "sentiment": "N/A",
            "suggested_reply": None,
            "message": f"AI error: {str(e)[:150]}"
        }
 
@router.post("/regenerate-reply")
def regenerate_reply(request: ReplyRequest):
    if llm is None:
        return {"reply": "Add API key to .env to enable this feature"}
    try:
        selected_lang = LANGUAGE_MAP.get(request.language, 'en')
        reply = llm.regenerate_reply(request.sender, request.subject, request.body, reply_language=request.language)
 
        if selected_lang != 'en':
            reply = multilingual.translate_from_english(reply, selected_lang)
 
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Error: {str(e)[:150]}"}