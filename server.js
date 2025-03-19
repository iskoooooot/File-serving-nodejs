const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const multer = require('multer');

const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, './uploads/');
},
filename: (req, file, cb) => {
cb(null, file.originalname);
}
});

const upload = multer({
storage: storage,
limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
fileFilter(req, file, cb) {
if (!file.originalname.match(/\.(txt|jpg|jpeg|png|gif)$/)) {
return cb(new Error('Only text and image files are allowed!'));
}
cb(null, true);
}
});

const server = http.createServer((req, res) => {
let filePath = path.join(__dirname, req.url === '/' ? 'public/index.html' : req.url);

if (req.url.startsWith('/uploads/')) {
filePath = path.join(__dirname, req.url);
}

if (req.url === '/upload') {
upload(req, res, (err) => {
if (err) {
res.writeHead(500, { 'Content-Type': 'text/html' });
res.end(`Server Error: ${err.code}`, 'utf8');
return;
}

res.writeHead(201, { 'Content-Type': 'text/html' });
res.end('<h1>File uploaded successfully!</h1>', 'utf8');
});
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));