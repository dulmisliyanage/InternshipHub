import { Router } from 'express';
import {
  applyForInternship,
  applyForInternshipWithCv,
  getStudentApplications,
  getStudentApplicationById,
  withdrawStudentApplication,
} from '../controllers/studentApplication.controller';
import { uploadCvMiddleware } from '../middleware/cvUpload.middleware';

const router = Router();

// POST /api/student/applications - Submit an application (JSON)
router.post('/', applyForInternship);

// POST /api/student/applications/with-cv - Submit an application with a private PDF CV (multipart/form-data)
router.post('/with-cv', uploadCvMiddleware, applyForInternshipWithCv);

// GET /api/student/applications - List student-owned applications (paginated, status filter)
router.get('/', getStudentApplications);

// GET /api/student/applications/:id - View application details and student-safe status history
router.get('/:id', getStudentApplicationById);

// POST /api/student/applications/:id/withdraw - Withdraw an eligible application
router.post('/:id/withdraw', withdrawStudentApplication);

export default router;
