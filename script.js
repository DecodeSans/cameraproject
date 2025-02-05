let video = document.getElementById("camera");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let capturedImage = document.getElementById("capturedImage");
let switchCameraBtn = document.getElementById("switchCamera");
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

// 📸 Take Picture
captureBtn.addEventListener("click", () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

// 💾 Save Picture
saveBtn.addEventListener("click", () => {
    let link = document.createElement("a");
    link.href = capturedImage.src;
    link.download = "captured_image.png";
    link.click();
});

// 🌓 Toggle Negative Filter
toggleNegativeBtn.addEventListener("click", () => {
    isNegative = !isNegative;
    toggleNegativeBtn.classList.toggle("active");
});

// 🔎 Zoom In
zoomInBtn.addEventListener("click", () => {
    if (track) {
        let capabilities = track.getCapabilities();
        let settings = track.getSettings();
        if (capabilities.zoom) {
            let newZoom = Math.min(settings.zoom + 1, capabilities.zoom.max);
            track.applyConstraints({ advanced: [{ zoom: newZoom }] });
        }
    }
});

// 🔍 Zoom Out
zoomOutBtn.addEventListener("click", () => {
    if (track) {
        let capabilities = track.getCapabilities();
        let settings = track.getSettings();
        if (capabilities.zoom) {
            let newZoom = Math.max(settings.zoom - 1, capabilities.zoom.min);
            track.applyConstraints({ advanced: [{ zoom: newZoom }] });
        }
    }
});

// ⚡ Flashlight Toggle
toggleFlashBtn.addEventListener("click", () => {
    if (torchSupported) {
        let torchState = !track.getSettings().torch;
        track.applyConstraints({ advanced: [{ torch: torchState }] });
        toggleFlashBtn.classList.toggle("active");
    } else {
        alert("Flashlight not supported on this device!");
    }
});

// 🚀 Start Camera on Load
startCamera();
