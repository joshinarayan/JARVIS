const input = document.getElementById("input");
const statusEl = document.getElementById("status");

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;

  if (text.includes("```")) {
    msg.innerHTML = text.replace(/```(\w+)?([\s\S]*?)```/g, (_, lang, code) => {
      return `
        <pre>
          <button class="copy-btn" onclick="copyCode(this)">Copy</button>
          <code class="language-${lang || "javascript"}">${escapeHtml(code)}</code>
        </pre>
      `;
    });
  } else {
    msg.textContent = text;
  }

  document.getElementById("messages").appendChild(msg);
  Prism.highlightAll();
  msg.scrollIntoView();
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function copyCode(btn) {
  navigator.clipboard.writeText(btn.nextElementSibling.innerText);
  btn.innerText = "Copied!";
  setTimeout(() => btn.innerText = "Copy", 1500);
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage("user", text);
  statusEl.textContent = "Thinking…";

  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text })
  });

  const data = await res.json();
  const reply = data.reply;

  addMessage("jarvis", reply);
  speak(reply);
  statusEl.textContent = "Listening…";
}

function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.95;
  utter.pitch = 0.7;
  utter.voice = speechSynthesis.getVoices().find(v => v.name.includes("Google US English")) 
               || speechSynthesis.getVoices()[0];
  speechSynthesis.speak(utter);
}
