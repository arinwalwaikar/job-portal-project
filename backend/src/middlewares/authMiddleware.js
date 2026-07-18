import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * @desc    Protect routes – verify JWT stored in HTTP‑only cookie
 * @access  Private (any route that requires a logged‑in user)
 */
// protect middleware
export const protect = async (req, res, next) => {
  try {
    // 1️⃣  Retrieve token from cookies (cookie‑parser populates req.cookies)
    const token = req.cookies?.token;
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, token missing');
    }

    // 2️⃣  Verify token signature & expiration using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded example: { userId: '...', role: 'candidate', iat: ..., exp: ... }

    // 3️⃣  Load the user from DB – we only keep essential fields
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    // 4️⃣  Attach authenticated user to request for downstream controllers
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws on invalid signature, expired token, etc.
    // We forward the error to the global error handler with a 401 status.
    if (!res.statusCode || res.statusCode === 200) {
      res.status(401);
    }
    next(error);
  }
};

/**
 * @desc    Role‑based access – ensure user has one of the allowed roles
 * @param   {...string} roles – e.g. 'candidate', 'recruiter', 'admin'
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized, user missing'));
    }
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Forbidden – insufficient permissions'));
    }
    next();
  };
};
