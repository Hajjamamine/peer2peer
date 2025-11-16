// server.js
const express = require("express");
const app = express();
const routes = require("./routes/index");


// Middleware pour parser des données JSON
app.use(express.json());

// Importer toutes les routes
app.use("/", routes);

// Démarrer le serveur
app.listen(8888, () => {
    console.log("Server running on http://localhost:8888");
});
