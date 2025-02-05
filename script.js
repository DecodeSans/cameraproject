let video = document.getElementById("camera");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let capturedImage = document.getElementById("capturedImage");
let switchCameraBtn = document.getElementById("switchCamera");
let mirrorEffectBtn = document.getElementById("mirrorEffect");
let captureBtn = document.getElementById("capture");
let saveBtn = document.getElementById("save");
let toggleFlashBtn = document.getElementById("toggleFlash");
let toggleNegativeBtn = document.getElementById("toggleNegative");
let zoomInBtn = document.getElementById("zoomIn");
let zoomOutBtn = document.getElementById("zoomOut");

let isFrontCamera = true;
let currentStream = null;
let track = null;
let torchSupported = false;
let isNegative = false;
let isMirrored = false;

// 📷 Start Camera
async function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    try {
        let constraints = {
            video: { facingMode: isFrontCamera ? "user" : "environment", zoom: 1.0 }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = currentStream;
        track = currentStream.getVideoTracks()[0];

        // 🔦 Check if torch is supported
        torchSupported = track.getCapabilities().torch !== undefined;
        toggleFlashBtn.style.display = torchSupported ? "inline-block" : "none";
    } catch (error) {
        console.error("Camera access failed:", error);
        alert("Camera access denied or unavailable.");
    }
}

// 🔄 Switch Camera
switchCameraBtn.addEventListener("click", () => {
    isFrontCamera = !isFrontCamera;
    startCamera();
});

// 🪞 Toggle Mirror Effect
mirrorEffectBtn.addEventListener("click", () => {
    isMirrored = !isMirrored;
    video.style.transform = isMirrored ? "scaleX(-1)" : "scaleX(1)";
    mirrorEffectBtn.classList.toggle("active");
});

// 📸 Take Picture
captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.save();
    
    if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (isNegative) {
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let pixels = imgData.data;
        for (let i = 0; i < pixels.length; i += 4) {
            pixels[i] = 255 - pixels[i];       // Red
            pixels[i + 1] = 255 - pixels[i + 1]; // Green
            pixels[i + 2] = 255 - pixels[i + 2]; // Blue
        }
        ctx.putImageData(imgData, 0, 0);
    }

    capturedImage.src = canvas.toDataURL("image/png");
    capturedImage.style.display = "block";
    video.style.display = "none";
    saveBtn.style.display = "inline-block";
});

// 🎨 Change Background
document.querySelectorAll(".bg-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.body.style.background = button.dataset.bg === "none" ? "linear-gradient(45deg, #ff7eb3, #ff758c)" : button.dataset.bg;
    });
});

// 🚀 Start Camera on Load
startCamera();

