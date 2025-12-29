const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

// ========== ELEMENTS ==========
const loginScreen = document.getElementById("login-screen");
const dashboard = document.getElementById("dashboard");
const messages = document.getElementById("messages");
const msg = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const openChatBtn = document.getElementById("openChatBtn");
const chatPanel = document.getElementById("chatPanel");
const user = document.getElementById("user");
const pass = document.getElementById("pass");

//================ LOGIN ==================
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
window.onload = () =>{
    if(localStorage.getItem("auth")){
        loginScreen.style.display="none";
        dashboard.style.display="block";
        initMatrix();
        speak("System boot complete. Ready for duty sir.");
    }
};


//============== UI CONTROL ============
openChatBtn.onclick=()=>chatPanel.style.right="0";
function openChat(){ chatPanel.style.right="0"; }
function closeChat(){ chatPanel.style.right="-100%"; }


//============== MESSAGE RENDER ==========
function add(text,type){
    let d=document.createElement("div");
    d.className="msg "+type;
    d.innerText=text;
    messages.appendChild(d);
    messages.scrollTop=messages.scrollHeight;
}


//============== VOICE FIXED (Real Working) ==========
let jarvisVoice=null;
function loadVoices(){
    let voices=speechSynthesis.getVoices();

    jarvisVoice = voices.find(v=>v.name.toLowerCase().includes("male")) ||
                  voices.find(v=>v.name.includes("Daniel")) ||
                  voices.find(v=>v.name.includes("Alex")) ||
                  voices.find(v=>v.lang==="en-GB") ||
                  voices.find(v=>v.lang==="en-US") ||
                  voices[0];
}
speechSynthesis.onvoiceschanged = loadVoices;

function speak(t){
    let u=new SpeechSynthesisUtterance(t);
    u.voice=jarvisVoice;
    u.pitch=0.55;
    u.rate=0.82;
    u.volume=1;

    // slight robotic feel
    u.onstart=()=>console.log("🔊 Speaking...");
    speechSynthesis.speak(u);
}


//============== SEND MESSAGE ==========
async function send(){
    let text=msg.value.trim();
    if(!text) return;

    add(text,"user");
    msg.value="";
    speak("Processing sir.");

    try{
        let r=await fetch(backend,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({prompt:text})
        });

        let data=await r.json();
        add(data.reply,"bot");
        speak(data.reply);

        if(/open chat/i.test(text)) openChat();
        if(/close chat/i.test(text)) closeChat();

    }catch{
        add("Connection down? Maybe Ultron is messing again 😭","bot");
        speak("Connection failed sir.");
    }
}

sendBtn.onclick=send;
msg.addEventListener("keypress",e=>e.key==="Enter"&&send());


//============== WAKE MODE ==============
document.addEventListener("keydown",e=>{
    if(e.key==="j"){
        speak("Listening sir.");
        recognition.start();
    }
});

const recognition=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
recognition.continuous=true;
recognition.onresult=e=>{
    let t=e.results[e.results.length-1][0].transcript.toLowerCase();
    console.log("🎤",t);

    if(t.includes("open chat")){openChat(); speak("Console open.");}
    if(t.includes("close chat")){closeChat(); speak("Console hidden.");}
    if(t.includes("jarvis")) speak("Online sir.");

    if(!t.includes("jarvis")) return;
};


//=========== MATRIX BACKGROUND ==========
function initMatrix(){
    const canvas=document.getElementById("matrix");
    const ctx=canvas.getContext("2d");
    canvas.height=window.innerHeight;
    canvas.width=window.innerWidth;

    const chars="abcdefghijklmnopqrstuvwxyz0123456789#$%&*";
    const font=12;
    const columns=canvas.width/font;
    const drops=Array(columns).fill(1);

    function draw(){
        ctx.fillStyle="rgba(0,0,0,0.05)";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle="#0aff87";
        ctx.font=font+"px monospace";

        for(let i=0;i<drops.length;i++){
            let text=chars.charAt(Math.floor(Math.random()*chars.length));
            ctx.fillText(text,i*font,drops[i]*font);

            if(drops[i]*font>canvas.height && Math.random()>0.95) drops[i]=0;
            drops[i]++;
        }
    }
    setInterval(draw,40);
}
