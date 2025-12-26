const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

const chat = document.getElementById("chatPanel");
document.getElementById("openChat").onclick=()=>chat.style.right="0";
document.getElementById("closeChat").onclick=()=>chat.style.right="-100%";
document.getElementById("sendBtn").onclick=send;
document.getElementById("msgInput").addEventListener("keypress",e=>{
  if(e.key==="Enter") send();
});

function addMsg(text){
  let msg=document.createElement("div");
  msg.className="msg";
  msg.innerHTML=text;
  messages.appendChild(msg);
  messages.scrollTop=messages.scrollHeight;
}

function speak(text){
  let v=new SpeechSynthesisUtterance(text);
  v.pitch=.7;v.rate=.95;v.volume=1;
  v.voice=speechSynthesis.getVoices().find(x=>x.name.includes("Male"))||speechSynthesis.getVoices()[0];
  speechSynthesis.speak(v);
}

async function send(){
  const txt=msgInput.value.trim(); 
  if(!txt) return;
  msgInput.value="";
  addMsg("<b>You:</b> "+txt);

  const loader = addMsg("<b>Jarvis:</b> Processing...");

  try{
     const res = await fetch(backend,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:txt})
     });

     const data = await res.json();
     loader.innerHTML="<b>Jarvis:</b> "+data.reply;
     speak(data.reply);

  }catch{
     loader.innerHTML="<b>Jarvis:</b> System offline sir.";
  }
}
