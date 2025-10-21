// backend/routes/authRoutes.js
import express from 'express';
// --- Import the new function and middleware ---
import { signUp, signIn, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
router.post('/signup', signUp);
router.post('/signin', signIn);

// --- Protected Route ---
// This tells the server how to handle GET requests to /api/auth/profile
router.get('/profile', protect, getProfile);

export default router;