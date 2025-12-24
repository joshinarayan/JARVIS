// -------------------------
// CONFIG
// -------------------------
const OPENROUTER_KEY = "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";

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
// SEND USER MESSAGE TO AI
// -------------------------
async function send() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  add("user", text);
  statusEl.textContent = "THINKING…";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are JARVIS, Tony Stark's AI assistant. You always reply confidently, clearly, and like Jarvis."
          },
          { role: "user", content: text }
        ]
      })
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I am online, sir.";

    add("jarvis", reply);
    speak(reply);
    statusEl.textContent = "ONLINE";

  } catch (e) {
    console.error(e);
    add("jarvis", "Backend error, sir. Check your API key.");
    statusEl.textContent = "ERROR";
  }
}

// -------------------------
// SPEECH SYNTHESIS (JARVIS VOICE)
// -------------------------
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.5; // low-pitch Jarvis

  // Wait until voices are loaded
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

  // Prefer Google US English male, then any male, then default
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
