import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';
import { uploadCompanyLogo as uploadCompanyLogoMiddleware } from '../middleware/upload.middleware';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  deleteCompanyLogo,
} from '../controllers/company-profile.controller';
import {
  createInternship,
  getCompanyInternships,
  getCompanyInternshipById,
  updateCompanyInternship,
  publishCompanyInternship,
  closeCompanyInternship,
  archiveCompanyInternship,
} from '../controllers/internship.controller';

const router = Router();

// Apply authenticate and requireRole('COMPANY') to all /api/company routes
router.use(authenticate, requireRole('COMPANY'));

// Company Profile Management
router.get('/profile', getCompanyProfile);
router.put('/profile', updateCompanyProfile);

// Company Logo Management
router.put('/profile/logo', uploadCompanyLogoMiddleware, uploadCompanyLogo);
router.delete('/profile/logo', deleteCompanyLogo);

// Internship Management (Phase 4)
router.post('/internships', createInternship);
router.get('/internships', getCompanyInternships);
router.get('/internships/:id', getCompanyInternshipById);
router.put('/internships/:id', updateCompanyInternship);
router.post('/internships/:id/publish', publishCompanyInternship);
router.post('/internships/:id/close', closeCompanyInternship);
router.post('/internships/:id/archive', archiveCompanyInternship);

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
