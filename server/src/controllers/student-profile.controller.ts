import { Response } from 'express';
import { Readable } from 'stream';
import type { UploadApiResponse } from 'cloudinary';
import prisma from '../prisma';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { updateStudentProfileSchema } from '../validators/student-profile.validator';

/**
 * Format database student profile record into a clean, safe response object.
 */
function formatProfileResponse(profile: any) {
  if (!profile) return null;

  return {
    id: profile.id,
    userId: profile.userId,
    name: profile.user?.name,
    email: profile.user?.email,
    profileImage: profile.user?.profileImage,
    university: profile.university,
    degree: profile.degree,
    fieldOfStudy: profile.fieldOfStudy,
    currentYear: profile.currentYear,
    expectedGraduation: profile.expectedGraduation,
    location: profile.location,
    preferredRole: profile.preferredRole,
    preferredWorkType: profile.preferredWorkType,
    bio: profile.bio,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
    cvUrl: profile.cvUrl,
    skills: (profile.skills || []).map((ss: any) => ({
      id: ss.skill.id,
      name: ss.skill.name,
      category: ss.skill.category?.name,
      proficiency: ss.proficiency,
    })),
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

/**
 * GET /api/student/profile
 * Retrieves the authenticated student's profile and associated skills.
 * Returns { profile: null } with status 200 if profile has not been created yet.
 */
export async function getStudentProfile(
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
    const profile = await prisma.studentProfile.findUnique({
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
        skills: {
          include: {
            skill: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            skill: {
              name: 'asc',
            },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      profile: formatProfileResponse(profile),
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve profile',
    });
  }
}

/**
 * PUT /api/student/profile
 * Creates or updates the student's profile and manages skill assignments transactionally.
 */
export async function updateStudentProfile(
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

  // 1. Validate payload
  const parseResult = updateStudentProfileSchema.safeParse(req.body);
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

  // 2. Validate skill IDs existence in database if skills are passed
  if (data.skills && data.skills.length > 0) {
    const requestedSkillIds = data.skills.map((s) => s.skillId);
    const existingSkills = await prisma.skill.findMany({
      where: { id: { in: requestedSkillIds } },
      select: { id: true },
    });

    if (existingSkills.length !== requestedSkillIds.length) {
      const existingSet = new Set(existingSkills.map((s) => s.id));
      const invalidIds = requestedSkillIds.filter((id) => !existingSet.has(id));

      res.status(400).json({
        status: 'error',
        message: `Invalid skill ID(s) provided: ${invalidIds.join(', ')}`,
      });
      return;
    }
  }

  try {
    // 3. Perform atomic upsert of profile and skill replacement
    const savedProfileSummary = await prisma.$transaction(
      async (tx) => {
        // Upsert StudentProfile
        const profile = await tx.studentProfile.upsert({
          where: { userId },
          create: {
            userId,
            university: data.university,
            degree: data.degree,
            fieldOfStudy: data.fieldOfStudy,
            currentYear: data.currentYear,
            expectedGraduation: data.expectedGraduation,
            location: data.location,
            preferredRole: data.preferredRole,
            preferredWorkType: data.preferredWorkType,
            bio: data.bio,
            githubUrl: data.githubUrl,
            linkedinUrl: data.linkedinUrl,
            portfolioUrl: data.portfolioUrl,
            cvUrl: data.cvUrl,
          },
          update: {
            university: data.university,
            degree: data.degree,
            fieldOfStudy: data.fieldOfStudy,
            currentYear: data.currentYear,
            expectedGraduation: data.expectedGraduation,
            location: data.location,
            preferredRole: data.preferredRole,
            preferredWorkType: data.preferredWorkType,
            bio: data.bio,
            githubUrl: data.githubUrl,
            linkedinUrl: data.linkedinUrl,
            portfolioUrl: data.portfolioUrl,
            cvUrl: data.cvUrl,
          },
        });

        // Update User.profileImage if provided
        if (data.profileImage !== undefined) {
          await tx.user.update({
            where: { id: userId },
            data: { profileImage: data.profileImage },
          });
        }

        // Transactionally replace skills if provided
        if (data.skills !== undefined) {
          await tx.studentSkill.deleteMany({
            where: { studentProfileId: profile.id },
          });

          if (data.skills.length > 0) {
            await tx.studentSkill.createMany({
              data: data.skills.map((s) => ({
                studentProfileId: profile.id,
                skillId: s.skillId,
                proficiency: s.proficiency,
              })),
            });
          }
        }

        return profile;
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    // Fetch the updated profile with all relationships
    const fullProfile = await prisma.studentProfile.findUnique({
      where: { id: savedProfileSummary.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        skills: {
          include: {
            skill: {
              include: {
                category: true,
              },
            },
          },
          orderBy: {
            skill: {
              name: 'asc',
            },
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      profile: formatProfileResponse(fullProfile),
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile',
    });
  }
}

/**
 * GET /api/student/skills
 * Retrieves available skill categories and their skills sorted alphabetically.
 */
export async function getSkillsCatalog(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        skills: {
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      categories,
    });
  } catch (error) {
    console.error('Error fetching skills catalog:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve skills catalog',
    });
  }
}

/**
 * PUT /api/student/profile/image
 * Uploads a profile image to Cloudinary and saves the secure_url in User.profileImage.
 */
export async function uploadProfileImage(
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

  if (!req.file) {
    res.status(400).json({
      status: 'error',
      message: 'No image file provided in "image" field',
    });
    return;
  }

  // Check if Cloudinary is configured with valid credentials
  if (!isCloudinaryConfigured()) {
    res.status(503).json({
      status: 'error',
      message:
        'Cloudinary image storage is not yet configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env.',
    });
    return;
  }

  try {
    // Upload buffer to Cloudinary with stable public ID: student_<userId>
    const publicId = `student_${userId}`;
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'internshiphub/profiles',
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
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

    // Update User.profileImage in Neon database
    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: result.secure_url },
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile photo updated successfully',
      profileImage: result.secure_url,
    });
  } catch (error) {
    console.error('Error uploading profile image to Cloudinary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upload profile image to cloud storage',
    });
  }
}

/**
 * DELETE /api/student/profile/image
 * Deletes the profile image from Cloudinary and sets User.profileImage to null.
 */
export async function deleteProfileImage(
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
    // If Cloudinary is configured, delete asset from Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(`internshiphub/profiles/student_${userId}`, {
          invalidate: true,
        });
      } catch (cloudErr) {
        console.warn('Could not destroy Cloudinary asset (it may not exist):', cloudErr);
      }
    }

    // Set User.profileImage to null in Neon database
    await prisma.user.update({
      where: { id: userId },
      data: { profileImage: null },
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile photo removed successfully',
      profileImage: null,
    });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove profile image',
    });
  }
}

