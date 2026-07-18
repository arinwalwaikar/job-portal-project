import Job from '../models/jobModel.js';
import Company from '../models/companyModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new job posting (Recruiter only)
 * @route   POST /api/v1/jobs
 * @access  Private (recruiter)
 */
export const createJob = async (req, res, next) => {
    try {
        const {
            title, description, requirements,
            salary, location, jobType,
            experienceLevel, position, company,
        } = req.body;

        // Basic validation
        if (!title || !description || !company) {
            res.status(400);
            throw new Error('Title, description, and company are required');
        }

        if (!mongoose.isValidObjectId(company)) {
            res.status(400);
            throw new Error('Invalid company ID');
        }

        // Ensure the company belongs to the logged-in recruiter
        const companyDoc = await Company.findById(company);
        if (!companyDoc) {
            res.status(404);
            throw new Error('Company not found');
        }
        if (companyDoc.recruiter.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You are not authorized to post jobs for this company');
        }

        const job = await Job.create({
            title,
            description,
            requirements: requirements || [],
            salary,
            location,
            jobType,
            experienceLevel,
            position,
            company,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all jobs (with optional filters: keyword, location, jobType, experienceLevel)
 * @route   GET /api/v1/jobs
 * @access  Private (any authenticated user)
 */
export const getAllJobs = async (req, res, next) => {
    try {
        const { keyword, location, jobType, experienceLevel } = req.query;

        const filter = {};

        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { position: { $regex: keyword, $options: 'i' } },
            ];
        }

        if (location) filter.location = { $regex: location, $options: 'i' };
        if (jobType) filter.jobType = jobType;
        if (experienceLevel) filter.experienceLevel = experienceLevel;

        const jobs = await Job.find(filter)
            .populate('company', 'name location logo website')
            .populate('createdBy', 'fullname email')
            .sort({ postedAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single job by its ID
 * @route   GET /api/v1/jobs/:id
 * @access  Private (any authenticated user)
 */
export const getJobById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid job ID');
        }

        const job = await Job.findById(id)
            .populate('company', 'name location logo website description')
            .populate('createdBy', 'fullname email');

        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }

        res.status(200).json({
            success: true,
            job,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all jobs posted by the logged-in recruiter
 * @route   GET /api/v1/jobs/me
 * @access  Private (recruiter)
 */
export const getMyJobs = async (req, res, next) => {
    try {
        const jobs = await Job.find({ createdBy: req.user._id })
            .populate('company', 'name location logo')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            jobs,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a job posting (owner recruiter only)
 * @route   PUT /api/v1/jobs/:id
 * @access  Private (recruiter)
 */
export const updateJob = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid job ID');
        }

        const job = await Job.findById(id);
        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }

        // Only the recruiter who created the job can update it
        if (job.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You are not authorized to update this job');
        }

        const allowedUpdates = [
            'title', 'description', 'requirements',
            'salary', 'location', 'jobType',
            'experienceLevel', 'position',
        ];
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

        const updatedJob = await Job.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate('company', 'name location logo');

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            job: updatedJob,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a job posting (owner recruiter only)
 * @route   DELETE /api/v1/jobs/:id
 * @access  Private (recruiter)
 */
export const deleteJob = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400);
            throw new Error('Invalid job ID');
        }

        const job = await Job.findById(id);
        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }

        // Only the recruiter who created the job can delete it
        if (job.createdBy.toString() !== req.user._id.toString()) {
            res.status(453);
            throw new Error('You are not authorized to delete this job');
        }

        await Job.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};