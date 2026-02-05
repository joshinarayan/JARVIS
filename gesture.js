const video = document.getElementById("cam");
const canvas = document.getElementById("ui");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


/* ================= CAMERA ================= */

async function startCam() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    video.srcObject = stream;

    return new Promise(r => {
        video.onloadedmetadata = r;
    });
}


/* ================= HAND AI ================= */

const hands = new Hands({
    locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
});

hands.onResults(drawHands);


/* ================= DRAW ================= */

function drawHands(results) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks) {
        status.innerText = "NO HAND";
        return;
    }

    status.innerText = "HAND DETECTED";

    for (const hand of results.multiHandLandmarks) {

        for (const p of hand) {

            const x = p.x * canvas.width;
            const y = p.y * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#00ff9c";
            ctx.fill();
        }
    }
}


/* ================= START ================= */

async function boot() {

    status.innerText = "STARTING CAMERA...";

    await startCam();

    status.innerText = "LOADING AI...";

    const cam = new Camera(video, {
        onFrame: async () => {
            await hands.send({ image: video });
        },
        width: 1280,
        height: 720
    });

    cam.start();

    status.innerText = "READY";
}

boot();
