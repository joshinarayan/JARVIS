const loginScreen = document.getElementById("login-screen");
const jarvisUI = document.getElementById("jarvis-ui");
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const dashboard = document.getElementById("dashboard");

// Replace with your OpenRouter key
const OPENROUTER_KEY = "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";  

let memory = JSON.parse(localStorage.getItem("jarvisMemory")) || [
  { role: "system", content: "You are JARVIS, a professional, intelligent AI assistant." }
];

let previousChat = JSON.parse(localStorage.getItem("chatHistory")) || [];
previousChat.forEach(msg => add(msg.text, msg.type));

function add(text, cls) {
  const div = document.createElement("div");
  div.className = "msg " + cls;
  div.innerText = text;

  // Interactive button
  if (cls === "jarvis") {
    const btn = document.createElement("button");
    btn.innerText = "Clear Chat";
    btn.className = "panel-button";
    btn.onclick = () => {
      chat.innerHTML = "";
      previousChat = [];
      localStorage.removeItem("chatHistory");
      updateDashboard();
    };
    div.appendChild(btn);
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  previousChat.push({ text, type: cls });
  localStorage.setItem("chatHistory", JSON.stringify(previousChat));

  updateDashboard();
}

function clean(text) { return text.replace(/<\/?s>/g, "").trim(); }

// Login
function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) { alert("Enter username and password!"); return; }
  localStorage.setItem("jarvisUser", username);
  loginScreen.classList.add("hidden");
  jarvisUI.classList.remove("hidden");
  add(`Welcome, ${username}! Jarvis online.`, "jarvis");
}

// AI call (direct OpenRouter API)
async function send() {
  const text = input.value.trim();
  if (!text) return;
  input.value = "";
  add("You: " + text, "user");
  add("JARVIS: Thinking...", "jarvis");

  try {
    memory.push({ role: "user", content: text });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + OPENROUTER_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: memory
      })
    });

    const data = await res.json();
    chat.lastChild.remove();

    let reply = (data.choices[0].message.content || "").trim();
    if (!reply) reply = "I'm online and ready.";

    memory.push({ role: "assistant", content: reply });
    localStorage.setItem("jarvisMemory", JSON.stringify(memory));
    add("JARVIS: " + reply, "jarvis");
  } catch (err) {
    chat.lastChild.remove();
    add("JARVIS: AI backend error.", "jarvis");
    console.error(err);
  }
}

// Voice input + wake word
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
recognition.continuous = true;

recognition.onresult = e => {
  const transcript = e.results[e.results.length-1][0].transcript.toLowerCase();
  if (transcript.includes("hey jarvis")) {
    recognition.stop();
    speak("Yes?");
    recognition.start();
  } else if (transcript.trim() !== "") {
    input.value = transcript;
    send();
  }
};

recognition.onerror = () => console.log("Voice recognition error.");
recognition.start();

// Text-to-speech
function speak(text) { const u = new SpeechSynthesisUtterance(text); speechSynthesis.speak(u); }

// Dashboard panels
function updateDashboard() {
  dashboard.innerHTML = "";
  const panels = [
    { title: "Messages", value: chat.children.length },
    { title: "Memory", value: memory.length },
    { title: "Active User", value: localStorage.getItem("jarvisUser") || "None" },
    { title: "Time", value: new Date().toLocaleTimeString() }
  ];
  panels.forEach(p => {
    const div = document.createElement("div");
    div.className = "panel";
    div.innerHTML = `<h3>${p.title}</h3><p>${p.value}</p>`;
    dashboard.appendChild(div);
  });
}

// Update dashboard every second
setInterval(updateDashboard, 1000);
