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


// ================= VOICE OUTPUT =================
function speak(txt){
    let v = new SpeechSynthesisUtterance(txt);
    v.pitch = .8;
    v.rate = .9;
    v.volume = 1;
    speechSynthesis.speak(v);
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


// =============== WAKE WORD / VOICE ===============
function startWake(){
    let R = new(window.SpeechRecognition||window.webkitSpeechRecognition)();
    R.continuous=true;

    R.onresult = e=>{
        let t = e.results[e.resultIndex][0].transcript.toLowerCase();
        console.log("Heard:",t);

        if(t.includes("jarvis")) speak("Online sir.");
        if(t.includes("open chat")) openChat();
        if(t.includes("close chat")) closeChat();
        if(t.includes("send") && msg.value.trim()) send();
    };
    R.start();
}
