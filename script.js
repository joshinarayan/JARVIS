/* ================== CONFIG ================== */
// IMPORTANT: Remove the specific path. Use only the base domain.
// If testing locally, use "http://localhost:3000"
const BACKEND_URL = "https://jarvis-backend-lllv.onrender.com"; 

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

/* ================== UI CONTROL ================== */
document.getElementById("openChatBtn").onclick = () => chatPanel.style.right = "0";
function closeChat() { chatPanel.style.right = "-100%"; }

function addMessage(text, type) {
    const d = document.createElement("div");
    d.className = "msg " + type;
    d.innerText = text;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
}

/* ================== MATRIX RAIN EFFECT ================== */
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

function startMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const katakana = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";
    const latin = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const nums = "01010101";
    const alphabet = katakana + latin + nums;
    
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const rainDrops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";
        
        for(let i = 0; i < rainDrops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
            
            if(rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975){
                rainDrops[i] = 0;
            }
            rainDrops[i]++;
        }
    }
    setInterval(draw, 30);
}

/* ================== LOGIN FLOW ================== */
async function login() {
    const username = userInput.value.trim();
    const password = passInput.value.trim();
    
    if (!username || !password) return alert("CREDENTIALS REQUIRED");

    // Show loading
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

        speak("Password accepted. Initializing optical sensors.");
        loginScreen.style.display = "none";
        dashboard.style.display = "block";
        
        startMatrix(); // Start visual effect
        await startCamera(); // Start camera
        startFaceDetection(); // Start AI loop

    } catch (e) {
        alert("SERVER ERROR: " + e.message);
        document.getElementById("loading-text").style.display = "none";
    }
}

/* ================== CAMERA & FACE AI ================== */
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }, 
            audio: false 
        });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
            };
        });
    } catch (e) {
        alert("CAMERA ERROR: " + e.message);
    }
}

async function startFaceDetection() {
    hudStatus.innerText = "LOADING AI MODELS...";
    const model = await blazeface.load();
    hudStatus.innerText = "SEARCHING FOR FACE...";
    
    // AI Loop
    setInterval(async () => {
        const predictions = await model.estimateFaces(video, false);
        
        if (predictions.length > 0) {
            // Face Found
            hudRing.style.borderColor = "#00ff9c"; // Green
            hudRing.style.boxShadow = "0 0 40px #00ff9c";
            hudStatus.innerText = "USER DETECTED";
            
            // Only unlock if we haven't already (simple check)
            if (!window.isUnlocked) {
                // Here we simulate the enrollment for the demo
                // In a real app, you would crop the face and send it
                performBiometricAuth();
            }
        } else {
            // No Face
            hudRing.style.borderColor = "red";
            hudRing.style.boxShadow = "0 0 40px red";
            hudStatus.innerText = "NO SUBJECT";
        }
    }, 500); // Check every 500ms
}

async function performBiometricAuth() {
    if (window.isAuthProcessing) return;
    window.isAuthProcessing = true;
    
    speak("Face detected. Verifying biometrics.");
    hudStatus.innerText = "VERIFYING...";

    // Mock embedding generation for demo stability
    const embedding = Array.from({ length: 128 }, () => Math.random());

    try {
        const r = await fetch(`${BACKEND_URL}/api/face/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embedding })
        });
        
        const data = await r.json();
        
        // Auto-enroll if fails (Logic from your original code)
        if (!data.match) {
             await fetch(`${BACKEND_URL}/api/face/enroll`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embedding })
            });
        }

        window.isUnlocked = true;
        hudStatus.innerText = "SYSTEM ONLINE";
        speak("Welcome back, sir. Systems are ready.");
        initVoice();

    } catch (e) {
        console.error("Auth failed", e);
        window.isAuthProcessing = false;
    }
}

/* ================== VOICE & CHAT ================== */
function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 0.8;
    const voices = window.speechSynthesis.getVoices();
    // Try to find a cool voice
    u.voice = voices.find(v => v.name.includes("Google US English")) || voices[0];
    window.speechSynthesis.speak(u);
}

// Voice Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new SpeechRecognition();
recog.continuous = true; // Keep listening
recog.interimResults = false;
recog.lang = "en-US";

function initVoice() {
    try {
        recog.start();
        console.log("🎤 Voice initialized");
    } catch (e) {
        console.log("Voice already started");
    }
}

recog.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log("Heard:", transcript);

    if (transcript.includes("jarvis")) {
        const command = transcript.replace("jarvis", "").trim();
        if (command) {
            send(command);
        } else {
            speak("Yes sir?");
        }
    }
};

recog.onend = () => {
    // Auto restart voice listener
    if (window.isUnlocked) recog.start();
};

/* ================== BACKEND COMM ================== */
sendBtn.onclick = () => send();
msgInput.addEventListener("keydown", e => e.key === "Enter" && send());

async function send(textOverride) {
    const text = textOverride || msgInput.value.trim();
    if (!text) return;

    if (!textOverride) msgInput.value = "";
    addMessage(text, "user");

    try {
        const r = await fetch(`${BACKEND_URL}/api/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: text })
        });

        const data = await r.json();
        
        addMessage(data.reply, "bot");
        speak(data.reply);

        if (data.action === "open" && data.target) window.open(data.target, "_blank");
        if (data.action === "search" && data.target) window.open("https://google.com/search?q=" + data.target, "_blank");
        
    } catch (e) {
        addMessage("Error: " + e.message, "bot");
    }
}
window.login = login;
window.closeChat = closeChat;

