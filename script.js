const backend="https://jarvis-backend-lllv.onrender.com/api/ask";

/* LOGIN */
function login(){
 let u=user.value.trim(),p=pass.value.trim();
 if(u&&p){
  localStorage.setItem("auth","ok");
  login-screen.style.display="none";
  dashboard.style.display="block";
  speak("Welcome back sir. Systems nominal.");
  startWake();
 }
}

/* AUTO LOGIN */
window.onload=()=>{
 if(localStorage.getItem("auth")){
   login-screen.style.display="none";
   dashboard.style.display="block";
   startWake();
 }
}

/* CHAT */
openChatBtn.onclick=()=>chatPanel.style.right="0";
function openChat(){chatPanel.style.right="0";}
function closeChat(){chatPanel.style.right="-100%";}

/* ADD MESSAGE */
function add(text,type){
 let d=document.createElement("div");
 d.className="msg "+type;
 d.innerText=text;
 messages.append(d);
 messages.scrollTop=messages.scrollHeight;
}

/* SPEAK */
function speak(t){
 let v=new SpeechSynthesisUtterance(t);
 v.pitch=.8;v.rate=.9;v.volume=1;
 speechSynthesis.speak(v);
}

/* SEND */
async function send(){
 let txt=msg.value.trim();if(!txt)return;
 add(txt,"user");msg.value="";
 speak("Processing sir");

 let r=await fetch(backend,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:txt})});
 let data=await r.json();

 add(data.reply,"bot");
 speak(data.reply);

 if(/open chat|show chat/i.test(txt)) openChat();
}
send.onclick=send;
msg.addEventListener("keypress",e=>e.key=="Enter"&&send());

/* WAKE WORD + COMMANDS */
function startWake(){
 let R=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
 R.continuous=true;R.interimResults=false;

 R.onresult=e=>{
  let t=e.results[e.resultIndex][0].transcript.toLowerCase();
  console.log("Heard:",t);

  if(t.includes("jarvis")){
    speak("Online sir");
  }
  if(t.includes("open chat")) openChat();
  if(t.includes("close chat")) closeChat();
  if(t.includes("send") && msg.value.trim()) send();
 };
 R.start();
}
