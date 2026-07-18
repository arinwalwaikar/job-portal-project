import express from 'express';
import { register, login, logout, getProfile, updateProfile, uploadResumeHandler, uploadPhotoHandler } from '../controllers/userController.js';
import { uploadResume, uploadPhoto } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Upload resume (PDF)
router.post('/profile/resume', protect, uploadResume.single('resume'), uploadResumeHandler);

// Upload profile photo (image)
router.post('/profile/photo', protect, uploadPhoto.single('photo'), uploadPhotoHandler);

// Define other endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
