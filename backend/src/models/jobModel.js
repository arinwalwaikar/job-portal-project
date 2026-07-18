import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Job description is required'],
    },

    requirements: {
      type: [String],
      default: [],
    },

    salary: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },

    location: {
      type: String,
      default: '',
      trim: true,
    },

    jobType: {
      type: String,
      enum: [
        'Full-time',
        'Part-time',
        'Contract',
        'Temporary',
        'Internship',
        'Freelance',
      ],
      default: 'Full-time',
    },

    experienceLevel: {
      type: String,
      enum: [
        'Entry',
        'Mid',
        'Senior',
        'Director',
        'Executive',
      ],
      default: 'Entry',
    },

    position: {
      type: String,
      default: '',
      trim: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },

    // The recruiter who posted the job (creator) – stored as a reference to the User model
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator (recruiter) reference is required'],
    },

    postedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Job', jobSchema);