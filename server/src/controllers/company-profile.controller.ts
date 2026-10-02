import { Response } from 'express';
import { Readable } from 'stream';
import type { UploadApiResponse } from 'cloudinary';
import prisma from '../prisma';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { updateCompanyProfileSchema } from '../validators/company-profile.validator';
import { calculateCompanyProfileCompletion } from '../utils/profile-completion';

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
    completion: calculateCompanyProfileCompletion(profile),
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
 * Note: logoUrl is server-managed via the dedicated /profile/logo endpoints.
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
    // 2. Perform atomic upsert using authenticated userId.
    // For update: keep the server-managed logoUrl untouched.
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
        logoUrl: data.logoUrl || null,
      },
      update: {
        companyName: data.companyName,
        industry: data.industry,
        companySize: data.companySize,
        location: data.location,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        description: data.description,
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

/**
 * PUT /api/company/profile/logo
 * Uploads an organization logo to Cloudinary and saves secure_url in CompanyProfile.logoUrl.
 * Rejects with 404 if company profile does not exist yet.
 */
export async function uploadCompanyLogo(
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

  // 1. Require an existing CompanyProfile
  const existingProfile = await prisma.companyProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete onboarding first.',
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      status: 'error',
      message: 'No logo file provided in "logo" field',
    });
    return;
  }

  // 2. Check Cloudinary configuration
  if (!isCloudinaryConfigured()) {
    res.status(503).json({
      status: 'error',
      message:
        'Cloudinary image storage is not yet configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.',
    });
    return;
  }

  try {
    // 3. Upload buffer to Cloudinary with stable public ID: company_<userId>
    // Logo transformation uses crop: 'fit' to preserve logo branding without cropping.
    const publicId = `company_${userId}`;
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'internshiphub/companies',
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            return reject(error || new Error('Upload to Cloudinary failed'));
          }
          resolve(uploadResult);
        }
      );

      Readable.from(req.file!.buffer).pipe(uploadStream);
    });

    // 4. Update CompanyProfile.logoUrl in Neon database
    await prisma.companyProfile.update({
      where: { userId },
      data: { logoUrl: result.secure_url },
    });

    res.status(200).json({
      status: 'success',
      message: 'Company logo updated successfully',
      logoUrl: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading company logo to Cloudinary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload company logo to cloud storage',
    });
  }
}

/**
 * DELETE /api/company/profile/logo
 * Deletes the company logo from Cloudinary and sets CompanyProfile.logoUrl to null.
 * Rejects with 404 if company profile does not exist.
 */
export async function deleteCompanyLogo(
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

  // 1. Require an existing CompanyProfile
  const existingProfile = await prisma.companyProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    res.status(404).json({
      status: 'error',
      message: 'Company profile not found. Please complete onboarding first.',
    });
    return;
  }

  // If no logo is currently set, return cleanly
  if (!existingProfile.logoUrl) {
    res.status(200).json({
      status: 'success',
      message: 'No logo to remove',
      logoUrl: null,
    });
    return;
  }

  try {
    // 2. Destroy asset from Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(
          `internshiphub/companies/company_${userId}`,
          { invalidate: true }
        );
      } catch (cloudErr) {
        console.error('Error destroying Cloudinary asset:', cloudErr);
        res.status(500).json({
          status: 'error',
          message: 'Failed to delete company logo from cloud storage',
        });
        return;
      }
    }

    // 3. Set CompanyProfile.logoUrl to null in Neon database
    await prisma.companyProfile.update({
      where: { userId },
      data: { logoUrl: null },
    });

    res.status(200).json({
      status: 'success',
      message: 'Company logo removed successfully',
      logoUrl: null,
    });
  } catch (error) {
    console.error('Error deleting company logo:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove company logo',
    });
  }
}
