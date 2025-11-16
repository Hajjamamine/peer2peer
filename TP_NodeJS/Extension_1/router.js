// router.js
function route(handle, pathname, request, response) {
    console.log("Routing:", pathname);

    if (typeof handle[pathname] === 'function') {
        handle[pathname](request, response);
    } else {
        console.log("No handler for", pathname);
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.write("404 Not Found");
        response.end();
    }
}

exports.route = route;
