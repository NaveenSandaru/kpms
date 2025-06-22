import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const UPLOAD_DIR = path.join('uploads', 'files');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const filePath = path.join(UPLOAD_DIR, file.originalname);

    // Check and delete if file already exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the existing file
    }

    cb(null, file.originalname); // Keep original name, so it overwrites
  },
});

const upload = multer({ storage });

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/files/${req.file.filename}`;
    res.status(201).json({ url: fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

export default router;
