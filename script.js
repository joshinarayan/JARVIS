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
        speak("System online. Awaiting commands sir.");
        initMatrix();
    }
};

/* ================= UI ================= */
openChatBtn.onclick = ()=> chatPanel.style.right="0";
function closeChat(){ chatPanel.style.right="-100%"; }

/* ================= CHAT ================= */
function add(text,type){
    const d=document.createElement("div");
    d.className="msg "+type;
    d.innerText=text;
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
}

/* ================= TTS ================= */
function speak(text){
    if(!text) return;
    speechSynthesis.cancel();

    const u=new SpeechSynthesisUtterance(text);
    const voices=speechSynthesis.getVoices();
    u.voice =
        voices.find(v=>/david|daniel|alex|male|english/i.test(v.name)) ||
        voices.find(v=>v.lang.startsWith("en")) ||
        voices[0];

    u.rate=0.85;
    u.pitch=0.5;
    u.volume=1;

    speechSynthesis.speak(u);
}

/* ================= APPS ================= */
const apps={
    youtube:"https://youtube.com",
    whatsapp:"https://wa.me",
    instagram:"https://instagram.com",
    google:"https://google.com",
    github:"https://github.com",
    netflix:"https://netflix.com",
    amazon:"https://amazon.in",
    discord:"https://discord.com/app"
};

function openApp(name){
    name=name.replace("open","").trim();
    if(apps[name]){
        speak(`Opening ${name}`);
        window.open(apps[name],"_blank");
        return true;
    }
    return false;
}

/* ================= LOCAL COMMANDS ================= */
function localCommands(t){
    if(t.startsWith("open ")) return openApp(t);
    if(t.startsWith("search")){
        window.open(`https://www.google.com/search?q=${t.replace("search","")}`);
        speak("Searching");
        return true;
    }
    if(t.includes("play music")){
        window.open("https://youtube.com/results?search_query=music");
        speak("Playing music");
        return true;
    }
    return false;
}

/* ================= SEND ================= */
async function send(textInput=null){
    const text=textInput || msg.value.trim();
    if(!text) return;

    add(text,"user");
    if(!textInput) msg.value="";

    if(localCommands(text.toLowerCase())) return;

    speak("Processing");

    try{
        const r=await fetch(backend,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({prompt:text})
        });

        const data=await r.json();
        add(data.reply,"bot");
        speak(data.reply);
        if(data.action) runCommand(data.action,data.target);

    }catch{
        add("Connection failed","bot");
        speak("Server not responding");
    }
}

sendBtn.onclick=()=>send();
msg.addEventListener("keydown",e=>e.key==="Enter"&&send());

/* ================= ACTIONS ================= */
function runCommand(action,target){
    if(action==="open" && target) window.open(target,"_blank");
    if(action==="search" && target)
        window.open(`https://www.google.com/search?q=${target}`);
}

/* ================= VOICE AI ================= */
const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const recog = new SpeechAPI();

recog.lang="en-US";
recog.continuous=true;
recog.interimResults=false;

let wakeMode=false;
let wakeTimer=null;

function resetWake(){
    wakeMode=false;
    clearTimeout(wakeTimer);
}

recog.onresult = e=>{
    const t=e.results[e.results.length-1][0].transcript.toLowerCase().trim();
    console.log("🎤",t);

    if(!wakeMode && /\bjarvis\b/.test(t)){
        wakeMode=true;
        speak("Yes?");
        wakeTimer=setTimeout(()=>{
            speak("Listening timed out");
            resetWake();
        },6000);
        return;
    }

    if(wakeMode){
        resetWake();
        add("🎤 "+t,"user");
        send(t);
    }
};

recog.onerror=()=>setTimeout(()=>recog.start(),800);
recog.onend=()=>setTimeout(()=>recog.start(),500);
recog.start();

/* ================= MATRIX ================= */
function initMatrix(){
    const c=document.getElementById("matrix");
    const ctx=c.getContext("2d");
    c.width=innerWidth; c.height=innerHeight;
    const chars="01ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const font=14;
    const cols=c.width/font;
    const drops=Array(cols).fill(1);

    setInterval(()=>{
        ctx.fillStyle="rgba(0,0,0,0.05)";
        ctx.fillRect(0,0,c.width,c.height);
        ctx.fillStyle="#00ff9d";
        ctx.font=font+"px monospace";
        drops.forEach((y,i)=>{
            ctx.fillText(chars[Math.random()*chars.length|0],i*font,y*font);
            drops[i]=(y*font>c.height&&Math.random()>0.95)?0:y+1;
        });
    },35);
}
