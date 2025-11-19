const static = require('node-static');
const http = require('http');
const file = new static.Server();

const app = http.createServer(function(req, res) {
    file.serve(req, res);
}).listen(8181, () => console.log("HTTP Server running on port 8181"));

const io = require('socket.io')(app);

const rooms = {}; // Liste des rooms et participants

io.on('connection', socket => {

    console.log('Client connected: ' + socket.id);

    socket.on('join', (room) => {
        if(!rooms[room]) rooms[room] = new Set();
        rooms[room].add(socket.id);
        socket.join(room);

        // Informer les autres participants
        socket.to(room).emit('new-peer', socket.id);

        // Informer le nouvel arrivant des peers existants
        const otherPeers = Array.from(rooms[room]).filter(id => id !== socket.id);
        socket.emit('existing-peers', otherPeers);

        console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on('signal', (data) => {
        // Envoyer le signal à l'autre peer
        io.to(data.target).emit('signal', {
            sender: socket.id,
            signal: data.signal
        });
    });

    socket.on('disconnect', () => {
        for(let room in rooms){
            if(rooms[room].has(socket.id)){
                rooms[room].delete(socket.id);
                socket.to(room).emit('peer-left', socket.id);
            }
        }
        console.log('Client disconnected: ' + socket.id);
    });

});
