// backend URL - already yours
const backendURL = "https://jarvis-backend-lllv.onrender.com/api/ask";

// open chat drawer
document.getElementById("chat-btn").onclick = () => {
    document.getElementById("chat-panel").style.right = "0";
};

// send on button or Enter
document.getElementById("send").onclick = sendMsg;
document.getElementById("msg").addEventListener("keypress", e=>{
    if(e.key === "Enter") sendMsg();
});

async function sendMsg(){
    let msg = document.getElementById("msg").value.trim();
    if(!msg) return;

    add("You", msg);
    document.getElementById("msg").value = "";

    try {
        let response = await fetch(backendURL,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ message: msg })
        });

        let data = await response.json();
        let reply = data.reply || "No response sir.";

        add("Jarvis", reply);
        speak(reply);

    } catch(e){
        add("Jarvis", "Connection failed sir.");
        speak("Connection failed sir.");
    }
}

/* Add chat message */
function add(who,text){
    document.getElementById("messages").innerHTML += `<p><b>${who}:</b> ${text}</p>`;
}

/* Male AI Voice */
function speak(text){
    let j = new SpeechSynthesisUtterance(text);
    let voices = speechSynthesis.getVoices();

    j.voice = voices.find(v => 
        v.name.includes("Male") || 
        v.name.includes("Jarvis") || 
        v.name.includes("Matthew") || 
        v.name.includes("English") ) || voices[0];

    j.pitch = 0.7;
    j.rate = 0.9;
    j.volume = 1;

    speechSynthesis.speak(j);
}

/* Wake word: "Hey Jarvis" */
window.addEventListener("click",()=>{
    const rec = new(window.SpeechRecognition||window.webkitSpeechRecognition)();
    rec.continuous = true;
    rec.onresult = e=>{
        let t = e.results[e.resultIndex][0].transcript.toLowerCase();
        if(t.includes("hey jarvis")) speak("At your service sir.");
    };
    rec.start();
});
