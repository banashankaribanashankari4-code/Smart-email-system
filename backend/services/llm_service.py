import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
 
load_dotenv()
 
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
 
class LLMService:
 
    def __init__(self):
        self.model = genai.GenerativeModel("models/gemini-2.5-flash")
 
    def analyze_and_reply(self, sender, subject, body, reply_language='English'):
 
        prompt = f"""You are an intelligent email assistant.
Analyze this email and respond ONLY with a JSON object like this:
{{
  "intent": "short phrase e.g. Collaboration request",
  "urgency": "High or Medium or Low",
  "sentiment": "Positive or Neutral or Negative or Formal",
  "reply": "a complete professional email reply written in {reply_language}"
}}
No extra text. Only the JSON object.
IMPORTANT: Write the "reply" field in {reply_language} language only.
 
From: {sender}
Subject: {subject}
 
{body}"""
 
        response = self.model.generate_content(prompt)
        raw_text = response.text
        clean_text = raw_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean_text)
        return result
 
    def regenerate_reply(self, sender, subject, body, reply_language='English'):
 
        prompt = f"""Write a professional email reply in {reply_language} language only.
Return only the reply text. Do not include any explanation.
 
From: {sender}
Subject: {subject}
 
{body}"""
 
        response = self.model.generate_content(prompt)
        return response.text.strip()
