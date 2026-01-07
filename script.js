/* ================= BACKEND ================= */
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
        alert("Enter username & password 😑");
        return;
    }
    localStorage.setItem("auth","yes");
    loginScreen.style.display="none";
    dashboard.style.display="block";
    speak("Welcome back sir. Systems online.");
    initMatrix();
    initCamera();
}

window.onload = ()=>{
    if(localStorage.getItem("auth")){
        loginScreen.style.display="none";
        dashboard.style.display="block";
        speak("System online. Awaiting commands sir.");
        initMatrix();
        initCamera();
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
function speak(text,lang="en-US"){
    if(!text) return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    const voices=speechSynthesis.getVoices();
    u.voice = voices.find(v=>/david|daniel|alex|male|english/i.test(v.name)) || voices[0];
    u.rate=0.85;
    u.pitch=0.5;
    u.volume=1;
    u.lang = lang;
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

recog.onerror = ()=>setTimeout(()=>recog.start(),800);
recog.onend = ()=>setTimeout(()=>recog.start(),500);
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
            ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*font,y*font);
            drops[i]=(y*font>c.height&&Math.random()>0.95)?0:y+1;
        });
    },35);
}

/* ================= CAMERA & AI HUD ================= */
let video, canvas, ctx2, modelHand, modelObject;
async function initCamera(){
    video = document.createElement("video");
    video.width=640; video.height=480;
    video.style.position="absolute";
    video.style.top="10px";
    video.style.left="10px";
    video.style.zIndex="10";
    dashboard.appendChild(video);

    canvas = document.createElement("canvas");
    canvas.width = video.width;
    canvas.height = video.height;
    canvas.style.position="absolute";
    canvas.style.top="10px";
    canvas.style.left="10px";
    canvas.style.zIndex="20";
    dashboard.appendChild(canvas);
    ctx2 = canvas.getContext("2d");

    // Start webcam
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Load TensorFlow.js models
    modelHand = await handPoseModel(); // MediaPipe Hands
    modelObject = await cocoSsd.load(); // COCO-SSD
    detectLoop();
}

// Load MediaPipe Hands
async function handPoseModel(){
    return await handpose.load();
}

// Detection loop
async function detectLoop(){
    if(video.readyState >= 2){
        ctx2.drawImage(video,0,0,canvas.width,canvas.height);

        // HANDS
        const hands = await modelHand.estimateHands(video);
        hands.forEach(hand=>{
            const landmarks = hand.landmarks;
            ctx2.strokeStyle="lime";
            ctx2.lineWidth=2;
            for(let i=0;i<landmarks.length;i++){
                ctx2.beginPath();
                ctx2.arc(landmarks[i][0],landmarks[i][1],5,0,2*Math.PI);
                ctx2.stroke();
            }
            ctx2.fillStyle="lime";
            ctx2.font="16px monospace";
            ctx2.fillText(`Fingers: ${hand.annotations.thumb.length + hand.annotations.indexFinger.length + hand.annotations.middleFinger.length + hand.annotations.ringFinger.length + hand.annotations.pinky.length}`, landmarks[0][0], landmarks[0][1]-10);
        });

        // OBJECTS
        const predictions = await modelObject.detect(video);
        predictions.forEach(p=>{
            ctx2.strokeStyle="red";
            ctx2.lineWidth=2;
            ctx2.strokeRect(p.bbox[0],p.bbox[1],p.bbox[2],p.bbox[3]);
            ctx2.fillStyle="red";
            ctx2.fillText(p.class, p.bbox[0], p.bbox[1]-5);
        });
    }
    requestAnimationFrame(detectLoop);
}
