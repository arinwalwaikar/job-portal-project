import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/users/register
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { fullname, email, phoneNumber, password, role } = req.body;

    // 1. Basic validation
    if (!fullname || !email || !phoneNumber || !password || !role) {
      res.status(400);
      throw new Error('All fields (fullname, email, phoneNumber, password, role) are required');
    }

    // 2. Validate role selection
    if (role !== 'candidate' && role !== 'recruiter') {
      res.status(400);
      throw new Error("Role must be either 'candidate' or 'recruiter'");
    }

    // 3. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }

    // 4. Create new user in the database
    // The password is automatically hashed via userModel's pre-save middleware hook
    const user = await User.create({
      fullname,
      email,
      phoneNumber,
      password,
      role,
    });

    // 5. Send successful response (excluding the password for security)
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Pass error to global custom error middleware handler
    next(error);
  }
};

/**
 * @desc    Login user & get token
 * @route   POST /api/v1/users/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 3. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // 4. Generate JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // 5. Set HTTP‑only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // 6. Respond with user data (no password)
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullname}`,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user – clear JWT cookie
 * @route   POST /api/v1/users/logout
 * @access  Public (client can always clear its own cookie)
 */
export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// Upload resume (PDF) – stores URL and original filename
export const uploadResumeHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Resume file is required');
    }
    const resumeUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'profile.resume': resumeUrl,
          'profile.resumeOriginalName': req.file.originalname,
        },
      },
      { new: true, select: '-password' }
    );
    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile photo (image) – stores URL
export const uploadPhotoHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Profile photo is required');
    }
    const photoUrl = `/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'profile.profilePhoto': photoUrl } },
      { new: true, select: '-password' }
    );
    res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user's profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['fullname', 'phoneNumber', 'bio', 'skills'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'bio' || field === 'skills') {
          // Nested under profile
          updates[`profile.${field}`] = req.body[field];
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    // If no valid fields provided
    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error('No valid fields to update');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true, select: '-password' }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
