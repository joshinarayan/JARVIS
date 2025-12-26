const API = "https://jarvis-backend-lllv.onrender.com/api/ask"; // Your backend

function toggleChat(){
    document.getElementById("chatBox").classList.toggle("chat-open");
}

async function sendMessage(){
    let msg = document.getElementById("msg").value.trim();
    if(!msg) return;
    
    addMsg("YOU", msg);
    document.getElementById("msg").value="";

    let response = await askJarvis(msg);
    typeReply(response);
    speak(response);
}

async function askJarvis(prompt){
    try{
        const res = await fetch(API,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({prompt})
        });
        const data=await res.json();
        return data.reply;
    }catch{
        return "Connection unstable sir.";
    }
}

function addMsg(from,text){
    document.getElementById("messages").innerHTML += `
       <div class="message"><b>${from}:</b> ${text}</div>`;
}

function typeReply(text){
    let box = document.getElementById("messages");
    let div = document.createElement("div");
    div.className="message";
    box.append(div);

    let i=0;
    let type=setInterval(()=>{
        div.innerHTML = `<b>JARVIS:</b> ${text.slice(0,i)}`;
        i++;
        if(i>text.length) clearInterval(type);
        box.scrollTop=box.scrollHeight;
    },25);
}

function speak(text){
    let v = new SpeechSynthesisUtterance(text);
    v.pitch=0.8; 
    v.rate=0.9; 
    v.voice = speechSynthesis.getVoices().find(v=>v.name.includes("Male")) || speechSynthesis.getVoices()[0];
    speechSynthesis.speak(v);
}
