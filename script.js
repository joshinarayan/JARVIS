// API KEY (obfuscated)
const API_KEY = ["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"].join("");

// Memory
function saveMemory(k, v) {
  localStorage.setItem(k, JSON.stringify(v));
}
function loadMemory(k, d = null) {
  return JSON.parse(localStorage.getItem(k)) ?? d;
}

let userName = loadMemory("userName", "Sir");

// UI helpers
function setStatus(t) {
  document.getElementById("statusText").innerText = t.toUpperCase();
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.textContent = `${role}: ${text}`;
  document.getElementById("messages").appendChild(div);
}

// Voice
function speakJarvis(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 0.8;

  document.body.classList.add("hud-speaking");
  setStatus("Speaking");

  u.onend = () => {
    document.body.classList.remove("hud-speaking");
    setStatus("Idle");
  };

  speechSynthesis.speak(u);
}

// AI
async function askAI(text) {
  setStatus("Thinking");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: `You are JARVIS from Iron Man. Calm, precise.` },
        { role: "user", content: text }
      ]
    })
  });

  const data = await res.json();
  const reply = data.choices[0].message.content;

  addMessage("Jarvis", reply);
  speakJarvis(reply);
}

// Commands
function handle(text) {
  text = text.toLowerCase();

  if (text.includes("time")) {
    const t = new Date();
    speakJarvis(`The time is ${t.getHours()} ${t.getMinutes()}`);
    return;
  }

  if (text.includes("battery")) {
    navigator.getBattery().then(b =>
      speakJarvis(`Battery level is ${Math.round(b.level * 100)} percent`)
    );
    return;
  }

  if (text.includes("open")) {
    speakJarvis("Attempting to comply.");
    return;
  }

  askAI(text);
}

// Input
function send() {
  const input = document.getElementById("input");
  const text = input.value;
  input.value = "";
  addMessage("You", text);
  handle(text);
}

// Wake word
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR) {
  const rec = new SR();
  rec.continuous = true;
  rec.onresult = e => {
    const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
    if (t.includes("hey jarvis")) {
      speakJarvis("Yes, sir?");
    }
  };
  rec.start();
}

// Boot
window.onload = () => {
  setStatus("Booting");
  setTimeout(() => setStatus("Calibrating"), 800);
  setTimeout(() => {
    setStatus("Online");
    speakJarvis("All systems are now online, sir.");
  }, 1600);
};
