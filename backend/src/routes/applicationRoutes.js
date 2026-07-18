import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';

import {
    applyForJob,
    getMyApplications,
    getApplicantsForJob,
    updateApplicationStatus,
} from '../controllers/applicationController.js';

const router = express.Router();

// Candidate applies for a job
router.post('/:jobId', protect, authorize('candidate'), applyForJob);

// Candidate views their own applications
router.get('/me', protect, authorize('candidate'), getMyApplications);

// Recruiter views applicants for a specific job
router.get(
    '/job/:jobId',
    protect,
    authorize('recruiter'),
    getApplicantsForJob
);

// Recruiter updates application status
router.put(
    '/:applicationId/status',
    protect,
    authorize('recruiter'),
    updateApplicationStatus
);

export default router;