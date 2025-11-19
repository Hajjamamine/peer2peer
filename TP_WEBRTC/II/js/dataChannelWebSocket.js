let ws;

const sendButton = document.getElementById("sendButton");
const startButton = document.getElementById("startButton");
const closeButton = document.getElementById("closeButton");
const dataSend = document.getElementById("dataChannelSend");
const dataReceive = document.getElementById("dataChannelReceive");

startButton.onclick = () => {
    ws = new WebSocket('ws://localhost:8081');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        dataSend.disabled = false;
        sendButton.disabled = false;
        closeButton.disabled = false;
    };

    ws.onmessage = event => {
    // Convertir le message en string si nécessaire
    let message;
    if(event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
            message = reader.result;
            dataReceive.value = message;
            dataSend.value = '';
        };
        reader.readAsText(event.data);
    } else {
        message = event.data.toString();
        dataReceive.value = message;
        dataSend.value = '';
    }
    console.log('Received message:', message);
};


    ws.onclose = () => {
        console.log('Disconnected from server');
        dataSend.disabled = true;
        sendButton.disabled = true;
        closeButton.disabled = true;
    };

    startButton.disabled = true;
};

sendButton.onclick = () => {
    const message = dataSend.value;
    if(ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
        console.log('Sent:', message);
    }
};

closeButton.onclick = () => {
    if(ws) ws.close();
    startButton.disabled = false;
    dataSend.value = '';
    dataReceive.value = '';
};
