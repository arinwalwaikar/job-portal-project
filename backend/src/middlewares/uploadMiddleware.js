import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the uploads directory exists at the project root
const uploadDir = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: userId-timestamp-originalExt
    const ext = path.extname(file.originalname);
    const filename = `${req.user._id}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Accept only PDF for resumes
const resumeFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Resume must be a PDF file'), false);
  }
};

// Accept only common image types for profile photos
const photoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Profile photo must be an image'), false);
  }
};

export const uploadResume = multer({ storage, fileFilter: resumeFilter });
export const uploadPhoto = multer({ storage, fileFilter: photoFilter });
