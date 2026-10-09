import { Router } from 'express';
import {
  applyForInternship,
  getStudentApplications,
  getStudentApplicationById,
  withdrawStudentApplication,
} from '../controllers/studentApplication.controller';

const router = Router();

// POST /api/student/applications - Submit an application
router.post('/', applyForInternship);

// GET /api/student/applications - List student-owned applications (paginated, status filter)
router.get('/', getStudentApplications);

// GET /api/student/applications/:id - View application details and student-safe status history
router.get('/:id', getStudentApplicationById);

// POST /api/student/applications/:id/withdraw - Withdraw an eligible application
router.post('/:id/withdraw', withdrawStudentApplication);

export default router;
