import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['candidate', 'recruiter'],
        message: 'Role must be either candidate or recruiter',
      },
      required: [true, 'User role is required'],
    },
    profile: {
      bio: {
        type: String,
        default: '',
      },
      skills: [
        {
          type: String,
        },
      ],
      resume: {
        type: String, // URL to resume file (e.g. Cloudinary, AWS S3)
        default: '',
      },
      resumeOriginalName: {
        type: String,
        default: '',
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', // Will reference the Company model
      },
      profilePhoto: {
        type: String, // URL to image
        default: '',
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

// Pre-save hook to hash password before saving to DB
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper instance method to compare passwords (for future login use)
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
