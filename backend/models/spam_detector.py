import re
 
# Strong spam keywords — only clearly spammy phrases
SPAM_KEYWORDS = [
    "free money", "claim your prize", "you have won", "lottery winner",
    "bank details required", "send your details", "make money fast",
    "click here to claim", "offer expires today", "act now limited",
    "nigerian prince", "wire transfer", "100% free", "risk free",
    "you are selected for prize", "congratulations you won"
]
 
# Weak keywords — need multiple hits to be spam
WEAK_KEYWORDS = [
    "win", "prize", "lottery", "claim", "urgent", "free",
    "congratulations", "selected", "offer", "act now", "click here"
]
 
# Trusted domains — never mark as spam
TRUSTED_DOMAINS = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
    "github.com", "linkedin.com", "google.com", "microsoft.com",
    "amazon.com", "flipkart.com", "indeed.com", "naukri.com",
    "nptel.ac.in", "nic.in", "gov.in", "edu", ".ac.in",
    "dotandkey.com", "freelancer.com", "angelone.in", "zerodha.com"
]
 
SPAM_DOMAINS = [".xyz", ".tk", "scam", "phish"]
 
class SpamDetector:
 
    def predict(self, subject, body, sender_email):
 
        # Never spam if from trusted domain
        sender_lower = sender_email.lower()
        for trusted in TRUSTED_DOMAINS:
            if trusted in sender_lower:
                return {
                    "is_spam": False,
                    "confidence": 0,
                    "keywords_found": []
                }
 
        text = (subject + " " + body).lower()
        score = 0
        keyword_hits = []
 
        # Strong keywords — high score each
        for keyword in SPAM_KEYWORDS:
            if keyword in text:
                keyword_hits.append(keyword)
                score += 30
 
        # Weak keywords — low score, need many to matter
        weak_hits = []
        for keyword in WEAK_KEYWORDS:
            if keyword in text:
                weak_hits.append(keyword)
        # only add score if 3+ weak hits
        if len(weak_hits) >= 3:
            score += len(weak_hits) * 5
 
        # Suspicious domain
        for domain in SPAM_DOMAINS:
            if domain in sender_lower:
                score += 40
 
        # Excessive !!! or $$$
        excessive = re.findall(r'[!$]{3,}', subject + body)
        score += len(excessive) * 10
 
        # ALL CAPS words (only count if many)
        caps_words = re.findall(r'\b[A-Z]{5,}\b', body)
        if len(caps_words) >= 5:
            score += len(caps_words) * 3
 
        # Raise threshold to 70
        is_spam = score >= 70
 
        return {
            "is_spam": is_spam,
            "confidence": min(score, 100),
            "keywords_found": keyword_hits
        }
