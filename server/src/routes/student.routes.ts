import { Router, Response } from 'express';
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth.middleware';
import { uploadProfilePicture } from '../middleware/upload.middleware';
import {
  getStudentProfile,
  updateStudentProfile,
  getSkillsCatalog,
  uploadProfileImage,
  deleteProfileImage,
} from '../controllers/student-profile.controller';
import {
  getPublishedInternships,
  getPublishedInternshipById,
} from '../controllers/studentInternship.controller';

const router = Router();

// Apply authenticate and requireRole('STUDENT') to all /api/student routes
router.use(authenticate, requireRole('STUDENT'));

// Profile and Skills Management
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/skills', getSkillsCatalog);

// Profile Picture Management
router.put('/profile/image', uploadProfilePicture, uploadProfileImage);
router.delete('/profile/image', deleteProfileImage);

// Internship Discovery (Step 5.1) - Read-only published internship discovery
router.get('/internships', getPublishedInternships);
router.get('/internships/:id', getPublishedInternshipById);

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
