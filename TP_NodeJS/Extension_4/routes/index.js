// routes/index.js
const express = require("express");
const router = express.Router();
const handlers = require("../handlers/requestHandlers");

// Définition des routes
router.get("/", handlers.start);
router.get("/start", handlers.start);
router.get("/upload", handlers.upload);
router.get("/find", handlers.find);
router.get("/show", handlers.show);
router.get("/login", handlers.login);
router.get("/logout", handlers.logout);

module.exports = router;
