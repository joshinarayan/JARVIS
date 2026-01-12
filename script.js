/* ================== CONFIG ================== */
const BACKEND = "https://jarvis-backend-lllv.onrender.com/api/ask";

/* ================== ELEMENTS ================== */
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");
const openChatBtn = document.getElementById("openChatBtn");
const chatPanel = document.getElementById("chatPanel");
const video = document.getElementById("camera");

/* ================== UI ================== */
openChatBtn.onclick = () => chatPanel.style.right = "0";
function closeChat() { chatPanel.style.right = "-100%"; }

function add(text, type) {
  const d = document.createElement("div");
  d.className = "msg " + type;
  d.innerText = text;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

/* ================== SPEECH ================== */
function speak(text) {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = 0.55;
  u.rate = 0.9;
  const voices = speechSynthesis.getVoices();
  u.voice =
    voices.find(v => /male|google|english/i.test(v.name)) ||
    voices.find(v => v.lang.includes("en"));
  speechSynthesis.speak(u);
}

/* ================== LOGIN ================== */
async function login() {
  const username = userInput.value.trim();
  const password = passInput.value.trim();
  if (!username || !password) return alert("Missing credentials");

  const r = await fetch(`${BACKEND}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!r.ok) {
    alert("Access denied");
    return;
  }

  speak("Credentials verified. Initiating biometric scan.");
  await startCamera();
  await enrollOrVerifyFace();
}

/* ================== CAMERA ================== */
let stream;

async function startCamera() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  video.play();
}

/* ================== FACE AI (CLIENT SIDE) ================== */
/* NOTE: Placeholder embedding generator
   Replace with face-api.js / MediaPipe later */
function fakeEmbedding() {
  return Array.from({ length: 128 }, () => Math.random());
}

/* ================== FACE FLOW ================== */
async function enrollOrVerifyFace() {
  const embedding = fakeEmbedding();

  const verify = await fetch(`${BACKEND}/api/face/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embedding })
  }).then(r => r.json());

  if (verify.match) {
    unlockSystem();
  } else {
    await fetch(`${BACKEND}/api/face/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embedding })
    });
    unlockSystem();
  }
}

/* ================== UNLOCK ================== */
function unlockSystem() {
  loginScreen.style.display = "none";
  dashboard.style.display = "block";
  speak("Identity confirmed. Jarvis online, sir.");
  initVoice();
}

/* ================== SEND ================== */
sendBtn.onclick = () => send();
msgInput.addEventListener("keydown", e => e.key === "Enter" && send());

async function send(textInput = null) {
  const text = textInput || msgInput.value.trim();
  if (!text) return;

  add(text, "user");
  if (!textInput) msgInput.value = "";

  const r = await fetch(`${BACKEND}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text })
  });

  const data = await r.json();
  add(data.reply, "bot");
  speak(data.reply);

  if (data.action === "open" && data.target)
    window.open(data.target, "_blank");
  if (data.action === "search" && data.target)
    window.open("https://google.com/search?q=" + data.target);
}

/* ================== VOICE WAKE ================== */
let listening = false;
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new SpeechRecognition();
recog.continuous = true;
recog.lang = "en-US";

function initVoice() {
  recog.start();
}

recog.onresult = e => {
  const t = e.results[e.results.length - 1][0].transcript.toLowerCase();
  console.log("🎤", t);

  if (!listening && t.includes("jarvis")) {
    listening = true;
    speak("Yes sir?");
    return;
  }

  if (listening) {
    send(t);
    listening = false;
  }
};

recog.onerror = () => recog.start();
recog.onend = () => recog.start();
