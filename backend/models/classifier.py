from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

TRAINING_DATA = [
    ("meeting project deadline report office work colleague", "Work"),
    ("salary invoice payment hr leave approval manager", "Work"),
    ("research paper collaboration academic study university", "Work"),
    ("presentation client proposal business strategy", "Work"),
    ("birthday party friend dinner family celebration home", "Personal"),
    ("holiday trip vacation personal weekend plans", "Personal"),
    ("sale discount coupon offer buy cheap deal shopping", "Promotional"),
    ("linkedin job opportunity career hiring recruitment", "Promotional"),
    ("newsletter subscription product launch offer", "Promotional"),
    ("bug error issue ticket support help fix problem", "Support"),
    ("password reset login account access help", "Support"),
    ("refund return complaint customer service", "Support"),
    ("github commit pull request notification update", "Notification"),
    ("system alert update status server notification", "Notification"),
    ("reminder scheduled task automated alert", "Notification"),
]

class EmailClassifier:

    def __init__(self):
        texts = [item[0] for item in TRAINING_DATA]
        labels = [item[1] for item in TRAINING_DATA]

        self.model = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('classifier', MultinomialNB())
        ])

        self.model.fit(texts, labels)
        print("Email classifier ready!")

    def predict(self, text):
        category = str(self.model.predict([text])[0])
        probabilities = self.model.predict_proba([text])[0]
        confidence = int(max(probabilities) * 100)

        return {
            "category": category,
            "confidence": confidence
        }