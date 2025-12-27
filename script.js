const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

/* UI elements */
const chatPanel = document.getElementById("chatPanel");
const openChat = document.getElementById("openChat");
const messages = document.getElementById("messages");
const input = document.getElementById("msg");
const sendBtn = document.getElementById("send");

/* OPEN CHAT PANEL */
openChat.onclick = () => {
  chatPanel.classList.add("open");
};

/* ADD MESSAGE */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.innerText = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

/* SPEECH OUTPUT - DEEP MALE JARVIS */
function speak(txt) {
  const v = new SpeechSynthesisUtterance(txt);
  v.pitch = 0.4;
  v.rate = 0.9;
  v.volume = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(v);
}

/* SENT TO BACKEND */
async function send() {
  let msg = input.value.trim();
  if (!msg) return;

  addMessage(msg, "user");
  input.value = "";

  let botBubble = addMessage("⟳ Processing, sir...", "bot");

  try {
    const res = await fetch(backend, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: msg })
    });

    const data = await res.json();

    botBubble.innerText = data.reply || "⚠ No response sir.";
    speak(botBubble.innerText);

  } catch (err) {
    botBubble.innerText = "⚠ Connection failed sir.";
    console.log(err);
  }

  messages.scrollTop = messages.scrollHeight;
}

/* SEND BUTTON & ENTER */
sendBtn.onclick = send;
input.addEventListener("keypress", e => { if (e.key === "Enter") send(); });

/* WAKE WORD: "Jarvis" - no infinite trigger */
let listening = false;

function startWakeWord() {
  if (listening) return;
  listening = true;

  const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  rec.continuous = true;

  rec.onresult = e => {
    let t = e.results[e.resultIndex][0].transcript.toLowerCase();
    if (t.includes("jarvis")) {
      speak("Online sir.");
    }
  };

  rec.onend = () => { listening = false; setTimeout(startWakeWord, 500); };
  rec.start();
}

startWakeWord();
