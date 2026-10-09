import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  createInternshipSchema,
  updateInternshipSchema,
} from '../validators/internship.validator';

const internshipInclude = {
  companyProfile: {
    select: {
      id: true,
      companyName: true,
      logoUrl: true,
      location: true,
    },
  },
  skills: {
    include: {
      skill: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
};

/**
 * Format database internship into a clean, safe contract.
 */
function formatInternship(internship: any) {
  if (!internship) return null;

  return {
    id: internship.id,
    title: internship.title,
    category: internship.category,
    description: internship.description,
    responsibilities: internship.responsibilities,
    location: internship.location,
    workType: internship.workType,
    duration: internship.duration,
    allowanceMin: internship.allowanceMin,
    allowanceMax: internship.allowanceMax,
    currency: internship.currency,
    positions: internship.positions,
    applicationDeadline: internship.applicationDeadline,
    status: internship.status,
    publishedAt: internship.publishedAt,
    closedAt: internship.closedAt,
    createdAt: internship.createdAt,
    updatedAt: internship.updatedAt,
    company: internship.companyProfile
      ? {
          id: internship.companyProfile.id,
          companyName: internship.companyProfile.companyName,
          logoUrl: internship.companyProfile.logoUrl,
          location: internship.companyProfile.location,
        }
      : undefined,
    skills: Array.isArray(internship.skills)
      ? internship.skills.map((s: any) => ({
          id: s.id,
          skillId: s.skillId,
          name: s.skill?.name ?? '',
          category: s.skill?.category?.name ?? null,
          type: s.type,
        }))
      : [],
  };
}

/**
 * Helper to get authenticated company profile or return null.
 */
async function getCompanyProfileByUserId(userId: string) {
  return await prisma.companyProfile.findUnique({
    where: { userId },
  });
}

/**
 * Helper to verify that all provided skill IDs exist in the standardized catalog.
 */
async function validateSkillCatalogIds(skills: { skillId: string }[]): Promise<boolean> {
  if (!skills || skills.length === 0) return true;
  const uniqueSkillIds = Array.from(new Set(skills.map((s) => s.skillId)));
  const count = await prisma.skill.count({
    where: { id: { in: uniqueSkillIds } },
  });
  return count === uniqueSkillIds.length;
}

/**
 * POST /api/company/internships
 * Create a new internship listing (always creates as DRAFT).
 */
export async function createInternship(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  const parseResult = createInternshipSchema.safeParse(req.body);
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

  const data = parseResult.data;

  // Validate skill catalog existence
  if (data.skills && data.skills.length > 0) {
    const allValid = await validateSkillCatalogIds(data.skills);
    if (!allValid) {
      res.status(400).json({
        status: 'error',
        message: 'One or more selected skills do not exist in the standardized skill catalog',
      });
      return;
    }
  }

  try {
    const created = await prisma.internship.create({
      data: {
        companyProfileId: companyProfile.id,
        title: data.title,
        category: data.category ?? null,
        description: data.description,
        responsibilities: data.responsibilities ?? null,
        location: data.location ?? null,
        workType: data.workType,
        duration: data.duration ?? null,
        allowanceMin: data.allowanceMin ?? null,
        allowanceMax: data.allowanceMax ?? null,
        currency: data.currency ?? 'LKR',
        positions: data.positions ?? 1,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        status: 'DRAFT',
        skills:
          data.skills && data.skills.length > 0
            ? {
                create: data.skills.map((s) => ({
                  skillId: s.skillId,
                  type: s.type,
                })),
              }
            : undefined,
      },
      include: internshipInclude,
    });

    res.status(201).json({
      status: 'success',
      message: 'Internship listing created successfully as draft',
      internship: formatInternship(created),
    });
  } catch (error) {
    console.error('Error creating internship listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create internship listing',
    });
  }
}

/**
 * GET /api/company/internships
 * Retrieve all internship listings belonging to the authenticated company.
 */
export async function getCompanyInternships(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  try {
    const statusQuery = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : undefined;
    const whereClause: any = { companyProfileId: companyProfile.id };

    if (statusQuery && ['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'].includes(statusQuery)) {
      whereClause.status = statusQuery;
    }

    const internships = await prisma.internship.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: internshipInclude,
    });

    res.status(200).json({
      status: 'success',
      internships: internships.map(formatInternship),
    });
  } catch (error) {
    console.error('Error fetching company internships:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve internship listings',
    });
  }
}

/**
 * GET /api/company/internships/:id
 * Retrieve a single internship listing belonging to the authenticated company.
 */
export async function getCompanyInternshipById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  const id = req.params.id as string;

  try {
    const internship = await prisma.internship.findFirst({
      where: {
        id,
        companyProfileId: companyProfile.id,
      },
      include: internshipInclude,
    });

    if (!internship) {
      res.status(404).json({
        status: 'error',
        message: 'Internship listing not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      internship: formatInternship(internship),
    });
  } catch (error) {
    console.error('Error fetching internship by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve internship listing',
    });
  }
}

/**
 * PUT /api/company/internships/:id
 * Update an existing internship listing and replace its skills.
 */
export async function updateCompanyInternship(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  const id = req.params.id as string;

  // Verify ownership
  const existing = await prisma.internship.findFirst({
    where: {
      id,
      companyProfileId: companyProfile.id,
    },
  });

  if (!existing) {
    res.status(404).json({
      status: 'error',
      message: 'Internship listing not found',
    });
    return;
  }

  const parseResult = updateInternshipSchema.safeParse(req.body);
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

  const data = parseResult.data;

  // Validate skill catalog existence
  if (data.skills && data.skills.length > 0) {
    const allValid = await validateSkillCatalogIds(data.skills);
    if (!allValid) {
      res.status(400).json({
        status: 'error',
        message: 'One or more selected skills do not exist in the standardized skill catalog',
      });
      return;
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update internship basic fields
      await tx.internship.update({
        where: { id },
        data: {
          title: data.title,
          category: data.category ?? null,
          description: data.description,
          responsibilities: data.responsibilities ?? null,
          location: data.location ?? null,
          workType: data.workType,
          duration: data.duration ?? null,
          allowanceMin: data.allowanceMin ?? null,
          allowanceMax: data.allowanceMax ?? null,
          currency: data.currency ?? 'LKR',
          positions: data.positions ?? 1,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
        },
      });

      // 2. Replace skills atomically
      await tx.internshipSkill.deleteMany({
        where: { internshipId: id },
      });

      if (data.skills && data.skills.length > 0) {
        await tx.internshipSkill.createMany({
          data: data.skills.map((s) => ({
            internshipId: id,
            skillId: s.skillId,
            type: s.type,
          })),
        });
      }

      // 3. Return refreshed internship with relations
      return await tx.internship.findUniqueOrThrow({
        where: { id },
        include: internshipInclude,
      });
    });

    res.status(200).json({
      status: 'success',
      message: 'Internship listing updated successfully',
      internship: formatInternship(updated),
    });
  } catch (error) {
    console.error('Error updating internship listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update internship listing',
    });
  }
}

/**
 * POST /api/company/internships/:id/publish
 * Publish a DRAFT internship listing.
 */
export async function publishCompanyInternship(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  const id = req.params.id as string;

  const internship = await prisma.internship.findFirst({
    where: {
      id,
      companyProfileId: companyProfile.id,
    },
    include: internshipInclude,
  });

  if (!internship) {
    res.status(404).json({
      status: 'error',
      message: 'Internship listing not found',
    });
    return;
  }

  // Lifecycle check
  if (internship.status === 'PUBLISHED') {
    res.status(400).json({
      status: 'error',
      message: 'Internship is already published',
    });
    return;
  }
  if (internship.status === 'CLOSED') {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish a closed internship',
    });
    return;
  }
  if (internship.status === 'ARCHIVED') {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish an archived internship',
    });
    return;
  }
  if (internship.status !== 'DRAFT') {
    res.status(400).json({
      status: 'error',
      message: 'Only draft internships can be published',
    });
    return;
  }

  // Pre-publication business validation
  if (!internship.title || internship.title.trim().length === 0) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: title is required',
    });
    return;
  }

  if (!internship.description || internship.description.trim().length === 0) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: description is required',
    });
    return;
  }

  if (!internship.workType) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: work type is required',
    });
    return;
  }

  if (!internship.positions || internship.positions < 1) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: positions must be at least 1',
    });
    return;
  }

  if (!internship.applicationDeadline) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: application deadline is required',
    });
    return;
  }

  if (new Date(internship.applicationDeadline).getTime() <= Date.now()) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: application deadline must be set in the future',
    });
    return;
  }

  const hasRequiredSkill = internship.skills.some((s: any) => s.type === 'REQUIRED');
  if (!hasRequiredSkill) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot publish: at least one REQUIRED skill is required',
    });
    return;
  }

  try {
    const published = await prisma.internship.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: internshipInclude,
    });

    res.status(200).json({
      status: 'success',
      message: 'Internship listing published successfully',
      internship: formatInternship(published),
    });
  } catch (error) {
    console.error('Error publishing internship listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to publish internship listing',
    });
  }
}

/**
 * POST /api/company/internships/:id/close
 * Close an active (PUBLISHED) internship listing.
 */
export async function closeCompanyInternship(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  const id = req.params.id as string;

  const internship = await prisma.internship.findFirst({
    where: {
      id,
      companyProfileId: companyProfile.id,
    },
  });

  if (!internship) {
    res.status(404).json({
      status: 'error',
      message: 'Internship listing not found',
    });
    return;
  }

  if (internship.status === 'CLOSED') {
    res.status(400).json({
      status: 'error',
      message: 'Internship is already closed',
    });
    return;
  }
  if (internship.status === 'DRAFT') {
    res.status(400).json({
      status: 'error',
      message: 'Cannot close an internship that is still in draft',
    });
    return;
  }
  if (internship.status === 'ARCHIVED') {
    res.status(400).json({
      status: 'error',
      message: 'Cannot close an archived internship',
    });
    return;
  }
  if (internship.status !== 'PUBLISHED') {
    res.status(400).json({
      status: 'error',
      message: 'Only published internships can be closed',
    });
    return;
  }

  try {
    const closed = await prisma.internship.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: internshipInclude,
    });

    res.status(200).json({
      status: 'success',
      message: 'Internship listing closed successfully',
      internship: formatInternship(closed),
    });
  } catch (error) {
    console.error('Error closing internship listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to close internship listing',
    });
  }
}

/**
 * POST /api/company/internships/:id/archive
 * Archive a DRAFT or CLOSED internship listing.
 */
export async function archiveCompanyInternship(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  const companyProfile = await getCompanyProfileByUserId(userId);
  if (!companyProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete company onboarding first.',
    });
    return;
  }

  const id = req.params.id as string;

  const internship = await prisma.internship.findFirst({
    where: {
      id,
      companyProfileId: companyProfile.id,
    },
  });

  if (!internship) {
    res.status(404).json({
      status: 'error',
      message: 'Internship listing not found',
    });
    return;
  }

  if (internship.status === 'ARCHIVED') {
    res.status(400).json({
      status: 'error',
      message: 'Internship is already archived',
    });
    return;
  }
  if (internship.status === 'PUBLISHED') {
    res.status(400).json({
      status: 'error',
      message: 'Cannot archive an active listing. Please close the internship before archiving.',
    });
    return;
  }
  if (internship.status !== 'DRAFT' && internship.status !== 'CLOSED') {
    res.status(400).json({
      status: 'error',
      message: 'Only draft or closed internships can be archived',
    });
    return;
  }

  try {
    const archived = await prisma.internship.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
      include: internshipInclude,
    });

    res.status(200).json({
      status: 'success',
      message: 'Internship listing archived successfully',
      internship: formatInternship(archived),
    });
  } catch (error) {
    console.error('Error archiving internship listing:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to archive internship listing',
    });
  }
}
