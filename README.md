# 🤖 JARVIS – Personal AI System

JARVIS is a **secure, master-locked personal AI assistant backend** inspired by Iron Man’s JARVIS — but built for **real control, zero roleplay, and strict behavior enforcement**.

This project is designed as a **private AI system**, not a chatbot toy.

---

## 🚀 Features

### 🔐 Master Authentication
- Username + password login
- Password stored as **SHA256 hash**
- Only one authorized master user
- Unauthorized users are rejected

---

### 👤 Face Verification (Prototype)
- Face embedding enrollment
- Face verification using similarity logic
- Designed for `face-api.js` integration
- Currently mocked for logic testing

---

### 🧠 AI Core (OpenRouter)
- Uses OpenRouter API
- Model: `meta-llama/llama-3.1-8b-instruct`
- Short-term memory (last 6 messages)
- Context-safe conversation handling

---

### 🧾 Strict System Prompt Rules
JARVIS follows **non-negotiable rules**:

- ❌ No roleplay
- ❌ No emotions
- ❌ No flirting
- ❌ No jokes
- ❌ No personality drift
- ❌ No storytelling

✔ AI identifies strictly as an **artificial intelligence system**  
✔ Professional, robotic, calm, minimal responses  
✔ Answers only what is asked  
✔ Asks for clarification if input is unclear  

---

### 🌐 Language Detection
- Automatically detects user language
- **English input → English output**
- **Hindi input → Hindi output (Devanagari)**
- No language mixing
- No translation unless explicitly asked

---

### 🕒 Time Awareness
- Uses **user-provided local time only**
- Never guesses date or time
- Responds with time only if asked

---

### 🗣 Voice / TTS Ready
- Designed for ElevenLabs or any TTS service
- Backend already structured for audio responses
- Voice ID configurable
- Typing + speaking supported

---

### 📦 Memory System
- Stores short conversation history
- Prevents hallucinations
- Keeps context minimal for stability

---

### 🧪 JSON-Only Output Enforcement
Every AI response MUST be valid JSON:

```json
{
  "reply": "text",
  "action": "none | open | search",
  "target": ""
}