import multer from 'multer';

// Use memory storage so we can process with sharp before saving to disk
const storage = multer.memoryStorage();

// Strict 5MB limit
const limits = {
    fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, cb) => {
    // Whitelist allowed MIME types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

export const upload = multer({
    storage,
    limits,
    fileFilter,
});
