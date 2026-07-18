import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    // recruiter who created this company
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // optional logo URL
    logo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
export default Company;
