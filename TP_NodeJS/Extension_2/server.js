// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir le fichier client
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log("Un client est connecté :", socket.id);

    socket.on("jouer", (nom) => {
        console.log("Nom reçu:", nom);

        const gain = Math.floor(Math.random() * 10000);

        // Envoie du gain au client
        socket.emit("resultat", {
            nom: nom,
            gain: gain
        });
    });

    socket.on("disconnect", () => {
        console.log("Client déconnecté");
    });
});

server.listen(3000, () => {
    console.log("Serveur Socket.io démarré sur http://localhost:3000");
});
