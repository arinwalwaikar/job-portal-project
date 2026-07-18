import mongoose from 'mongoose';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';

/**
 * @desc    Candidate applies for a job
 * @route   POST /api/v1/applications/:jobId
 * @access  Private (candidate)
 */
export const applyForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        // Validate job ID
        if (!mongoose.isValidObjectId(jobId)) {
            res.status(400);
            throw new Error('Invalid job ID');
        }

        // Check if the job exists
        const job = await Job.findById(jobId);

        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }

        // Prevent duplicate applications
        const existing = await Application.findOne({
            applicant: req.user._id,
            job: jobId,
        });

        if (existing) {
            res.status(400);
            throw new Error('You have already applied to this job');
        }

        const { resume = '', coverLetter = '' } = req.body;

        const application = await Application.create({
            applicant: req.user._id,
            job: jobId,
            resume,
            coverLetter,
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all applications submitted by the logged-in candidate
 * @route   GET /api/v1/applications/me
 * @access  Private (candidate)
 */
export const getMyApplications = async (req, res, next) => {
    try {
        const applications = await Application.find({
            applicant: req.user._id,
        })
            .populate('job', 'title location jobType salary')
            .populate({
                path: 'job',
                populate: {
                    path: 'company',
                    select: 'name',
                },
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all applicants for a specific job
 * @route   GET /api/v1/applications/job/:jobId
 * @access  Private (recruiter)
 */
export const getApplicantsForJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;

        // Validate job ID
        if (!mongoose.isValidObjectId(jobId)) {
            res.status(400);
            throw new Error('Invalid job ID');
        }

        // Check if job exists
        const job = await Job.findById(jobId);

        if (!job) {
            res.status(404);
            throw new Error('Job not found');
        }

        // Verify job ownership
        if (job.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You are not authorized to view applicants for this job');
        }

        const applications = await Application.find({
            job: jobId,
        })
            .populate('applicant', 'fullname email phoneNumber profile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update application status
 * @route   PUT /api/v1/applications/:applicationId/status
 * @access  Private (recruiter)
 */
export const updateApplicationStatus = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;

        // Validate application ID
        if (!mongoose.isValidObjectId(applicationId)) {
            res.status(400);
            throw new Error('Invalid application ID');
        }

        // Check if application exists
        const application = await Application.findById(applicationId);

        if (!application) {
            res.status(404);
            throw new Error('Application not found');
        }

        // Check if recruiter owns the job
        const job = await Job.findById(application.job);

        if (!job) {
            res.status(404);
            throw new Error('Associated job not found');
        }

        if (job.createdBy.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('You are not authorized to update this application');
        }

        // Validate status
        const allowedStatuses = [
            'pending',
            'reviewed',
            'accepted',
            'rejected',
        ];

        if (!allowedStatuses.includes(status)) {
            res.status(400);
            throw new Error(
                `Status must be one of: ${allowedStatuses.join(', ')}`
            );
        }

        application.status = status;
        await application.save();

        const updatedApplication = await Application.findById(applicationId)
            .populate('applicant', 'fullname email phoneNumber profile')
            .populate('job', 'title');

        res.status(200).json({
            success: true,
            message: 'Application status updated',
            application: updatedApplication,
        });
    } catch (error) {
        next(error);
    }
};