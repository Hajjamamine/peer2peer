const http = require("http");
const url = require("url");
const router = require("./router");
const connectDB = require("./config/db");

// Connect to MongoDB
connectDB();

function start(route, handle) {
  function onRequest(request, response) {
    const pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response);
  }

  http.createServer(onRequest).listen(8888);
  console.log("Server has started on port 8888.");
}

module.exports.start = start;
