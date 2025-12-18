import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

console.log('📤 Upload routes module loaded');

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to frontend/public/Images directory
        const uploadPath = path.join(__dirname, '../../frontend/public/Images');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Keep original filename
        cb(null, file.originalname);
    }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// Upload single image
router.post('/image', upload.single('image'), (req, res) => {
    console.log('📸 Single image upload endpoint hit');
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the path that will be stored in the database
        const imagePath = `/Images/${req.file.filename}`;
        res.status(200).json({
            message: 'File uploaded successfully',
            path: imagePath
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

console.log('✅ Upload route /image registered');

// Upload multiple images (for category - image and banner)
router.post('/images', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), (req, res) => {
    console.log('🖼️ Multiple images upload endpoint hit');
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const paths = {};

        if (req.files.image) {
            paths.image = `/Images/${req.files.image[0].filename}`;
        }

        if (req.files.banner) {
            paths.banner = `/Images/${req.files.banner[0].filename}`;
        }

        res.status(200).json({
            message: 'Files uploaded successfully',
            paths: paths
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

console.log('✅ Upload route /images registered');

export default router;
