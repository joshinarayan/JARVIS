const video = document.getElementById("cam");
const hud = document.getElementById("hud");


/* CAMERA */

navigator.mediaDevices.getUserMedia({
    video:true
})
.then(stream=>{
    video.srcObject = stream;
})
.catch(err=>{
    alert("Camera Error: "+err);
});


/* HAND TRACKING */

const hands = new Hands({
    locateFile: file =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});


hands.onResults(results=>{

    if(results.multiHandLandmarks.length > 0){

        hud.innerHTML = "✋ Hand Detected<br>Builder Ready";

    }else{

        hud.innerHTML = "Waiting for hands...";
    }

});


/* CAMERA PIPE */

const camera = new Camera(video,{
    onFrame: async ()=>{
        await hands.send({image:video});
    },
    width:640,
    height:480
});

camera.start();
