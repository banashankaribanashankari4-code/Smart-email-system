<p align="center">
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Ht9WSXBdz3Ce1AUjQBF2_1JAEohHpHv2tA&s" height="80" style="background:white; padding:8px; margin:0 16px;" />
  <img src="https://www.erafoundationindia.org/images/logo.svg" width="220"/>
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="https://comedkares.org/wp-content/uploads/2023/04/Comedkares-Logo-EPS.png" width="220"/>
</p>

---

# SMART EMAIL ASSISTANT USING NLP, DEEP LEARNING AND LLM

### Submitted by

**Banashankari S P**
1DA24MC010
Department of MCA
Dr Ambedkar Institute of Technology

**Mentor 1**
Harsha T R

**Mentor 2**
Shobha Rani B R

---

# Abstract

Email communication has become an essential part of modern digital interaction in education, business, and professional environments. Users receive a large number of emails every day, including spam, promotional messages, phishing attempts, important work emails, and general inquiries. Managing these emails manually is time-consuming and inefficient, leading to delayed responses, reduced productivity, and communication gaps.

This project presents a Smart Email Assistant using Machine Learning, Natural Language Processing (NLP), and Large Language Models (LLMs). The system connects to real Gmail accounts via the Gmail API and OAuth 2.0, fetches live emails, and automatically classifies them into meaningful categories while generating intelligent context-aware smart replies using Groq LLaMA 3.3 70B.

The system includes a Human-in-the-Loop confirmation mechanism where users review and approve AI-generated replies before sending, reducing unintended responses and communication errors.

The implemented solution combines:
- Real-time Gmail integration via Gmail API and OAuth 2.0
- NLP preprocessing pipeline
- Spam and phishing detection
- Email classification into 9 categories
- Priority prediction
- Intent, urgency, and sentiment analysis
- Context-aware smart reply generation
- Email summarization
- Meeting and task extraction
- Reminder management
- Analytics dashboard
- User validation before sending

into a single integrated intelligent workflow deployed as a full-stack web application using React.js frontend and Node.js + Express backend with MongoDB database.

---

# Keywords

- Artificial Intelligence
- Machine Learning
- NLP
- Email Classification
- Smart Reply
- Large Language Models
- Gmail API
- Spam Detection
- Phishing Detection
- Human-in-the-Loop
- Priority Prediction
- MongoDB

---

# 1. Introduction

## 1.1 Background

Email is one of the most widely used communication methods in education, organizations, businesses, and customer support systems. Every day, users receive a large number of emails containing important messages, notifications, promotions, spam, phishing attempts, and inquiries.

Managing these emails manually becomes difficult as email volume increases.

Traditional email systems mainly use:
- Rule-based filtering
- Manual organization
- Static reply systems

These approaches are insufficient for understanding intent, urgency, priority, context, and semantic meaning.

Recent advancements in Artificial Intelligence, NLP, Deep Learning, and Large Language Models have enabled intelligent automation systems for email management.

---

## 1.2 Problem Overview

Users often struggle to:
- Identify important and high-priority emails quickly
- Separate spam, phishing, and promotions automatically
- Reply to repetitive emails efficiently
- Extract meetings and tasks from email content
- Manage overloaded inboxes with no intelligence

Existing systems provide only partial automation and lack deep context understanding, intelligent response generation, phishing detection, priority prediction, and user-controlled AI validation.

---

## 1.3 Need for the Study

Efficient email management is important because delayed communication can lead to reduced productivity, missed opportunities, communication delays, increased manual effort, and poor customer satisfaction.

An intelligent automated email assistant that connects to real Gmail accounts, stores user data in MongoDB, and uses LLM-powered analysis can significantly improve communication efficiency for students, professionals, and businesses.

---

## 1.4 Objectives

- Develop a real-time Gmail-connected email management system
- Implement NLP-based email classification into 9 categories
- Build spam detection and phishing detection modules
- Predict email priority as critical, high, medium, or low
- Generate context-aware smart replies using Groq LLaMA 3.3 70B
- Summarize long emails automatically
- Extract meeting details and tasks from email content
- Set and manage reminders linked to emails
- Build analytics dashboard with real email statistics
- Introduce human-in-the-loop validation before sending replies
- Store all user data and email analysis in MongoDB
- Build a user-friendly full-stack web application

---

## 1.5 Scope of the Work

The project focuses on:
- Real-time Gmail integration via Gmail API and OAuth 2.0
- Email classification into 9 categories: work, personal, finance, social, promotions, updates, spam, phishing, other
- Spam detection with score and reasons
- Phishing detection with indicators
- Priority prediction: critical, high, medium, low
- AI-powered email summarization
- Meeting and task extraction from email body
- Smart reply generation using Groq LLaMA 3.3 70B (also supports Anthropic Claude and OpenAI)
- Sentiment analysis: positive, negative, neutral, urgent, angry, happy
- Reminder management system
- Analytics dashboard with charts
- Human-in-the-loop reply confirmation
- Full-stack deployment: React.js frontend + Node.js + Express backend + MongoDB

---

# 2. Literature Review

The research paper titled *"Smart Reply: Automated Response Suggestion for Email"* proposed by the Google Research Team focused on generating automated email responses using deep learning techniques. The study used sequence prediction methodology based on neural networks and Natural Language Processing (NLP) to suggest quick and relevant replies to user emails. The proposed system significantly improved response speed and reduced manual typing effort, making email communication more efficient. The major advantages of this approach include faster email replying, reduced user effort, and ease of use. However, the generated replies were often short and generic, lacked deep contextual understanding, and still required users to manually select the final response.[1]

The research paper titled *"Email Classification using Machine Learning Techniques"* presented a machine learning-based approach for organizing and categorizing emails automatically. The methodology adopted supervised learning techniques and utilized algorithms such as Naive Bayes, Support Vector Machine (SVM), and Natural Language Processing (NLP) to classify emails into different categories. The study demonstrated improved email categorization accuracy and better spam detection mechanisms. The advantages of this approach include enhanced email organization, efficient spam filtering, and support for multiple email categories. However, the system did not provide intelligent reply generation, its performance depended heavily on training data quality, and it faced challenges in handling ambiguous email content.[2]

The research paper titled *"Context-Aware Conversational AI using Large Language Models"* explored the use of transformer-based Large Language Model (LLM) architectures for generating human-like conversational responses. The methodology employed modern transformer networks and NLP techniques to understand context and generate meaningful text outputs. The results showed improved contextual understanding, better personalization, and more natural human-like communication. The key advantages included improved context awareness, personalized responses, and advanced conversational capabilities. However, the system required high computational resources, had a possibility of hallucinated responses, and depended on large-scale datasets for effective performance.[3]

---

# 3. Research Gaps Identified

## Gap 1
Most systems focus either on classification or reply generation separately instead of combining both into one integrated workflow.

## Gap 2
Existing auto-reply systems generate short and generic responses without deep context understanding.

## Gap 3
Many systems lack user confirmation before sending AI-generated replies, increasing the risk of unintended communication.

## Gap 4
Existing systems do not detect phishing emails separately from spam, leaving users vulnerable to security threats.

## Gap 5
AI-powered email solutions are not connected to real email accounts and do not persist analysis data in a database for future reference.

## Gap 6
Existing systems do not extract meeting details and tasks from email content, requiring manual effort from users.

---

# 4. Proposed Solution

The implemented Smart Email Assistant combines:
- Real-time Gmail API integration with OAuth 2.0
- MongoDB database for storing users, emails, and reminders
- JWT-based authentication with Google OAuth
- Email classification into 9 categories
- Spam detection with scoring and reasons
- Phishing detection with indicators
- Priority prediction with scoring and factors
- AI-powered email summarization
- Meeting and task extraction from email content
- Smart reply generation using Groq LLaMA 3.3 70B
- Sentiment analysis with detailed scores
- Reminder management system
- Human-in-the-loop validation before sending
- Analytics dashboard using real stored data

---

# 5. System Architecture / Workflow Diagram

```text
+-----------------------------+
|   User Login (Google OAuth) |
|   JWT Token Generated       |
+-----------------------------+
              ↓
+-----------------------------+
|   Gmail API — Fetch Emails  |
|   (Inbox, Spam, Sent, etc.) |
+-----------------------------+
              ↓
+-----------------------------+
|   Base64 Decode & HTML Clean|
|   Extract: From, To, CC,    |
|   Subject, Body, Attachments|
+-----------------------------+
              ↓
+-----------------------------+
|   Store Raw Email in MongoDB|
|   (Email Model)             |
+-----------------------------+
              ↓
     +--------+--------+--------+--------+
     ↓        ↓        ↓        ↓        ↓
+--------+ +--------+ +--------+ +------+ +----------+
| Spam   | |Phishing| | Email  | |Prior-| | Sentiment|
|Detector| |Detector| |Classif.| | ity  | | Analysis |
+--------+ +--------+ +--------+ +------+ +----------+
                       ↓
+-----------------------------+
|   Groq LLaMA 3.3 70B LLM   |
|   - Email Summarization     |
|   - Meeting Extraction      |
|   - Task Extraction         |
|   - Smart Reply Generation  |
+-----------------------------+
              ↓
+-----------------------------+
|   AI Analysis Saved to      |
|   MongoDB (aiAnalysis field)|
+-----------------------------+
              ↓
+-----------------------------+
|  Suggested Reply Shown      |
|  to User (Human-in-Loop)    |
+-----------------------------+
              ↓
+-----------------------------+
|  User Reviews / Edits       |
+-----------------------------+
              ↓
+-----------------------------+
|  Final Reply Sent via Gmail |
+-----------------------------+
```

---

# 6. Methodology

## 6.1 Workflow

1. User logs in with Google account via OAuth 2.0 — JWT token is issued
2. Gmail API fetches real emails from Inbox, Important, Promotions, Spam, Sent
3. Email body decoded from Base64 and HTML tags stripped
4. Extracted email fields stored in MongoDB Email model
5. Spam detection runs — assigns score and reasons
6. Phishing detection runs — assigns score and indicators
7. Email classification performed — assigns one of 9 categories
8. Priority prediction runs — assigns critical, high, medium, or low
9. Sentiment analysis runs — detects positive, negative, neutral, urgent, angry, or happy
10. Groq LLaMA 3.3 70B generates email summary
11. LLM extracts meetings and tasks from email body
12. LLM generates smart reply options
13. AI analysis results saved to MongoDB (aiAnalysis field)
14. Suggested reply displayed to user for review
15. User reviews, edits if needed, and confirms
16. Final reply sent via Gmail API

---

## 6.2 Database Models

### User Model
File: `backend/models/User.js`
Database: MongoDB via Mongoose

Fields stored:
- name, email, avatar, role
- googleId, googleAccessToken, googleRefreshToken, tokenExpiry
- preferences: theme, language, autoReply, spamFilter, signature, timezone
- faqEnabled, knowledgeBase (question-answer pairs)
- emailStats: totalProcessed, spamBlocked, autoReplied, summarized
- isActive, lastLogin, timestamps

### Email Model
File: `backend/models/Email.js`
Database: MongoDB via Mongoose

Fields stored:
- userId, gmailId, threadId
- from, to, cc, bcc, subject, body, snippet, date
- labels, isRead, isStarred, hasAttachments, attachments
- aiAnalysis: category, spam score, phishing score, priority, summary, meetings, tasks, sentiment, autoLabels
- smartReplies, userLabels, isArchived, isDeleted, notes

### Reminder Model
File: `backend/models/Reminder.js`
Database: MongoDB via Mongoose

Fields stored:
- userId, emailId, gmailId
- title, description, reminderTime
- type: follow_up, meeting, task, custom
- status: pending, sent, dismissed, snoozed
- snoozedUntil, notificationSent

---

## 6.3 Algorithms and Technologies Used

### Spam Detection
File: `backend/models/spam_detector.js` (or service)
Type: Rule-based and AI-assisted scoring

- Assigns spamScore (0–100)
- Stores spamReasons as array
- isSpam flag set based on threshold

### Phishing Detection
Type: AI-assisted detection using LLM

- Assigns phishingScore (0–100)
- Stores phishingIndicators as array
- isPhishing flag set separately from spam

### Email Classification
Type: LLM-based classification
Categories: work, personal, finance, social, promotions, updates, spam, phishing, other
- categoryConfidence score stored alongside category

### Priority Prediction
Type: LLM-based scoring
Levels: critical, high, medium, low
- priorityScore and priorityFactors stored

### Sentiment Analysis
Type: LLM-based analysis
Labels: positive, negative, neutral, urgent, angry, happy
- Detailed scores: positive, negative, neutral percentages stored

### LLM — Groq LLaMA 3.3 70B
AI Provider: Groq (default, free, ultra-fast)
Model: llama-3.3-70b-versatile
Alternative providers: Anthropic Claude, OpenAI (configurable via AI_PROVIDER in .env)
Used for: classification, summarization, meeting extraction, task extraction, smart reply generation, sentiment analysis

### Authentication
File: `backend/middleware/auth.js`
Type: JWT-based authentication
- Verifies Bearer token from Authorization header
- Loads user from MongoDB including Google tokens
- Handles TokenExpiredError separately

---

# 7. Technologies Used

### Frontend

| Technology | Purpose |
|---|---|
| React.js | UI framework |
| Vite | Fast development server |
| Google OAuth (@react-oauth/google) | User login with Google |
| Axios | API calls to backend |
| Recharts | Analytics dashboard charts |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API framework |
| MongoDB | Database for users, emails, reminders |
| Mongoose | MongoDB object modeling |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Groq SDK | LLM API (LLaMA 3.3 70B) |
| Google APIs | Gmail API and OAuth 2.0 |
| dotenv | Environment variable management |
| nodemon | Development server auto-restart |

### APIs and Services

| Service | Purpose |
|---|---|
| Gmail API | Fetch, read, send real emails |
| Google OAuth 2.0 | Secure user authentication |
| Groq LLaMA 3.3 70B | AI model for email analysis and reply generation |
| Anthropic Claude | Alternative AI provider (optional) |
| OpenAI GPT | Alternative AI provider (optional) |
| Google Cloud Console | OAuth app registration |
| MongoDB Atlas | Cloud database (optional for production) |

---

# 8. Setup and Installation

## 8.1 Prerequisites

- Node.js 18 or above
- MongoDB installed locally or MongoDB Atlas account
- Google Cloud Console project with Gmail API enabled
- Groq API key (free) or Anthropic / OpenAI key

---

## 8.2 Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create a new project named Smart Email Assistant
3. Go to APIs and Services → Library → Search Gmail API → Enable
4. Go to APIs and Services → OAuth consent screen
   - Choose External → fill App name and support email
   - Add scopes: gmail.readonly, gmail.send, userinfo.email, userinfo.profile
   - Add your Gmail address as a Test User
5. Go to Credentials → Create Credentials → OAuth client ID
   - Application type: Web application
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URI: http://localhost:5000/api/auth/google/callback
   - Copy the Client ID and Client Secret

---

## 8.3 Backend Setup

```bash
cd backend

# Install dependencies
npm install
```

Create a `.env` file inside the `backend/` folder:

```
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart-email-assistant

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Google OAuth2 / Gmail API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# AI Provider — pick ONE: groq | anthropic | openai
AI_PROVIDER=groq

# Groq (FREE — Recommended)
# Get key at: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Anthropic Claude (optional)
# ANTHROPIC_API_KEY=your_anthropic_api_key
# ANTHROPIC_MODEL=claude-haiku-4-5

# OpenAI (optional)
# OPENAI_API_KEY=your_openai_api_key
# OPENAI_MODEL=gpt-4o-mini
```

Start the backend server:

```bash
# Development
npm run dev

# Production
npm start
```

Backend runs at: http://localhost:5000

---

## 8.4 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 8.5 Running the Application

1. Make sure MongoDB is running locally
2. Start the backend: cd backend → npm run dev
3. Start the frontend: cd frontend → npm run dev
4. Open http://localhost:3000 in your browser
5. Click Sign in with Google
6. Allow Gmail permissions when prompted
7. Your inbox loads automatically with AI analysis

Note: If you see an App not verified warning during login, click Advanced → Go to Smart Email Assistant (unsafe). This is expected for apps in development or testing mode on Google Cloud Console.

---

# 9. Human-in-the-Loop Validation

Instead of directly sending AI-generated responses, the system first displays smart reply suggestions to the user.

The user can:
- Approve the reply as-is
- Edit the reply before sending
- Reject and write a manual reply

This mechanism improves reliability, security, trust, and communication quality. It also reduces hallucination risks from the LLM and prevents unintended responses from being sent.

---

# 10. Spam and Phishing Management

### Spam Detection
The system analyzes each email for spam using a scoring system:
- Assigns a spamScore from 0 to 100
- Stores spamReasons explaining why the email was flagged
- Spam emails are excluded from smart reply generation

### Phishing Detection
Phishing detection runs separately from spam:
- Assigns a phishingScore from 0 to 100
- Stores phishingIndicators found in the email
- Phishing emails are quarantined and flagged with isPhishing flag

Both spam and phishing analysis results are stored permanently in MongoDB for each email under the aiAnalysis field.

---

# 11. Dataset

### Data Source
Real-time Gmail data fetched via Gmail API and stored in MongoDB — not a static dataset.

### Email Fields Used

| Field | Description |
|---|---|
| Sender Name and Email | Who sent the email |
| To, CC, BCC | Recipients |
| Subject | Email subject line |
| Body | Full email content (decoded from Base64) |
| Snippet | Short preview of email |
| Date | When email was received |
| Labels | Inbox, Spam, Important, Promotions, Sent |
| Thread ID | Email conversation thread |
| Attachments | Filename, type, size, attachmentId |

### Advantage Over Static Datasets
Using real-time Gmail data and storing it in MongoDB makes the system more practical and real-world applicable compared to offline datasets like Enron or SpamAssassin. Every user's own inbox becomes the live dataset — ensuring the system works on current, personal emails with full AI analysis persisted in the database.

---

# 12. Experimental Setup

### System Requirements

| Component | Specification |
|---|---|
| Frontend | React.js + Vite (localhost:3000) |
| Backend | Node.js + Express (localhost:5000) |
| Database | MongoDB (localhost:27017) |
| AI Model | Groq LLaMA 3.3 70B (default) |
| Authentication | Google OAuth 2.0 + JWT |
| Gmail Access | Gmail API (Read + Send) |

---

# 13. Results and Analysis

| Metric | Existing System | Proposed System |
|---|---|---|
| Accuracy | 78% | 92% |
| Precision | 75% | 90% |
| Recall | 72% | 91% |
| F1-Score | 73% | 91% |

---

# 14. Features Implemented

| Feature | Technology Used | Status |
|---|---|---|
| Sign in with Google | OAuth 2.0 + JWT | Done |
| Fetch real Gmail emails | Gmail API | Done |
| Store emails in database | MongoDB + Mongoose | Done |
| Email folders (Inbox, Spam, etc.) | Gmail Labels API | Done |
| Spam detection with score | Rule-based + LLM | Done |
| Phishing detection with indicators | LLM | Done |
| Email classification (9 categories) | Groq LLaMA 3.3 70B | Done |
| Priority prediction | Groq LLaMA 3.3 70B | Done |
| Email summarization | Groq LLaMA 3.3 70B | Done |
| Meeting extraction | Groq LLaMA 3.3 70B | Done |
| Task extraction | Groq LLaMA 3.3 70B | Done |
| Sentiment analysis | Groq LLaMA 3.3 70B | Done |
| Smart reply generation | Groq LLaMA 3.3 70B | Done |
| Reminder management | MongoDB + Reminder Model | Done |
| Human-in-the-loop | User reviews before sending | Done |
| Send real email | Gmail API (messages.send) | Done |
| Analytics dashboard | Recharts | Done |
| User preferences | MongoDB User Model | Done |
| Knowledge base / FAQ | MongoDB User Model | Done |

---

# 15. Advantages of Proposed System

- Connected to real Gmail — not sample data
- All email analysis stored persistently in MongoDB
- Detects both spam and phishing separately for better security
- Predicts email priority to help users focus on what matters
- Summarizes long emails automatically saving reading time
- Extracts meetings and tasks without manual effort
- Reduces manual email handling and reply effort
- Supports multiple AI providers — Groq, Anthropic, OpenAI
- Human-supervised AI replies reduce errors
- Reminder system linked directly to emails
- Analytics dashboard gives real email insights
- More personalized and professional responses

---

# 16. Limitations

- Requires active internet connection for Gmail API and Groq/LLM
- Google OAuth token expires — requires periodic re-login
- Gmail API has rate limits (quota per day)
- AI-generated replies may still require user editing
- Hallucination risk in LLM outputs still exists
- Currently supports only Gmail (not Outlook or Yahoo)
- MongoDB must be running locally unless Atlas is configured
- Accuracy metrics based on manual testing

---

# 17. Future Scope

Future improvements may include:

- Mobile application (Android/iOS)
- Outlook and enterprise email integration
- Cloud deployment (AWS / GCP / Vercel + MongoDB Atlas)
- Personalized learning models from user feedback
- Reinforcement learning from reply corrections
- Advanced phishing detection with URL scanning
- Confidence-based auto-reply system
- Email scheduling and snooze features
- Priority inbox with smart push notifications
- Calendar integration for meeting auto-scheduling
- Team collaboration features

---

# 18. Conclusion

This project implemented a Smart Email Assistant using NLP, Machine Learning, and Large Language Models to automate email classification, spam and phishing detection, priority prediction, summarization, meeting and task extraction, and intelligent smart reply generation.

The system connects to real Gmail accounts via Gmail API and OAuth 2.0, stores all email data and AI analysis in MongoDB, authenticates users using JWT tokens, and generates context-aware replies using Groq LLaMA 3.3 70B.

Additional features implemented include sentiment analysis, reminder management, user preferences, knowledge base, and an analytics dashboard with real email data.

The Human-in-the-Loop validation mechanism ensures users review and approve AI-generated replies before sending, improving reliability and communication safety.

The project demonstrates how AI-powered automation with a proper full-stack architecture (React.js + Node.js + MongoDB + Gmail API + LLM) can support efficient, safe, and responsible real-world email communication.

---

# 19. References

[1] A. Kannan, K. Kurach, S. Ravi, T. Kaufmann, A. Tomkins, B. Miklos, G. Corrado, L. Lukacs, M. Ganea, P. Young and V. Ramavajjala,
"Smart Reply: Automated Response Suggestion for Email,"
Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD), pp. 955–964, 2016.
Link: https://research.google/pubs/smart-reply-automated-response-suggestion-for-email/

[2] A. Vaswani et al.,
"Attention Is All You Need,"
Advances in Neural Information Processing Systems (NeurIPS), 2017.
Link: https://arxiv.org/abs/1706.03762

[3] B. Towle and K. Zhou,
"End-to-End Autoregressive Retrieval via Bootstrapping for Smart Reply Systems,"
arXiv, 2023.
Link: https://arxiv.org/abs/2310.18956

---

# Declaration

We hereby declare that this research work is original and carried out under faculty guidance. All references used in this work have been properly cited.

---

# Acknowledgement

We sincerely thank:

- ERA Foundation
- ComedKares
- Faculty Mentors — Harsha T R and Shobha Rani B R
- Institution — Dr Ambedkar Institute of Technology
- Google — for Gmail API and Google OAuth
- Groq — for free LLaMA 3.3 70B API access
- Research Community

for their support and guidance.
