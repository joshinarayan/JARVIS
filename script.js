const OPENROUTER_KEY = "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";

const statusEl = document.getElementById("status");
const chatPanel = document.getElementById("chatPanel");
const messages = document.getElementById("messages");
const input = document.getElementById("input");

function toggleChat() {
  chatPanel.classList.toggle("open");
  if(chatPanel.classList.contains("open")) {
    setTimeout(() => input.focus(), 300); // focus input after sliding in
  }
}

function add(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role}`;
  div.textContent = text;
  messages.appendChild(div);
  div.scrollIntoView({behavior: "smooth"});
}

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
            content: "You are JARVIS, Tony Stark's AI assistant. Always reply confidently and clearly."
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
    add("jarvis", "Backend error sir. Check your key.");
    statusEl.textContent = "ERROR";
  }
}

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 0.6;
  u.voice = speechSynthesis.getVoices().find(v=>v.name.includes("Google")) || speechSynthesis.getVoices()[0];
  speechSynthesis.speak(u);
}
