const backendURL = "https://jarvis-backend-lllv.onrender.com/api/ask"; // replace with real URL

let startX = 0;

// slide open chat
document.body.addEventListener("touchstart", e=> startX=e.touches[0].clientX);
document.body.addEventListener("touchend", e=>{
    let endX = e.changedTouches[0].clientX;
    if(endX - startX > 80) openChat();
    if(startX - endX > 80) closeChat();
});

function openChat(){ document.getElementById("chat-panel").style.right="0"; }
function closeChat(){ document.getElementById("chat-panel").style.right="-100%"; }

document.getElementById("send").onclick = sendMessage;

async function sendMessage(){
    let message = document.getElementById("message").value.trim();
    if(!message) return;

    addMessage(message,"user");
    document.getElementById("message").value="";

    let response = await fetch(backendURL,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ prompt:message })
    });

    let data = await response.json();
    let text = data.response.replace(/([.?!])/g,"$1\n"); // spacing fix
    addMessage(text,"bot");

    speak(text); // Jarvis Voice
}

function addMessage(msg,type){
    let box=document.getElementById("chat-box");
    let div=document.createElement("div");
    div.className=`message ${type}`;
    div.innerText=msg;
    box.appendChild(div);
    box.scrollTop=box.scrollHeight;
}

// Male Jarvis voice
function speak(text){
   let v = new SpeechSynthesisUtterance(text);
   v.pitch = 0.7;
   v.rate = 0.93;
   v.voice = speechSynthesis.getVoices().find(e=>e.name.includes("Male") || e.name.includes("David"));
   speechSynthesis.speak(v);
      }
