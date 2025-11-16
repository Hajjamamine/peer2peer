const User = require("./models/User");
const exec = require("child_process").exec;

// Start
function start(response) {
  console.log("Request handler 'start' called.");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("Hello start");
  response.end();
}

// Upload (example: save a user)
async function upload(response) {
  console.log("Request handler 'upload' called.");
  try {
    const user = await User.create({ name: "Amine", amountWon: 1000 });
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("User uploaded: " + JSON.stringify(user));
    response.end();
  } catch (err) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.write("Error: " + err.message);
    response.end();
  }
}

// Find
function find(response) {
  console.log("Request handler 'find' called.");
  exec(
    "find /",
    { timeout: 10000, maxBuffer: 20000 * 1024 },
    function (error, stdout, stderr) {
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.write(stdout);
      response.end();
    }
  );
}

// Show all users from MongoDB
async function show(response) {
  console.log("Request handler 'show' called.");
  try {
    const users = await User.find();
    response.writeHead(200, { "Content-Type": "application/json" });
    response.write(JSON.stringify(users, null, 2));
    response.end();
  } catch (err) {
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.write("Error: " + err.message);
    response.end();
  }
}

function login(response) {
  console.log("Request handler 'login' called.");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("Hello login");
  response.end();
}

function logout(response) {
  console.log("Request handler 'logout' called.");
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write("Hello logout");
  response.end();
}

exports.start = start;
exports.upload = upload;
exports.find = find;
exports.show = show;
exports.login = login;
exports.logout = logout;
