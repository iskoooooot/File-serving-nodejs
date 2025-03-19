const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const app = express();

// Set static folder to serve index.html and other files
app.use(express.static(path.join(__dirname, 'public')));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    fs.mkdir(uploadDir, { recursive: true }, (err) => {
      if (err) {
        console.error(err);
      }
      cb(null, uploadDir);
    });
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
    if (!file.originalname.match(/\.(txt|jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only text and image files are allowed!'));
    }
    cb(null, true);
  }
});

// Route to Handle File Upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('<h1>No file uploaded!</h1>');
  }
  res.send('<h1>File uploaded successfully!</h1>');
});

// Serve Uploaded Files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('<h1>404 - File Not Found</h1>');
    } else {
      res.sendFile(filePath);
    }
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
