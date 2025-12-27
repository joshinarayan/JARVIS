const backend = "https://jarvis-backend-lllv.onrender.com/api/ask";

/* OPEN CHAT */
document.getElementById("openChat").onclick=()=>{
 document.getElementById("chatPanel").style.right="0";
}

/* message handling */
function add(text,type){
 let box=document.getElementById("messages");
 let div=document.createElement("div");
 div.className="msg "+type;
 div.innerText=text;
 box.append(div);
 box.scrollTop=box.scrollHeight;
}

/* JARVIS DEEP VOICE */
function speak(txt){
 let v=new SpeechSynthesisUtterance(txt);
 v.pitch=0.6;
 v.rate=0.85;
 v.volume=1;
 speechSynthesis.speak(v);
}

/* SENDER */
async function send(){
 let msg=document.getElementById("msg").value.trim();
 if(!msg) return;
 add(msg,"user");
 document.getElementById("msg").value="";

 let temp=add("Processing sir...","bot");

 let r=await fetch(backend,{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({prompt:msg})
 });

 let data=await r.json();
 temp.innerText=data.reply;
 speak(data.reply);
}

/* ENTER */
document.getElementById("send").onclick=send;
document.getElementById("msg").addEventListener("keypress",e=>{if(e.key=="Enter")send();});

/* WAKE WORD "JARVIS" */
window.addEventListener("click",()=>{
 let rec=new(window.SpeechRecognition||window.webkitSpeechRecognition)();
 rec.continuous=true;
 rec.onresult=e=>{
   let t=e.results[e.resultIndex][0].transcript.toLowerCase();
   if(t.includes("jarvis")){
     speak("Online sir.");
   }
 };
 rec.start();
});
