// -------------------------
// CONFIG
// -------------------------
const BACKEND_URL = "https://jarvis-backend-lllv.onrender.com"; // Replace with your Render URL

const statusEl = document.getElementById("status");
const chatPanel = document.getElementById("chatPanel");
const messages = document.getElementById("messages");
const input = document.getElementById("input");

// -------------------------
// CHAT PANEL TOGGLE
// -------------------------
function toggleChat() {
  chatPanel.classList.toggle("open");
  if (chatPanel.classList.contains("open")) {
    setTimeout(() => input.focus(), 300); // focus after slide in
  }
}

// -------------------------
// ADD MESSAGE TO PANEL
// -------------------------
function add(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  div.scrollIntoView({ behavior: "smooth" });
}

// -------------------------
// SEND USER MESSAGE TO BACKEND
// -------------------------
async function send() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  add("user", text);
  statusEl.textContent = "THINKING…";

  try {
    const res = await fetch(`${BACKEND_URL}/api/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });

    const data = await res.json();
    const reply = data.reply;

    add("jarvis", reply);
    speak(reply);
    statusEl.textContent = "ONLINE";

  } catch (e) {
    console.error(e);
    add("jarvis", "Backend error, sir.");
    statusEl.textContent = "ERROR";
  }
}

// -------------------------
// SPEECH SYNTHESIS (JARVIS VOICE)
// -------------------------
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.5; // Jarvis low pitch

  let voices = speechSynthesis.getVoices();
  if (!voices.length) {
    window.speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
      speakWithVoice(text, voices);
    };
  } else {
    speakWithVoice(text, voices);
  }
}

function speakWithVoice(text, voices) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.5;

  let jarvisVoice =
    voices.find(v => v.name.includes("Google US English") && /male/i.test(v.name)) ||
    voices.find(v => /male/i.test(v.name)) ||
    voices[0];

  utter.voice = jarvisVoice;
  speechSynthesis.speak(utter);
}

// -------------------------
// ENTER KEY HANDLER
// -------------------------
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") send();
});
