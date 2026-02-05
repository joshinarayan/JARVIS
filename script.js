/* ================== VOICE & CHAT ================== */

let isListening = false;

/* ---------- SPEAK ---------- */

async function speak(text, useElevenLabs = false) {
    if (!text) return;

    window.speechSynthesis.cancel();

    if (useElevenLabs && ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== "LABS_API_KEY") {
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
            const audio = new Audio(URL.createObjectURL(blob));
            await audio.play();
            return;

        } catch (e) {
            console.warn("ElevenLabs failed → fallback", e);
        }
    }

    // Fallback TTS
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1;
    u.pitch = 0.9;

    const voices = speechSynthesis.getVoices();
    u.voice = voices.find(v => v.lang === "en-IN") || voices[0];

    speechSynthesis.speak(u);
}


/* ---------- SPEECH RECOGNITION ---------- */

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Speech Recognition not supported on this browser");
}

const recog = new SpeechRecognition();

// IMPORTANT SETTINGS
recog.lang = "en-IN";
recog.continuous = false;       // more stable
recog.interimResults = false;


/* ---------- START LISTENING (USER CLICK REQUIRED) ---------- */

function initVoice() {

    if (isListening) return;

    // Ask permission by user click
    document.body.addEventListener("click", startVoiceOnce, { once: true });

    speak("Click anywhere to activate voice control, sir.", true);
}


function startVoiceOnce() {
    try {
        recog.start();
        isListening = true;

        console.log("🎤 Voice started");

    } catch (e) {
        console.error("Mic start failed:", e);
    }
}


/* ---------- HANDLE VOICE ---------- */

recog.onresult = async (event) => {

    const result = event.results[0][0].transcript.trim();

    console.log("🎧 Heard:", result);

    if (!result) return;

    addMessage(result, "user");

    const lower = result.toLowerCase();


    // Wake word
    if (lower.startsWith("jarvis")) {

        const command = result.replace(/jarvis/i, "").trim();

        if (!command) {
            await speak("Yes sir?", true);
            return;
        }

        await send(command);

    } else {
        // Optional: respond even without wake word
        await send(result);
    }
};


/* ---------- AUTO RESTART ---------- */

recog.onend = () => {

    console.log("🔁 Voice ended");

    if (window.isUnlocked) {
        setTimeout(() => {
            try {
                recog.start();
            } catch {}
        }, 500);
    }
};


recog.onerror = (e) => {

    console.warn("🎤 Mic error:", e.error);

    if (window.isUnlocked) {
        setTimeout(() => {
            try {
                recog.start();
            } catch {}
        }, 1000);
    }
};



/* ================== BACKEND COMM ================== */

sendBtn.onclick = () => send();

msgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") send();
});


async function send(textOverride) {

    const text = textOverride || msgInput.value.trim();

    if (!text) return;

    if (!textOverride) msgInput.value = "";

    addMessage(text, "user");

    try {

        const localTime = new Date().toLocaleString();

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
            throw new Error("Invalid AI response");
        }

        addMessage(data.reply, "bot");

        await speak(data.reply, true);


        // Actions
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
document.getElementById("openGestureBtn").onclick = () => {
    window.open("gesture.html", "_blank");
};


/* ================== EXPORT ================== */

window.login = login;
window.closeChat = closeChat;
