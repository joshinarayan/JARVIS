const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

/* ================= ELEMENTS ================= */
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const messages = document.getElementById("messages");
const msg = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const openChatBtn = document.getElementById("openChatBtn");
const chatPanel = document.getElementById("chatPanel");
const user = document.getElementById("user");
const pass = document.getElementById("pass");

/* ================= LOGIN ================= */
function login(){
    if(!user.value.trim() || !pass.value.trim()){
        alert("Enter username & password bro 😑");
        return;
    }
    localStorage.setItem("auth","yes");
    loginScreen.style.display="none";
    dashboard.style.display="block";
    speak("Welcome back sir. Systems online.");
    initMatrix();
}

window.onload = ()=>{
    if(localStorage.getItem("auth")){
        loginScreen.style.display="none";
        dashboard.style.display="block";
        speak("System boot complete. Ready for duty sir.");
        initMatrix();
    }
};

/* ================= UI CONTROL ================= */
openChatBtn.onclick = ()=> chatPanel.style.right="0";
function openChat(){ chatPanel.style.right="0"; }
function closeChat(){ chatPanel.style.right="-100%"; }

/* ================= MESSAGE RENDER ================= */
function add(text,type){
    let d = document.createElement("div");
    d.className = "msg "+type;
    d.innerText = text;
    messages.appendChild(d);
    messages.scrollTop = messages.scrollHeight;
}

/* ================= VOICE ENGINE =============== */
let jarvisVoice = null;

function loadVoices(){
    let voices = speechSynthesis.getVoices();

    // FORCE MALE DEEP VOICE
    jarvisVoice = voices.find(v=>/male|daniel|brian|george|alex|barry|english/i.test(v.name))
                 || voices.find(v=>v.lang=="en-US")
                 || voices.find(v=>v.lang=="en-GB")
                 || voices[0];
}
speechSynthesis.onvoiceschanged = loadVoices;

function speak(text){
    const u = new SpeechSynthesisUtterance(text);
    u.voice = jarvisVoice;
    u.pitch = 0.55;       // deeper bass
    u.rate = 0.84;        // robotic pacing
    u.volume = 1;

    // slight layer to feel metallic/robotic
    const u2 = new SpeechSynthesisUtterance(text);
    u2.pitch = 0.40;
    u2.rate = 0.70;
    u2.volume = 0.8;

    speechSynthesis.speak(u);
    setTimeout(()=> speechSynthesis.speak(u2), 90);
}

/* ================= OPEN APP / WEBSITE =============== */
const appLinks = {
    youtube:"https://youtube.com",
    whatsapp:"https://wa.me",
    instagram:"https://instagram.com",
    facebook:"https://facebook.com",
    twitter:"https://x.com",
    spotify:"spotify://",
    chrome:"googlechrome://",
    snapchat:"https://snapchat.com",
    gmail:"https://mail.google.com",
    google:"https://google.com",
    github:"https://github.com",
    netflix:"https://netflix.com",
    amazon:"https://amazon.in",
    flipkart:"https://flipkart.com",
    discord:"https://discord.com/app"
};

function openApp(name){
    name = name.toLowerCase().replace("open ","").trim();
    if(appLinks[name]){
        speak(`Opening ${name} sir`);
        window.open(appLinks[name],"_blank");
    } else {
        speak(`Not found sir, searching instead`);
        window.open("https://www.google.com/search?q="+name,"_blank");
    }
}

/* ================= SEND ================= */
async function send(){
    let text = msg.value.trim();
    if(!text) return;

    add(text,"user");
    msg.value = "";
    speak("Processing sir.");

    // Quick commands
    if(text.startsWith("open")) return openApp(text.replace("open",""));
    if(/open chat/i.test(text)) return openChat();
    if(/close chat/i.test(text)) return closeChat();

    try{
        let r = await fetch(backend,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({prompt:text})
        });
        let data = await r.json();

        add(data.reply,"bot");
        speak(data.reply);   // <-- HERE WE SPEAK REAL RESPONSE

    }catch{
        add("Connection failed 💀","bot");
        speak("Connection failed sir");
    }
}

sendBtn.onclick = send;
msg.addEventListener("keypress",e=>e.key==="Enter" && send());

/* ================= VOICE LISTENING ================= */
const recognition = new(window.SpeechRecognition||window.webkitSpeechRecognition)();
recognition.continuous = true;

document.addEventListener("keydown",e=>{
    if(e.key==="j"){
        speak("Listening sir");
        recognition.start();
    }
});

recognition.onresult = e=>{
    let t = e.results[e.results.length-1][0].transcript.toLowerCase();
    console.log("🎤",t);

    if(!t.includes("jarvis")) return;
    t = t.replace("jarvis","").trim();

    if(t.startsWith("open")) return openApp(t);
    if(t.includes("open chat")) return openChat();
    if(t.includes("close chat")) return closeChat();

    speak("Processing sir.");
    sendTextToAI(t);
};

async function sendTextToAI(text){
    add(text,"user");
    let r = await fetch(backend,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({prompt:text})
    });
    let d = await r.json();
    add(d.reply,"bot");
    speak(d.reply);
}

/* ================= MATRIX BACKGROUND ================= */
function initMatrix(){
    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const chars = "abcdefghijklmnopqrstuvwxyz0123456789#$%&*";
    const font = 12;
    const columns = canvas.width / font;
    const drops = Array(columns).fill(1);

    function draw(){
        ctx.fillStyle="rgba(0,0,0,0.05)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle="#0aff87";
        ctx.font=font+"px monospace";

        for(let i=0;i<drops.length;i++){
            let text = chars.charAt(Math.floor(Math.random()*chars.length));
            ctx.fillText(text,i*font,drops[i]*font);

            if(drops[i]*font > canvas.height && Math.random()>0.95) drops[i]=0;
            drops[i]++;
        }
    }
    setInterval(draw,40);
}
