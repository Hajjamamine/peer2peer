document.getElementById('startBtn').onclick = async () => {
    const tech = document.getElementById('tech').value;
    const channel = prompt("Nom du canal:");

    const signaling = new Signaling(tech, channel);

    signaling.on('message', data => console.log("Received:", data));
    signaling.on('response', data => console.log("Response:", data));
    signaling.on('Bye', () => console.log("Bye received"));

    
};
