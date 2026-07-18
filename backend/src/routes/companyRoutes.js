import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  createCompany,
  getMyCompanies,
  getCompanyById,
  updateCompany,
} from '../controllers/companyController.js';

const router = express.Router();

// Create a new company (recruiter only)
router.post('/', protect, authorize('recruiter'), createCompany);

// Get all companies created by the logged‑in recruiter
router.get('/me', protect, authorize('recruiter'), getMyCompanies);

// Get a single company by ID (any authenticated user)
router.get('/:id', protect, getCompanyById);

// Update a company (owner recruiter only)
router.put('/:id', protect, authorize('recruiter'), updateCompany);

export default router;
