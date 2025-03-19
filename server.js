const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const app = express();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create /uploads directory if not exists
const uploadDir = './uploads/';
fs.mkdirSync(uploadDir, { recursive: true });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

// Multer File Upload Configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter(req, file, cb) {
    // Validate file extensions
    if (!file.originalname.match(/\.(txt|jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only text and image files are allowed!'));
    }
    cb(null, true);
  }
});

// HTML Form for Upload at root route `/`
app.get('/', (req, res) => {
  res.send(`
    <h1>File Upload Service</h1>
    <form action="/upload" method="POST" enctype="multipart/form-data">
      <input type="file" name="file" />
      <button type="submit">Upload</button>
    </form>
  `);
});

// Route to Handle File Upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('<h1>No file uploaded!</h1>');
  }
  res.send(`<h1>File uploaded successfully! <a href="/uploads/${req.file.filename}">View File</a></h1>`);
});

// Serve Uploaded Files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('<h1>404 - File Not Found</h1>');
    }
    res.sendFile(filePath);
  });
});

// Handle Invalid File Format with Middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send(`<h1>File upload error: ${err.message}</h1>`);
  } else if (err.message === 'Only text and image files are allowed!') {
    return res.status(400).send('<h1>Error: Only text and image files are allowed!</h1>');
  }
  res.status(500).send('<h1>Internal Server Error</h1>');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
