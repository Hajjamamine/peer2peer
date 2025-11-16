// requestHandlers.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const formidable = require('formidable'); // npm install formidable

// stockage simple en mémoire des sessions (pour TP uniquement)
const sessions = {};

// dossier pour stocker fichiers uploadés
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// --- Helpers ---
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function parseQuery(request) {
  return url.parse(request.url, true).query;
}

// --- Handlers ---
function start(request, response) {
  console.log("Request handler 'start' was called.");
  // page d'accueil avec un formulaire d'upload et quelques liens
  const html = `<!doctype html>
  <html>
  <head><meta charset="utf-8"><title>Mini App</title></head>
  <body>
    <h1>Bienvenue</h1>
    <p><a href="/find?q=example">Rechercher un fichier (exemple)</a></p>
    <p><a href="/show?file=example.txt">Afficher example.txt</a></p>

    <h2>Upload de fichier</h2>
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="uploadFile" /><br/><br/>
      <input type="submit" value="Uploader" />
    </form>

    <h2>Login (TP simple)</h2>
    <form action="/login" method="post">
      <input name="username" placeholder="username" required />
      <input name="password" type="password" placeholder="password" required />
      <button type="submit">Login</button>
    </form>

    <form action="/logout" method="post">
      <button type="submit">Logout</button>
    </form>
  </body>
  </html>`;

  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.write(html);
  response.end();
}

function upload(request, response) {
  console.log("Request handler 'upload' was called.");

  if (request.method.toLowerCase() !== 'post') {
    response.writeHead(405, { 'Content-Type': 'text/plain' });
    response.end('405 Method Not Allowed - Use POST to upload');
    return;
  }

  const form = new formidable.IncomingForm({ uploadDir: UPLOAD_DIR, keepExtensions: true });

  form.parse(request, (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('500 Internal Server Error during upload');
      return;
    }

    // formidable place le fichier dans uploadDir avec un nom temporaire ; on peut renommer
    const uploaded = files.uploadFile;
    if (!uploaded) {
      response.writeHead(400, { 'Content-Type': 'text/plain' });
      response.end('No file uploaded.');
      return;
    }

    const filename = path.basename(uploaded.path);
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('File uploaded successfully as: ' + filename);
  });
}

function find(request, response) {
  console.log("Request handler 'find' was called.");
  // Recherche simple dans le dossier uploads par nom contenant la query 'q'
  const query = parseQuery(request);
  const q = (query.q || '').toLowerCase();

  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      console.error('Find error:', err);
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end('500 Internal Server Error');
      return;
    }

    const matched = files.filter(f => f.toLowerCase().includes(q));
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ query: q, results: matched }));
  });
}

function show(request, response) {
  console.log("Request handler 'show' was called.");
  // Affiche le contenu d'un fichier uploadé (paramètre file=)
  const query = parseQuery(request);
  const file = query.file;
  if (!file) {
    response.writeHead(400, { 'Content-Type': 'text/plain' });
    response.end('400 Bad Request: file parameter is required, e.g. /show?file=xxx.txt');
    return;
  }

  // Sécuriser le chemin : empêcher l'accès en dehors de UPLOAD_DIR
  const safePath = path.join(UPLOAD_DIR, path.basename(file));
  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('404: File not found');
      return;
    }

    // Diffuser le fichier (texte)
    const stream = fs.createReadStream(safePath);
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    stream.pipe(response);
  });
}

function login(request, response) {
  console.log("Request handler 'login' was called.");

  if (request.method.toLowerCase() !== 'post') {
    response.writeHead(405, { 'Content-Type': 'text/plain' });
    response.end('405 Method Not Allowed - Use POST to login');
    return;
  }

  // lire le body simple (form urlencoded)
  let body = '';
  request.on('data', chunk => (body += chunk));
  request.on('end', () => {
    const params = new URLSearchParams(body);
    const username = params.get('username') || 'anon';
    // dans un vrai projet on validerait password et on utiliserait DB
    const sessionId = generateSessionId();
    sessions[sessionId] = { username, created: Date.now() };

    // Set cookie (simple)
    response.writeHead(302, {
      'Set-Cookie': `sid=${sessionId}; HttpOnly`,
      'Location': '/'
    });
    response.end();
  });
}

function logout(request, response) {
  console.log("Request handler 'logout' was called.");

  // récupérer cookie sid (si présent) et supprimer
  const cookies = (request.headers.cookie || '').split(';').map(c => c.trim());
  let sid = null;
  for (const c of cookies) {
    if (c.startsWith('sid=')) sid = c.split('=')[1];
  }
  if (sid && sessions[sid]) delete sessions[sid];

  response.writeHead(302, {
    'Set-Cookie': 'sid=; Max-Age=0',
    'Location': '/'
  });
  response.end();
}

// exports
exports.start = start;
exports.upload = upload;
exports.find = find;
exports.show = show;
exports.login = login;
exports.logout = logout;
