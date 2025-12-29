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


function speak(text){
    const utter = new SpeechSynthesisUtterance(text);

    // Voice selection
    const voices = speechSynthesis.getVoices();
    utter.voice = voices.find(v =>
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("english") ||
        v.name.toLowerCase().includes("alex")
    ) || voices[0];

    // Robotic tone adjustments
    utter.pitch = 0.45;   // lower tone
    utter.rate = 0.85;      // natural speed
    utter.volume = 1;    // max volume

    // Add slight robotic artifacts
    utter.onstart = () => {
        // Could later add background hum fx
    };

    speechSynthesis.speak(utter);
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
