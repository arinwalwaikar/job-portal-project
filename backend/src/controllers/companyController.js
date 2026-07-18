import Company from '../models/companyModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new company (Recruiter only)
 * @route   POST /api/v1/companies
 * @access  Private (recruiter)
 */
export const createCompany = async (req, res, next) => {
  try {


    const { name, description, location, website, logo } = req.body;

    // Basic validation
    if (!name) {
      res.status(400);
      throw new Error('Company name is required');
    }

    const company = await Company.create({
      name,
      description,
      location,
      website,
      logo,
      recruiter: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all companies created by the logged‑in recruiter
 * @route   GET /api/v1/companies/me
 * @access  Private (recruiter)
 */
export const getMyCompanies = async (req, res, next) => {
  try {


    const companies = await Company.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single company by its ID
 * @route   GET /api/v1/companies/:id
 * @access  Private (any authenticated user)
 */
export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid company ID');
    }

    const company = await Company.findById(id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a company (only the owner recruiter)
 * @route   PUT /api/v1/companies/:id
 * @access  Private (recruiter)
 */
export const updateCompany = async (req, res, next) => {
  try {


    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400);
      throw new Error('Invalid company ID');
    }

    const company = await Company.findById(id);
    if (!company) {
      res.status(404);
      throw new Error('Company not found');
    }

    // Ensure the logged‑in recruiter owns this company
    if (company.recruiter.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to update this company');
    }

    // Allowed fields to update
    const allowedUpdates = ['name', 'description', 'location', 'website', 'logo'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error('No valid fields provided for update');
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company: updatedCompany,
    });
  } catch (error) {
    next(error);
  }
};
