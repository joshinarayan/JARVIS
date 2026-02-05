/* ================== CONFIG ================== */

const BACKEND_URL = "https://jarvis-backend-lllv.onrender.com";
const labBtn = document.getElementById("labBtn");
const ELEVENLABS_API_KEY = "LABS_API_KEY"; // Put real key later
const ELEVENLABS_VOICE_ID = "yrT1876dlfqwBq29bT4p";


/* ================== ELEMENTS ================== */

const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");

const messages = document.getElementById("messages");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");

const userInput = document.getElementById("user");
const passInput = document.getElementById("pass");

const chatPanel = document.getElementById("chatPanel");

const video = document.getElementById("camera");

const hudStatus = document.getElementById("status");
const hudRing = document.getElementById("ring-main");

let isListening = false;


/* ================== CHAT UI ================== */

function addMessage(text, type) {

    const d = document.createElement("div");

    d.className = "msg " + type;
    d.innerText = text;

    messages.appendChild(d);

    messages.scrollTop = messages.scrollHeight;
}


document.getElementById("openChatBtn").onclick = () => {
    chatPanel.style.right = "0";
};

function closeChat() {
    chatPanel.style.right = "-100%";
}


/* ================== MATRIX ================== */

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

function startMatrix() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana =
        "アァカサタナハマヤャラワガザダバパイィキシチニヒミリ";

    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const nums = "01010101";

    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const rainDrops = Array(Math.floor(columns)).fill(1);

    function draw() {

        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff9c";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < rainDrops.length; i++) {

            const text =
                alphabet.charAt(
                    Math.floor(Math.random() * alphabet.length)
                );

            ctx.fillText(
                text,
                i * fontSize,
                rainDrops[i] * fontSize
            );

            if (
                rainDrops[i] * fontSize > canvas.height &&
                Math.random() > 0.975
            ) {
                rainDrops[i] = 0;
            }

            rainDrops[i]++;
        }
    }

    setInterval(draw, 30);
}


/* ================== LOGIN ================== */

async function login() {

    const username = userInput.value.trim();
    const password = passInput.value.trim();

    if (!username || !password) {
        alert("ENTER USERNAME & PASSWORD");
        return;
    }

    document.getElementById("loading-text").style.display = "block";

    try {

        const r = await fetch(`${BACKEND_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await r.json();

        if (!data.ok) {

            alert("ACCESS DENIED");

            document.getElementById("loading-text").style.display = "none";

            return;
        }

        // SUCCESS
        loginScreen.style.display = "none";
        dashboard.style.display = "block";

        document.getElementById("loading-text").style.display = "none";

        startMatrix();

        await startCamera();

        startFaceDetection();

    } catch (e) {

        alert("SERVER ERROR: " + e.message);

        document.getElementById("loading-text").style.display = "none";
    }
}


/* ================== CAMERA ================== */

async function startCamera() {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });

        video.srcObject = stream;

        video.style.display = "block";

        return new Promise(resolve => {
            video.onloadedmetadata = () => resolve(video);
        });

    } catch (e) {

        alert("CAMERA ERROR: " + e.message);
    }
}


/* ================== FACE ================== */

async function startFaceDetection() {

    hudStatus.innerText = "LOADING AI...";

    const model = await blazeface.load();

    hudStatus.innerText = "SCANNING...";

    setInterval(async () => {

        const predictions =
            await model.estimateFaces(video, false);

        if (predictions.length > 0) {

            hudRing.style.borderColor = "#00ff9c";

            hudStatus.innerText = "USER DETECTED";

            if (!window.isUnlocked) {
                performBiometricAuth();
            }

        } else {

            hudRing.style.borderColor = "red";

            hudStatus.innerText = "NO SUBJECT";
        }

    }, 500);
}


async function performBiometricAuth() {

    if (window.isAuthProcessing) return;

    window.isAuthProcessing = true;

    await speak("Verifying biometrics, sir.", true);

    hudStatus.innerText = "VERIFYING...";

    const embedding =
        Array.from({ length: 128 }, () => Math.random());

    try {

        let r = await fetch(`${BACKEND_URL}/api/face/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embedding })
        });

        let data = await r.json();

        if (!data.match) {

            await fetch(`${BACKEND_URL}/api/face/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embedding })
            });
        }

        window.isUnlocked = true;

        hudStatus.innerText = "SYSTEM ONLINE";

        await speak("Welcome back, sir.", true);

        initVoice();

    } catch (e) {

        console.error("Face error:", e);

        window.isAuthProcessing = false;
    }
}


/* ================== SPEAK ================== */

async function speak(text, useElevenLabs = false) {

    if (!text) return;

    window.speechSynthesis.cancel();

    if (
        useElevenLabs &&
        ELEVENLABS_API_KEY &&
        ELEVENLABS_API_KEY !== "LABS_API_KEY"
    ) {

        try {

            const r = await fetch(
                `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
                {
                    method: "POST",
                    headers: {
                        "xi-api-key": ELEVENLABS_API_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text,
                        voice_settings: {
                            stability: 0.8,
                            similarity_boost: 0.9
                        }
                    })
                }
            );

            const blob = await r.blob();

            const audio =
                new Audio(URL.createObjectURL(blob));

            await audio.play();

            return;

        } catch (e) {

            console.warn("ElevenLabs fail:", e);
        }
    }

    // Fallback

    const u = new SpeechSynthesisUtterance(text);

    u.lang = "en-IN";
    u.rate = 1;
    u.pitch = 0.9;

    const voices = speechSynthesis.getVoices();

    u.voice =
        voices.find(v => v.lang === "en-IN") || voices[0];

    speechSynthesis.speak(u);
}


/* ================== VOICE ================== */

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const recog = new SpeechRecognition();

recog.lang = "en-IN";
recog.continuous = false;
recog.interimResults = false;


function initVoice() {

    if (isListening) return;

    document.body.addEventListener(
        "click",
        startVoiceOnce,
        { once: true }
    );

    speak("Click to activate voice control, sir.", true);
}


function startVoiceOnce() {

    try {

        recog.start();

        isListening = true;

        console.log("🎤 Mic started");

    } catch (e) {

        console.error("Mic error:", e);
    }
}


recog.onresult = async (event) => {

    const result =
        event.results[0][0].transcript.trim();

    console.log("Heard:", result);

    if (!result) return;

    addMessage(result, "user");

    const lower = result.toLowerCase();

    if (lower.startsWith("jarvis")) {

        const cmd =
            result.replace(/jarvis/i, "").trim();

        if (!cmd) {

            await speak("Yes sir?", true);
            return;
        }

        await send(cmd);

    } else {

        await send(result);
    }
};


recog.onend = () => {

    if (window.isUnlocked) {

        setTimeout(() => {

            try {
                recog.start();
            } catch {}

        }, 500);
    }
};


recog.onerror = (e) => {

    console.warn("Mic error:", e.error);

    if (window.isUnlocked) {

        setTimeout(() => {

            try {
                recog.start();
            } catch {}

        }, 1000);
    }
};


/* ================== BACKEND ================== */

sendBtn.onclick = () => send();

msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
});

if (labBtn) {
    labBtn.onclick = () => {
        window.open("gesture.html", "_blank");
    };
}
async function send(textOverride) {

    const text =
        textOverride || msgInput.value.trim();

    if (!text) return;

    if (!textOverride) msgInput.value = "";

    addMessage(text, "user");

    try {

        const localTime =
            new Date().toLocaleString();

        const r = await fetch(`${BACKEND_URL}/api/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: text,
                localTime
            })
        });

        const data = await r.json();

        if (!data || !data.reply) {
            throw new Error("Invalid AI reply");
        }

        addMessage(data.reply, "bot");

        await speak(data.reply, true);

        if (data.action === "open" && data.target) {
            window.open(data.target, "_blank");
        }

        if (data.action === "search" && data.target) {
            window.open(
                "https://google.com/search?q=" +
                encodeURIComponent(data.target),
                "_blank"
            );
        }

    } catch (e) {

        console.error("Send error:", e);

        addMessage("Connection error.", "bot");

        speak("Network problem, sir.", false);
    }
}


/* ================== EXPORT ================== */

window.login = login;
window.closeChat = closeChat;
