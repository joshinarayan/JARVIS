const backendURL = "https://jarvis-backend-lllv.onrender.com/api/ask"; // replace if needed

let startX=0;
const chatPanel=document.getElementById("chat-panel");

document.body.addEventListener("touchstart",e=>startX=e.touches[0].clientX);
document.body.addEventListener("touchend",e=>{
  let x=e.changedTouches[0].clientX;
  if(x-startX>80) openChat();
  if(startX-x>80) closeChat();
});

function openChat(){chatPanel.style.right="0";}
function closeChat(){chatPanel.style.right="-100%";}

document.getElementById("send").onclick=sendMessage;
document.getElementById("message").addEventListener("keypress", e=>{
  if(e.key==="Enter") sendMessage();
});

function addMessage(text,type){
  const box=document.getElementById("chat-box");
  const div=document.createElement("div");
  div.className="message "+type;
  div.innerText=text;
  if(type==="bot"){
    const btn=document.createElement("button");
    btn.className="copy-btn";
    btn.innerText="COPY";
    btn.onclick=()=>navigator.clipboard.writeText(text);
    div.appendChild(btn);
  }
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
  return div;
}

function speak(text){
  const msg=new SpeechSynthesisUtterance(text);
  msg.rate=0.93;
  msg.pitch=0.7;
  msg.voice=speechSynthesis.getVoices().find(v=>v.name.includes("Male")||v.name.includes("David"));
  speechSynthesis.speak(msg);
}

async function sendMessage(){
  const input=document.getElementById("message");
  const text=input.value.trim();
  if(!text) return;

  addMessage(text,"user");
  input.value="";
  const botMsg=addMessage("Processing...","bot");

  try{
    const res=await fetch(backendURL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt:text})
    });
    const data=await res.json();
    botMsg.innerText="";
    for(let char of data.reply){ // typing animation
      botMsg.innerText+=char;
      await new Promise(r=>setTimeout(r,20));
    }
    speak(data.reply);
  }catch{
    botMsg.innerText="Connection failed sir.";
  }
}
