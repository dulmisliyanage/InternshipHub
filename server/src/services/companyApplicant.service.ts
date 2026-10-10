import prisma from '../prisma';
import { CompanyApplicantQueryInput } from '../validators/companyApplicant.validator';
import { getCvFilePath } from '../storage/cvStorage';

export class ServiceError extends Error {
  statusCode: number;
  errors?: any[];

  constructor(statusCode: number, message: string, errors?: any[]) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/**
 * Helper to resolve company profile from authenticated user session.
 */
async function getCompanyProfileByUserId(userId: string) {
  const companyProfile = await prisma.companyProfile.findUnique({
    where: { userId },
    select: { id: true, companyName: true },
  });

  if (!companyProfile) {
    throw new ServiceError(
      404,
      'Company profile not found. Please complete company onboarding first.'
    );
  }

  return companyProfile;
}

/**
 * Retrieve paginated applications for a specific company-owned internship.
 * Enforces ownership check: returns 404 if the internship is non-existent or owned by another company.
 */
export async function getCompanyInternshipApplications(
  userId: string,
  internshipId: string,
  query: CompanyApplicantQueryInput
) {
  const companyProfile = await getCompanyProfileByUserId(userId);

  // 1. Verify internship existence and ownership
  const internship = await prisma.internship.findUnique({
    where: { id: internshipId },
    select: {
      id: true,
      title: true,
      companyProfileId: true,
    },
  });

  if (!internship || internship.companyProfileId !== companyProfile.id) {
    throw new ServiceError(404, 'Internship not found');
  }

  // 2. Build filtered application query
  const where: any = {
    internshipId: internship.id,
  };

  if (query.status) {
    where.status = query.status;
  }

  // 3. Query total count and paginated applications with safe projections
  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        updatedAt: true,
        cvUrl: true,
        studentProfile: {
          select: {
            id: true,
            university: true,
            degree: true,
            fieldOfStudy: true,
            currentYear: true,
            location: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
            skills: {
              select: {
                proficiency: true,
                skill: {
                  select: {
                    id: true,
                    name: true,
                    category: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  // 4. Format clean, safe responses without leaking internal storage keys
  const formattedApplications = applications.map((app) => ({
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    hasCv: !!app.cvUrl,
    student: {
      id: app.studentProfile.id,
      userId: app.studentProfile.user.id,
      name: app.studentProfile.user.name,
      email: app.studentProfile.user.email,
      profileImage: app.studentProfile.user.profileImage,
      university: app.studentProfile.university,
      degree: app.studentProfile.degree,
      fieldOfStudy: app.studentProfile.fieldOfStudy,
      currentYear: app.studentProfile.currentYear,
      location: app.studentProfile.location,
      skills: app.studentProfile.skills.map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
        proficiency: s.proficiency,
        category: s.skill.category?.name ?? null,
      })),
    },
    internship: {
      id: internship.id,
      title: internship.title,
    },
  }));

  return {
    applications: formattedApplications,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/**
 * Retrieve comprehensive details of a specific application for company review.
 * Enforces ownership check through the associated internship.
 */
export async function getCompanyApplicationDetails(
  userId: string,
  applicationId: string
) {
  const companyProfile = await getCompanyProfileByUserId(userId);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      internship: {
        select: {
          id: true,
          title: true,
          category: true,
          workType: true,
          location: true,
          status: true,
          companyProfileId: true,
        },
      },
      studentProfile: {
        select: {
          id: true,
          university: true,
          degree: true,
          fieldOfStudy: true,
          currentYear: true,
          expectedGraduation: true,
          location: true,
          bio: true,
          githubUrl: true,
          linkedinUrl: true,
          portfolioUrl: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          skills: {
            select: {
              proficiency: true,
              skill: {
                select: {
                  id: true,
                  name: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      statusHistory: {
        orderBy: { changedAt: 'asc' },
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          note: true,
          changedAt: true,
          changedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });

  // Verify ownership: application must exist and belong to an internship created by this company
  if (!application || application.internship.companyProfileId !== companyProfile.id) {
    throw new ServiceError(404, 'Application not found');
  }

  return {
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
    hasCv: !!application.cvUrl,
    student: {
      id: application.studentProfile.id,
      userId: application.studentProfile.user.id,
      name: application.studentProfile.user.name,
      email: application.studentProfile.user.email,
      profileImage: application.studentProfile.user.profileImage,
      university: application.studentProfile.university,
      degree: application.studentProfile.degree,
      fieldOfStudy: application.studentProfile.fieldOfStudy,
      currentYear: application.studentProfile.currentYear,
      expectedGraduation: application.studentProfile.expectedGraduation,
      location: application.studentProfile.location,
      bio: application.studentProfile.bio,
      githubUrl: application.studentProfile.githubUrl,
      linkedinUrl: application.studentProfile.linkedinUrl,
      portfolioUrl: application.studentProfile.portfolioUrl,
      skills: application.studentProfile.skills.map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
        proficiency: s.proficiency,
        category: s.skill.category?.name ?? null,
      })),
    },
    internship: {
      id: application.internship.id,
      title: application.internship.title,
      category: application.internship.category,
      workType: application.internship.workType,
      location: application.internship.location,
      status: application.internship.status,
    },
    statusHistory: application.statusHistory.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      note: h.note,
      changedAt: h.changedAt,
      changedBy: {
        id: h.changedBy.id,
        name: h.changedBy.name,
        role: h.changedBy.role,
      },
    })),
  };
}

/**
 * Resolves the private CV file path for an authorized company.
 * Verifies company ownership, existence of CV attachment, and presence on disk.
 */
export async function getCompanyApplicationCvPath(
  userId: string,
  applicationId: string
) {
  const companyProfile = await getCompanyProfileByUserId(userId);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      cvUrl: true,
      internship: {
        select: {
          companyProfileId: true,
        },
      },
    },
  });

  if (!application || application.internship.companyProfileId !== companyProfile.id) {
    throw new ServiceError(404, 'Application not found');
  }

  if (!application.cvUrl) {
    throw new ServiceError(404, 'No CV attached to this application');
  }

  const filePath = getCvFilePath(application.cvUrl);
  if (!filePath) {
    throw new ServiceError(404, 'CV file not found in storage');
  }

  return {
    filePath,
    filename: 'applicant_cv.pdf',
  };
}
