import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authenticate and requireRole('STUDENT') to all /api/student routes
router.use(authenticate, requireRole('STUDENT'));

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
