import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
    createJob,
    getAllJobs,
    getJobById,
    getMyJobs,
    updateJob,
    deleteJob,
} from '../controllers/jobController.js';

const router = express.Router();

// Create a new job (recruiter only)
router.post('/', protect, authorize('recruiter'), createJob);

// Get all jobs posted by the logged-in recruiter
// NOTE: /me must come BEFORE /:id — otherwise Express matches "me" as an :id param
router.get('/me', protect, authorize('recruiter'), getMyJobs);

// Get all jobs with optional filters (public)
router.get('/', getAllJobs);

// Get a single job by ID (public)
router.get('/:id', getJobById);

// Update a job (owner recruiter only)
router.put('/:id', protect, authorize('recruiter'), updateJob);

// Delete a job (owner recruiter only)
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

export default router;