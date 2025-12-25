const backendURL = "https://jarvis-backend-lllv.onrender.com/api/ask";

const chat = document.getElementById("chatPanel");
document.getElementById("openChat").onclick = ()=> chat.style.right="0";

document.getElementById("send").onclick = sendMsg;
document.getElementById("msg").addEventListener("keypress", e=>{
    if(e.key==="Enter") sendMsg();
});

async function sendMsg(){
    let msg = document.getElementById("msg").value.trim();
    if(!msg) return;

    add("You", msg);
    document.getElementById("msg").value="";

    try{
        let response = await fetch(backendURL,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({message:msg})
        });

        let data = await response.json();
        add("Jarvis", data.reply);
        speak(data.reply);
    }catch(err){
        add("Jarvis","Backend error sir 😭");
    }
}

/* add chat text */
function add(who,text){
    const msgDiv = document.getElementById("messages");
    msgDiv.innerHTML += `<p><b>${who}:</b> ${text}</p>`;
    msgDiv.scrollTop = msgDiv.scrollHeight;
}

/* voice output */
function speak(text){
    let j = new SpeechSynthesisUtterance(text);
    let voices = speechSynthesis.getVoices();
    j.voice = voices.find(v=>v.name.includes("Male")||v.name.includes("John")||v.lang.includes("en")) || voices[0];
    j.pitch=0.8; j.rate=1; j.volume=1;
    speechSynthesis.speak(j);
}

/* Wake word Detection */
window.addEventListener("click",()=>{ // permission after first click
    const rec = new(window.SpeechRecognition||window.webkitSpeechRecognition)();
    rec.continuous=true;
    rec.onresult = e=>{
        let t = e.results[e.resultIndex][0].transcript.toLowerCase();
        if(t.includes("hey jarvis")){
            speak("At your service sir.");
        }
    };
    rec.start();
});
