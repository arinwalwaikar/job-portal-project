import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
    resume: {
      type: String,
      default: '',
    },
    coverLetter: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Ensure a candidate cannot apply to the same job twice
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
