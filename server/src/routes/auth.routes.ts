import { Router } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  googleAuth,
  googleCompleteRegistration,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Local authentication endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Google authentication endpoints
// 1. Google sign-in / verification (returning user logs in, new user gets role selection)
router.post('/google', googleAuth);

// 2. Google onboarding completion (Student or Company only, Admin is prohibited)
router.post('/google/complete-registration', googleCompleteRegistration);

// Protected user profile endpoint
router.get('/me', requireAuth, getCurrentUser);

export default router;
