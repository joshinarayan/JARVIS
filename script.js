const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

// 🔹 Quick element getters
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const messages = document.getElementById("messages");
const msg = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const openChatBtn = document.getElementById("openChatBtn");
const chatPanel = document.getElementById("chatPanel");
const user = document.getElementById("user");
const pass = document.getElementById("pass");


// ================= LOGIN =================
function login(){
    let u = user.value.trim();
    let p = pass.value.trim();

    if(!u || !p){
        alert("Enter username & password bro 😑");
        return;
    }

    localStorage.setItem("auth","ok");
    loginScreen.style.display = "none";
    dashboard.style.display = "block";
    speak("Welcome back sir, systems online.");
    startWake();
}

// Auto-login if already saved
window.onload = () =>{
    if(localStorage.getItem("auth")){
        loginScreen.style.display="none";
        dashboard.style.display="block";
        startWake();
    }
};


// =============== CHAT PANEL =================
openChatBtn.onclick = ()=> chatPanel.style.right="0";
function openChat(){ chatPanel.style.right="0"; }
function closeChat(){ chatPanel.style.right="-100%"; }


// ============= ADD MESSAGE ==============
function add(text,type){
    let d = document.createElement("div");
    d.className ="msg "+type;
    d.innerText = text;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
}

let jarvisVoice = null;

function loadVoices(){
    const voices = speechSynthesis.getVoices();

    // try picking deep male voices
    jarvisVoice = voices.find(v =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("daniel") ||
        v.name.toLowerCase().includes("alex") ||
        v.name.toLowerCase().includes("english united kingdom") ||
        v.name.toLowerCase().includes("en-gb")
    ) || voices.find(v =>
        v.name.toLowerCase().includes("english")
    ) || voices[0];
}

// Load voices when available
speechSynthesis.onvoiceschanged = loadVoices;

function speak(text){
    const utter = new SpeechSynthesisUtterance(text);

    utter.voice = jarvisVoice;
    utter.pitch = 0.45;      // Lower tone
    utter.rate = 0.88;       // Calm robotic
    utter.volume = 1;

    // Audio processing
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(
        new MediaStream([speechSynthesis.speak(utter)])
    );

    // Create robotic filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowshelf";
    filter.frequency.value = 350;
    filter.gain.value = 18;

    const gain = ctx.createGain();
    gain.gain.value = 1.3;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
}

// ================= SEND TO AI =================
async function send(){
    let text = msg.value.trim();
    if(!text) return;

    add(text,"user");
    msg.value="";
    speak("Processing sir.");

    try{
        let r = await fetch(backend,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({prompt:text})
        });

        let data = await r.json();
        add(data.reply,"bot");
        speak(data.reply);

        // Voice commands inside chat
        if(/open chat/i.test(text)) openChat();
        if(/close chat/i.test(text)) closeChat();

    }catch(e){
        add("Connection error bro 😭","bot");
        speak("Connection error.");
    }
}

sendBtn.onclick = send;
msg.addEventListener("keypress",e=>e.key==="Enter" && send());

// Wake word mode
let listening = false;

window.addEventListener("keydown", (e)=>{
    if(e.key==="j"){ // quick wake
        listening=true;
        speak("Listening, sir.");
    }
});

async function processVoiceCommand(text){
    if(text.includes("open chat")) openChat();
    if(text.includes("clear memory")) memory = [];
    if(text.includes("battery")) speak("You are running 100% power, sir. Like Gojo on steroids.");

    // Default AI reply
    const reply = await sendPrompt(text);
    speak(reply);
    display(reply);
}

// On boot auto greet
setTimeout(()=>{
    speak("System boot complete. Online and ready, sir.");
},1500);
