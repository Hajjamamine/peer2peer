// server.js
var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

// Créer le serveur HTTP pour servir les fichiers statiques
var app = http.createServer(function (req, res) {
    file.serve(req, res);
}).listen(8181, () => console.log('HTTP Server running on port 8181'));

// Importer Socket.io et lier au serveur HTTP
var io = require('socket.io')(app);

// Gestion des connexions Socket.io
io.sockets.on('connection', function (socket) {

    // Fonction utilitaire pour logger côté client
    function log() {
        var array = [">>> "];
        for (var i = 0; i < arguments.length; i++) {
            array.push(arguments[i]);
        }
        socket.emit('log', array);
    }

    // Création ou jointure d’un canal
    socket.on('create or join', function (channel) {
        var clients = io.sockets.adapter.rooms.get(channel);
        var numClients = clients ? clients.size : 0;

        console.log('numClients = ' + numClients);

        if (numClients == 0) {
            socket.join(channel);
            socket.emit('created', channel);
        } else if (numClients == 1) {
            io.to(channel).emit('remotePeerJoining', channel);
            socket.join(channel);
            socket.broadcast.to(channel).emit('broadcast: joined', `Client ${socket.id} joined channel ${channel}`);
        } else {
            console.log("Channel full!");
            socket.emit('full', channel);
        }
    });

    // Réception d’un message et diffusion aux autres clients du canal
    socket.on('message', function (message) {
        log('S --> Got message: ', message);
        socket.broadcast.to(message.channel).emit('message', message.message);
    });

    // Réception d’une réponse et diffusion
    socket.on('response', function (response) {
        log('S --> Got response: ', response);
        socket.broadcast.to(response.channel).emit('response', response.message);
    });

    // Gestion du Bye
    socket.on('Bye', function (channel) {
        socket.broadcast.to(channel).emit('Bye');
        socket.disconnect();
    });

    socket.on('Ack', function () {
        console.log('Got an Ack!');
        socket.disconnect();
    });
});
