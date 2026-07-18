import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';
import companyRoutes from './routes/companyRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import path from 'path';

const app = express();

// Enable CORS with credentials support
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  })
);

// Parse cookies
app.use(cookieParser());

// Body parser middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  '/uploads',
  express.static(path.resolve(process.cwd(), 'uploads'))
);

// Health check API route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API is running',
  });
});

// Mount Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);

// Centralized error handling middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
