// index.js
const server = require("./server");
const router = require("./router");
const requestHandlers = require("./requestHandlers");

let handle = {};
handle["/"] = requestHandlers.home;
handle["/home"] = requestHandlers.home;
handle["/loterie"] = requestHandlers.loterie;

server.start(router.route, handle);
