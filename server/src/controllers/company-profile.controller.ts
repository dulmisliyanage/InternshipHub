import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { updateCompanyProfileSchema } from '../validators/company-profile.validator';

/**
 * Format database company profile into a clean, safe response object.
 */
function formatCompanyProfile(profile: any) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    industry: profile.industry,
    companySize: profile.companySize,
    location: profile.location,
    website: profile.website,
    linkedinUrl: profile.linkedinUrl,
    description: profile.description,
    logoUrl: profile.logoUrl,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
    user: profile.user
      ? {
          id: profile.user.id,
          name: profile.user.name,
          email: profile.user.email,
          profileImage: profile.user.profileImage,
        }
      : undefined,
  };
}

/**
 * GET /api/company/profile
 * Retrieves the authenticated company's profile.
 * Returns { status: 'success', profile: null } with HTTP 200 if no profile exists yet.
 */
export async function getCompanyProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
    return;
  }

  try {
    const profile = await prisma.companyProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      profile: formatCompanyProfile(profile),
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve company profile',
    });
  }
}

/**
 * PUT /api/company/profile
 * Creates or updates the company profile for the authenticated company user.
 */
export async function updateCompanyProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
    return;
  }

  // 1. Validate request body against Zod schema
  const parseResult = updateCompanyProfileSchema.safeParse(req.body);
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

  try {
    // 2. Perform atomic upsert using authenticated userId
    const profile = await prisma.companyProfile.upsert({
      where: { userId },
      create: {
        userId,
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        location: data.location,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        description: data.description,
        logoUrl: data.logoUrl,
      },
      update: {
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        location: data.location,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        description: data.description,
        logoUrl: data.logoUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Company profile updated successfully',
      profile: formatCompanyProfile(profile),
    });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update company profile',
    });
  }
}
