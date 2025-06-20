import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Storage config for general files
const storage = multer.diskStorage({
  destination: 'uploads/files/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// No file type restriction – accepts any file
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
