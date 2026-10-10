import { Response } from 'express';
import fs from 'fs';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  companyApplicantQuerySchema,
  internshipIdParamSchema,
  applicationIdParamSchema,
} from '../validators/companyApplicant.validator';
import {
  getCompanyInternshipApplications,
  getCompanyApplicationDetails,
  getCompanyApplicationCvPath,
  ServiceError,
} from '../services/companyApplicant.service';

/**
 * GET /api/company/internships/:id/applications
 * Retrieve paginated list of applicants for a specific company-owned internship.
 */
export async function getInternshipApplications(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const paramParseResult = internshipIdParamSchema.safeParse(req.params);
  if (!paramParseResult.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid internship ID format',
    });
    return;
  }

  const queryParseResult = companyApplicantQuerySchema.safeParse(req.query);
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
    const result = await getCompanyInternshipApplications(
      userId,
      paramParseResult.data.id,
      queryParseResult.data
    );

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
        ...(err.errors ? { errors: err.errors } : {}),
      });
      return;
    }

    console.error('Error fetching internship applications:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve applications.',
    });
  }
}

/**
 * GET /api/company/applications/:id
 * Retrieve full application review details, applicant profile, skills, and status history.
 */
export async function getApplicationById(
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
    const application = await getCompanyApplicationDetails(
      userId,
      paramParseResult.data.id
    );

    res.status(200).json({
      status: 'success',
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

    console.error('Error fetching application details:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve application details.',
    });
  }
}

/**
 * GET /api/company/applications/:id/cv
 * Securely stream/download an applicant's PDF CV after company ownership authorization.
 */
export async function downloadApplicationCv(
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
    const { filePath, filename } = await getCompanyApplicationCvPath(
      userId,
      paramParseResult.data.id
    );

    // Apply safe headers to prevent caching, MIME sniffing, and storage key leakage
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const stream = fs.createReadStream(filePath);
    stream.on('error', (streamErr) => {
      console.error('Error streaming CV file:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to stream CV file.',
        });
      }
    });

    stream.pipe(res);
  } catch (err: any) {
    if (err instanceof ServiceError) {
      res.status(err.statusCode).json({
        status: 'error',
        message: err.message,
        ...(err.errors ? { errors: err.errors } : {}),
      });
      return;
    }

    console.error('Error downloading applicant CV:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to download CV.',
    });
  }
}
