console.log("Script getUserMedia loaded !");

var video = document.querySelector("video");  // ← DOIT être défini avant l’usage

var constraints = { video: true, audio: false };

console.log("Requesting camera...");

navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        console.log("Camera OK:", stream);
        video.srcObject = stream;   // ← Maintenant 'video' est défini
    })
    .catch(error => {
        console.log("Camera ERROR:", error);
    });
