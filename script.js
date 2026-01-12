const backend="https://jarvis-backend-lllv.onrender.com/api/ask";

const loginScreen=document.getElementById("login-screen");
const dashboard=document.getElementById("dashboard");
const statusText=document.getElementById("status");

let faceDetected=false;
let listening=false;

/* LOGIN */
async function login(){
    const u=user.value, p=pass.value;
    const r=await fetch("https://jarvis-backend-lllv.onrender.com/api/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({username:u,password:p})
    });
    if(!r.ok){ alert("Access denied"); return; }
    localStorage.setItem("auth","yes");
    startSystem();
}

function startSystem(){
    loginScreen.style.display="none";
    dashboard.style.display="block";
    initMatrix();
    initCamera();
    startVoice();
    speak("System online. Awaiting face verification.");
}

window.onload=()=>{
    if(localStorage.getItem("auth")==="yes") startSystem();
};

/* VOICE */
function speak(t){
    const u=new SpeechSynthesisUtterance(t);
    u.lang=/kya|kaun|hai/i.test(t)?"hi-IN":"en-IN";
    u.rate=.85; u.pitch=.6;
    speechSynthesis.speak(u);
}

const SpeechAPI=window.SpeechRecognition||window.webkitSpeechRecognition;
const recog=new SpeechAPI();
recog.continuous=true;
recog.lang="en-IN";

recog.onresult=e=>{
    const t=e.results[e.results.length-1][0].transcript.toLowerCase();
    if(!faceDetected) return;
    if(t.includes("jarvis")){
        speak("Yes sir");
        listening=true;
        return;
    }
    if(listening){
        listening=false;
        send(t);
    }
};

function startVoice(){ recog.start(); }

/* CHAT */
async function send(t){
    const r=await fetch(backend,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:t})
    });
    const d=await r.json();
    speak(d.reply);
}

/* MATRIX */
function initMatrix(){
    const c=document.getElementById("matrix");
    const ctx=c.getContext("2d");
    c.width=innerWidth; c.height=innerHeight;
    const chars="01JARVIS";
    const drops=Array(c.width/14).fill(1);
    setInterval(()=>{
        ctx.fillStyle="rgba(0,0,0,.05)";
        ctx.fillRect(0,0,c.width,c.height);
        ctx.fillStyle="#00ff9c";
        ctx.font="14px monospace";
        drops.forEach((y,i)=>{
            ctx.fillText(chars[Math.random()*chars.length|0],i*14,y*14);
            drops[i]=y*14>c.height?0:y+1;
        });
    },35);
}

/* CAMERA + AI */
let video,canvas,ctx,handModel,faceModel,objModel;

async function initCamera(){
    video=document.createElement("video");
    canvas=document.createElement("canvas");
    ctx=canvas.getContext("2d");

    video.autoplay=true;
    const s=await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject=s;

    dashboard.append(video,canvas);

    faceModel=await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
    handModel=await handpose.load();
    objModel=await cocoSsd.load();

    detect();
}

async function detect(){
    ctx.drawImage(video,0,0,canvas.width,canvas.height);

    const faces=await faceModel.estimateFaces({input:video});
    faceDetected=faces.length>0;
    statusText.textContent=faceDetected?"FACE LOCK: ✅":"FACE LOCK: ❌";

    const hands=await handModel.estimateHands(video);
    if(hands.length){
        const fingers=hands[0].annotations.indexFinger.length;
        if(fingers===2) speak("Two fingers detected");
    }

    requestAnimationFrame(detect);
}
