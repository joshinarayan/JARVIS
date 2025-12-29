const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

/* Elements */
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
        speak("System boot sequence complete. Good morning sir.");
        initMatrix();
    }
};

/* UI */
openChatBtn.onclick = ()=> chatPanel.style.right="0";
function openChat(){ chatPanel.style.right="0"; }
function closeChat(){ chatPanel.style.right="-100%"; }

/* Chat rendering */
function add(text,type){
    let d=document.createElement("div");
    d.className="msg "+type;
    d.innerText=text;
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
}

function speak(text){
    speechSynthesis.cancel(); // full reset, no double speak ever

    const voices = speechSynthesis.getVoices();

    // Force deep male robotic tone
    let voice = voices.find(v=>/male|david|daniel|george|alex|english|us/i.test(v.name))
               || voices.find(v=>v.lang.includes("en"))
               || voices[0];

    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.pitch = 0.52;   // deep bassy tone
    u.rate  = 0.82;
    u.volume = 1;

    speechSynthesis.speak(u);
}
/* ================= Universal OPEN commands ================= */
const apps={
    youtube:"https://youtube.com",
    whatsapp:"https://wa.me",
    instagram:"https://instagram.com",
    facebook:"https://facebook.com",
    spotify:"spotify://",
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
    name=name.toLowerCase().replace("open ","").trim();
    if(apps[name]){
        speak(`Opening ${name} sir`);
        window.open(apps[name],"_blank");
    }else{
        speak(`Not registered. Searching instead sir.`);
        window.open(`https://www.google.com/search?q=${name}`,"_blank");
    }
}

/* ================= Smart System Commands ================= */

function localCommands(t){
    if(t.startsWith("open ")) return openApp(t.replace("open",""));
    if(t.startsWith("search")){ 
        speak("Searching sir"); 
        window.open(`https://www.google.com/search?q=${t.replace("search","")}`); 
        return true;
    }
    if(t.includes("play music")){
        speak("Launching music sir");
        window.open("https://www.youtube.com/results?search_query=music+playlist");
        return true;
    }
    if(t.includes("increase volume")){ speak("Volume up sir"); return true; }
    if(t.includes("decrease volume")){ speak("Volume reduced sir"); return true; }
    if(t.includes("mute")){ speak("Audio muted sir"); return true;}
    if(t.includes("unmute")){ speak("Audio restored sir"); return true;}

    // Flashlight works only on supported browsers
    if(t.includes("flashlight on")){ toggleTorch(true); return true;}
    if(t.includes("flashlight off")){ toggleTorch(false); return true;}

    return false; // means send to AI
}

/* Flashlight (mobile only) */
let stream;
async function toggleTorch(on){
    try{
        if(!stream) stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
        const track=stream.getVideoTracks()[0];
        await track.applyConstraints({advanced:[{torch:on}]});
        speak(`Flashlight ${on?"activated":"disabled"} sir`);
    }catch{ speak("Torch not supported on this device sir"); }
}

/* ================= SEND TO BACKEND ================= */
async function send(){
    let text=msg.value.trim();
    if(!text) return;

    add(text,"user");
    msg.value="";
    speak("Processing sir.");

    if(localCommands(text.toLowerCase())) return;  // no AI call if handled

    try{
        let r=await fetch(backend,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({prompt:text})
        });
        let data=await r.json();

        add(data.reply,"bot");
        speak(data.reply);

    }catch{
        add("Connection failed 💀","bot");
        speak("Server is unresponsive sir");
    }
}

sendBtn.onclick=send;
msg.addEventListener("keypress",e=>e.key==="Enter"&&send());

/* ================= Voice Mode (Hold J) ================= */
const recognition=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
recognition.continuous=true;

document.addEventListener("keydown",e=>{
    if(e.key==="j"){
        speak("Listening sir");
        recognition.start();
    }
});

recognition.onresult=e=>{
    let t=e.results[e.results.length-1][0].transcript.toLowerCase();
    console.log("🎤",t);

    t=t.replace("jarvis","").trim();
    if(!t) return;

    if(localCommands(t)) return;

    speak("Processing sir");
    sendTextToAI(t);
};

async function sendTextToAI(text){
    add(text,"user");
    let r=await fetch(backend,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({prompt:text})
    });
    let d=await r.json();
    add(d.reply,"bot");
    speak(d.reply);
}

/* Background matrix */
function initMatrix(){
    const c=document.getElementById("matrix");
    const ctx=c.getContext("2d");
    c.height=innerHeight; c.width=innerWidth;
    const chars="abcdefghijklmnopqrstuvwxyz0123456789#$%&*";
    const font=12; const cols=c.width/font; const drops=Array(cols).fill(1);
    setInterval(()=>{
        ctx.fillStyle="rgba(0,0,0,0.05)";
        ctx.fillRect(0,0,c.width,c.height);
        ctx.fillStyle="#00ff9d"; ctx.font=font+"px monospace";
        drops.forEach((y,i)=>{
            ctx.fillText(chars[Math.random()*chars.length|0],i*font,y*font);
            drops[i]=(y*font>c.height&&Math.random()>0.95)?0:y+1;
        });
    },40);
}
