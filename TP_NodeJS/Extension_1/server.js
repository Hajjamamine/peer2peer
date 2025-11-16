// server.js
const http = require("http");
const url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        const pathname = url.parse(request.url).pathname;
        console.log("Request received for:", pathname);

        route(handle, pathname, request, response);
    }

    http.createServer(onRequest).listen(3000);
    console.log("Server started: http://localhost:3000");
}

exports.start = start;
