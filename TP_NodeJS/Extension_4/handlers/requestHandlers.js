// handlers/requestHandlers.js
const exec = require("child_process").exec;

exports.start = (req, res) => {
    console.log("Request handler 'start' called.");
    res.status(200).send("Hello start (Express version)");
};

exports.upload = (req, res) => {
    console.log("Request handler 'upload' called.");
    res.send("Hello upload");
};

exports.show = (req, res) => {
    console.log("Request handler 'show' called.");
    res.send("Hello show");
};

exports.login = (req, res) => {
    console.log("Request handler 'login' called.");
    res.send("Hello login");
};

exports.logout = (req, res) => {
    console.log("Request handler 'logout' called.");
    res.send("Hello logout");
};

exports.find = (req, res) => {
    console.log("Request handler 'find' called.");
    exec(
        "find /",
        { timeout: 5000, maxBuffer: 20000 * 1024 },
        (error, stdout, stderr) => {
            res.send(stdout);
        }
    );
};
