const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

if (req.url === '/upload') {
handleFileUpload(req, res);
} else {
fs.readFile(filePath, (err, content) => {
if (err) {
if (err.code === 'ENOENT') {
res.writeHead(404, { 'Content-Type': 'text/html' });
res.end('<h1>404 - File Not Found</h1>', 'utf8');
} else {
res.writeHead(500);
res.end(`Server Error: ${err.code}`);
}
} else {
res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
res.end(content, 'utf8');
}
});
}
});

function handleFileUpload(req, res) {
const uploadDir = path.join(__dirname, 'uploads');
const form = new formidable.IncomingForm();
form.uploadDir = uploadDir;
form.keepExtensions = true;
form.maxFieldsSize = 10 * 1024 * 1024; // 10MB
form.maxFileSize = 10 * 1024 * 1024; // 10MB

form.parse(req, (err, fields, files) => {
if (err) {
res.writeHead(500, { 'Content-Type': 'text/html' });
res.end(`Server Error: ${err.code}`, 'utf8');
return;
}

const file = files.file;
const filePath = path.join(uploadDir, file.name);

fs.rename(file.path, filePath, (err) => {
if (err) {
res.writeHead(500, { 'Content-Type': 'text/html' });
res.end(`Server Error: ${err.code}`, 'utf8');
return;
} else {
res.writeHead(201, { 'Content-Type': 'text/html' });
res.end('<h1>File uploaded successfully!</h1>', 'utf8');
}
});
});
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));