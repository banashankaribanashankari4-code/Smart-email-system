import re
import nltk

nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

class NLPProcessor:

    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

    def preprocess(self, text):

        # Make everything lowercase
        text = text.lower()

        # Remove special characters
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)

        # Split into individual words
        tokens = word_tokenize(text)

        # Remove common words like "the", "is", "a"
        filtered = [w for w in tokens if w not in self.stop_words]

        # Reduce words to root form
        lemmatized = [self.lemmatizer.lemmatize(w) for w in filtered]

        return {
            "processed_text": " ".join(lemmatized),
            "token_count": len(tokens)
        }