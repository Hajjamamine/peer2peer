var div = document.getElementById('scratchPad');
var socket = io.connect('http://localhost:8181');

var channel = prompt("Enter signaling channel name:");
if (channel !== "") {
    console.log('Trying to create or join channel: ', channel);
    socket.emit('create or join', channel);
}

socket.on('created', function (channel) {
    console.log('Channel ' + channel + ' has been created!');
    div.insertAdjacentHTML('beforeEnd', `<p>Channel ${channel} created. You are the initiator.</p>`);
});

socket.on('full', function (channel) {
    console.log('Channel ' + channel + ' is full!');
    div.insertAdjacentHTML('beforeEnd', `<p>Channel ${channel} is full! Cannot join.</p>`);
});

socket.on('remotePeerJoining', function (channel) {
    console.log('Request to join ' + channel);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:red">Request to join channel ${channel}</p>`);
});

socket.on('joined', function (msg) {
    console.log('Joined: ' + msg);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:blue">${msg}</p>`);
});

socket.on('broadcast: joined', function (msg) {
    console.log('Broadcast: ' + msg);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:red">${msg}</p>`);

    var myMessage = prompt('Insert message to be sent to your peer:', "");
    socket.emit('message', { channel: channel, message: myMessage });
});

socket.on('message', function (message) {
    console.log('Got message from other peer: ' + message);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:blue">Message: ${message}</p>`);

    var myResponse = prompt('Send response to other peer:', "");
    socket.emit('response', { channel: channel, message: myResponse });
});

socket.on('response', function (response) {
    console.log('Got response: ' + response);
    div.insertAdjacentHTML('beforeEnd', `<p style="color:blue">Response: ${response}</p>`);

    var chatMessage = prompt('Keep chatting. Write "Bye" to quit', "");
    if (chatMessage == "Bye") {
        div.insertAdjacentHTML('beforeEnd', `<p>Sending "Bye" to server...</p>`);
        socket.emit('Bye', channel);
        socket.disconnect();
    } else {
        socket.emit('response', { channel: channel, message: chatMessage });
    }
});

socket.on('Bye', function () {
    console.log('Got "Bye" from other peer!');
    div.insertAdjacentHTML('beforeEnd', `<p>Got "Bye" from other peer!</p>`);
    socket.emit('Ack');
    socket.disconnect();
});

socket.on('log', function (array) {
    console.log.apply(console, array);
});
