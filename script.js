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
        speak("System boot sequence complete. Good to see you again sir.");
        initMatrix();
    }
};

/* ================= UI ================= */
openChatBtn.onclick = ()=> chatPanel.style.right="0";
function openChat(){ chatPanel.style.right="0"; }
function closeChat(){ chatPanel.style.right="-100%"; }

/* ================= MESSAGE RENDER ================= */
function add(text,type){
    let d=document.createElement("div");
    d.className="msg "+type;
    d.innerText=text;
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
}

/* ================= VOICE ================= */
function speak(text){
    speechSynthesis.cancel(); // Reset TTS
    const voices = speechSynthesis.getVoices();
    let voice = voices.find(v=>/male|david|daniel|george|alex|english|us/i.test(v.name))
                || voices.find(v=>v.lang.includes("en"))
                || voices[0];

    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.pitch = 0.52;
    u.rate  = 0.82;
    u.volume = 1;
    speechSynthesis.speak(u);
}

/* ================= APP LINKS ================= */
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

/* ================= LOCAL COMMANDS ================= */
function localCommands(t){
    if(t.startsWith("open ")) return openApp(t.replace("open",""));
    if(t.startsWith("search")){ speak("Searching sir"); window.open(`https://www.google.com/search?q=${t.replace("search","")}`); return true;}
    if(t.includes("play music")){ speak("Launching music sir"); window.open("https://www.youtube.com/results?search_query=music+playlist"); return true;}
    if(t.includes("increase volume")){ speak("Volume increased sir"); return true;}
    if(t.includes("decrease volume")){ speak("Volume reduced sir"); return true;}
    if(t.includes("mute")){ speak("Muted sir"); return true;}
    if(t.includes("unmute")){ speak("Volume restored sir"); return true;}
    if(t.includes("flashlight on")){ toggleTorch(true); return true;}
    if(t.includes("flashlight off")){ toggleTorch(false); return true;}
    return false;
}

/* ================= FLASHLIGHT ================= */
let stream;
async function toggleTorch(on){
    try{
        if(!stream) stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
        const track=stream.getVideoTracks()[0];
        await track.applyConstraints({advanced:[{torch:on}]});
        speak(`Flashlight ${on?"activated":"disabled"} sir`);
    }catch{ speak("Torch not supported on your device sir"); }
}

/* ================= SEND MESSAGE ================= */
async function send(){
    let text=msg.value.trim();
    if(!text) return;

    add(text,"user");
    msg.value="";
    speak("Processing sir.");

    if(localCommands(text.toLowerCase())) return;

    try{
        let r=await fetch(backend,{
            method:"POST",
            headers:{ "Content-Type":"application/json"},
            body:JSON.stringify({prompt:text})
        });
        let data=await r.json();
        add(data.reply,"bot");
        speak(data.reply);

        if(data.action) runCommand(data.action,data.target);
    }
    catch{
        add("Connection failed 💀","bot");
        speak("Server not responding sir.");
    }
}

sendBtn.onclick=send;
msg.addEventListener("keypress",e=>e.key==="Enter"&&send());

/* ================= RUN COMMAND FROM BACKEND ================= */
function runCommand(action,target){
    if(action=="open" && target) openApp(target);
    else if(action=="search" && target){
        speak("Searching sir");
        window.open(`https://www.google.com/search?q=${target}`,"_blank");
    }
}

/* ================= ALWAYS-LISTENING "JARVIS" ================= */
let listening = false;
const recog=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
recog.continuous=true;
recog.interimResults=true;
recog.lang="en-US";

recog.onresult=async e=>{
    let t=e.results[e.results.length-1][0].transcript.toLowerCase().trim();
    console.log("🎤",t);

    if(t.includes("jarvis") && !listening){
        listening=true;
        speak("Yes sir?");
        return;
    }

    if(listening){
        add("🎤 "+t,"user");

        if(localCommands(t)) { listening=false; return; }

        speak("Processing sir.");
        try{
            let r=await fetch(backend,{
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body:JSON.stringify({prompt:t})
            });
            let data=await r.json();
            add(data.reply,"bot");
            speak(data.reply);

            if(data.action) runCommand(data.action,data.target);
        }catch{
            add("Voice request failed.","bot");
            speak("Connection error sir.");
        }

        listening=false;
    }
};

recog.onerror=()=>recog.start();
recog.onend=()=>recog.start();
recog.start();

/* ================= BACKGROUND MATRIX ================= */
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
            ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*font,y*font);
            drops[i]=(y*font>c.height && Math.random()>0.95)?0:y+1;
        });
    },40);
}
