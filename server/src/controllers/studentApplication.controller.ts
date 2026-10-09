import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createStudentApplicationSchema,
  studentApplicationQuerySchema,
  applicationIdParamSchema,
} from '../validators/studentApplication.validator';
import {
  submitApplication,
  listStudentApplications,
  getStudentApplicationById as getApplicationDetails,
  withdrawApplication,
  ServiceError,
} from '../services/studentApplication.service';

/**
 * POST /api/student/applications
 * Submit a new application for a published internship.
 */
export async function applyForInternship(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const parseResult = createStudentApplicationSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    res.status(400).json({
      status: 'error',
      message: errorDetails[0]?.message || 'Validation failed',
      errors: errorDetails,
    });
    return;
  }

  try {
    const application = await submitApplication(userId, parseResult.data);
    res.status(201).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (err: any) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
        ...(err.errors ? { errors: err.errors } : {}),
      });
      return;
    }

    console.error('Error applying for internship:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit application. Please try again later.',
    });
  }
}

/**
 * GET /api/student/applications
 * List applications submitted by the authenticated student with pagination & status filtering.
 */
export async function getStudentApplications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const queryParseResult = studentApplicationQuerySchema.safeParse(req.query);
  if (!queryParseResult.success) {
    const errorDetails = queryParseResult.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    res.status(400).json({
      status: 'error',
      message: errorDetails[0]?.message || 'Invalid query parameters',
      errors: errorDetails,
    });
    return;
  }

  try {
    const result = await listStudentApplications(userId, queryParseResult.data);
    res.status(200).json({
      status: 'success',
      data: result.applications,
      pagination: result.pagination,
    });
  } catch (err: any) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
      return;
    }

    console.error('Error fetching student applications:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve applications.',
    });
  }
}

/**
 * GET /api/student/applications/:id
 * Retrieve specific application details and status history for the authenticated student.
 */
export async function getStudentApplicationById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const paramParseResult = applicationIdParamSchema.safeParse(req.params);
  if (!paramParseResult.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid application ID format',
    });
    return;
  }

  try {
    const application = await getApplicationDetails(userId, paramParseResult.data.id);
    res.status(200).json({
      status: 'success',
      data: application,
    });
  } catch (err: any) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
      return;
    }

    console.error('Error retrieving application details:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve application details.',
    });
  }
}

/**
 * POST /api/student/applications/:id/withdraw
 * Withdraw an active application owned by the authenticated student.
 */
export async function withdrawStudentApplication(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const paramParseResult = applicationIdParamSchema.safeParse(req.params);
  if (!paramParseResult.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid application ID format',
    });
    return;
  }

  try {
    const updated = await withdrawApplication(userId, paramParseResult.data.id);
    res.status(200).json({
      status: 'success',
      message: 'Application withdrawn successfully',
      data: updated,
    });
  } catch (err: any) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
      });
      return;
    }

    console.error('Error withdrawing application:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to withdraw application.',
    });
  }
}
