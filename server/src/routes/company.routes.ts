import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  getCompanyProfile,
  updateCompanyProfile,
} from '../controllers/company-profile.controller';

const router = Router();

// Apply authenticate and requireRole('COMPANY') to all /api/company routes
router.use(authenticate, requireRole('COMPANY'));

// Company Profile Management
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Company Portal',
    company: {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role,
    },
    data: {
      activeListingsCount: 0,
      totalApplicantsCount: 0,
    },
  });
});

export default router;
