import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  getStudentProfile,
  updateStudentProfile,
  getSkillsCatalog,
} from '../controllers/student-profile.controller';

const router = Router();

// Apply authenticate and requireRole('STUDENT') to all /api/student routes
router.use(authenticate, requireRole('STUDENT'));

// Profile and Skills Management
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/skills', getSkillsCatalog);

router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Student Dashboard',
    student: {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role,
    },
    data: {
      appliedInternshipsCount: 0,
      savedInternshipsCount: 0,
    },
  });
});

export default router;
