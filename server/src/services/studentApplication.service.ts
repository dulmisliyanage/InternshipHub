import prisma from '../prisma';
import {
  CreateStudentApplicationInput,
  StudentApplicationQueryInput,
} from '../validators/studentApplication.validator';

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
 * Submit a new application for a published internship.
 */
export async function submitApplication(
  userId: string,
  input: CreateStudentApplicationInput
) {
  // 1. Resolve student profile from authenticated user session
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!studentProfile) {
    throw new ServiceError(
      400,
      'Student profile not found. Please complete your student profile before applying for internships.'
    );
  }

  // 2. Fetch target internship with company summary
  const internship = await prisma.internship.findUnique({
    where: { id: input.internshipId },
    include: {
      companyProfile: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          location: true,
          industry: true,
        },
      },
    },
  });

  if (!internship) {
    throw new ServiceError(404, 'Internship not found');
  }

  // 3. Verify internship publication eligibility
  if (internship.status !== 'PUBLISHED') {
    throw new ServiceError(
      400,
      `Cannot apply to an internship that is not published (current status: ${internship.status})`
    );
  }

  // 4. Verify application deadline
  if (internship.applicationDeadline) {
    const now = new Date();
    if (now > internship.applicationDeadline) {
      throw new ServiceError(
        400,
        'The application deadline for this internship has passed'
      );
    }
  }

  // 5. Pre-check for duplicate application
  const existingApplication = await prisma.application.findUnique({
    where: {
      studentProfileId_internshipId: {
        studentProfileId: studentProfile.id,
        internshipId: internship.id,
      },
    },
    select: { id: true },
  });

  if (existingApplication) {
    throw new ServiceError(
      409,
      'You have already submitted an application for this internship'
    );
  }

  // 6. Execute atomic creation of Application and initial APPLIED status history
  try {
    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          studentProfileId: studentProfile.id,
          internshipId: internship.id,
          coverLetter: input.coverLetter || null,
          status: 'APPLIED',
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          fromStatus: null,
          toStatus: 'APPLIED',
          changedById: userId,
          note: 'Initial application submitted by student',
        },
      });

      return application;
    });

    return {
      id: result.id,
      status: result.status,
      appliedAt: result.appliedAt,
      updatedAt: result.updatedAt,
      coverLetter: result.coverLetter,
      internshipId: internship.id,
      internship: {
        id: internship.id,
        title: internship.title,
        workType: internship.workType,
        location: internship.location,
        category: internship.category,
        duration: internship.duration,
        applicationDeadline: internship.applicationDeadline,
        company: internship.companyProfile,
      },
    };
  } catch (error: any) {
    // Intercept database composite unique constraint violation (concurrency race-condition guard)
    if (error.code === 'P2002') {
      throw new ServiceError(
        409,
        'You have already submitted an application for this internship'
      );
    }
    throw error;
  }
}

/**
 * List applications submitted by the authenticated student.
 */
export async function listStudentApplications(
  userId: string,
  query: StudentApplicationQueryInput
) {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!studentProfile) {
    return {
      applications: [],
      pagination: {
        total: 0,
        page: query.page,
        limit: query.limit,
        totalPages: 0,
      },
    };
  }

  const where: any = {
    studentProfileId: studentProfile.id,
  };

  if (query.status) {
    where.status = query.status;
  }

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
        coverLetter: true,
        cvUrl: true,
        internship: {
          select: {
            id: true,
            title: true,
            workType: true,
            location: true,
            category: true,
            duration: true,
            status: true,
            applicationDeadline: true,
            companyProfile: {
              select: {
                id: true,
                companyName: true,
                logoUrl: true,
                location: true,
                industry: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const formattedApplications = applications.map((app) => ({
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    coverLetter: app.coverLetter,
    cvUrl: app.cvUrl,
    internship: {
      id: app.internship.id,
      title: app.internship.title,
      workType: app.internship.workType,
      location: app.internship.location,
      category: app.internship.category,
      duration: app.internship.duration,
      status: app.internship.status,
      applicationDeadline: app.internship.applicationDeadline,
      company: app.internship.companyProfile
        ? {
            id: app.internship.companyProfile.id,
            companyName: app.internship.companyProfile.companyName,
            logoUrl: app.internship.companyProfile.logoUrl,
            location: app.internship.companyProfile.location,
            industry: app.internship.companyProfile.industry,
          }
        : null,
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
 * Retrieve details of a specific application owned by the authenticated student.
 * Returns 404 if the application belongs to another student to prevent enumeration.
 */
export async function getStudentApplicationById(
  userId: string,
  applicationId: string
) {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!studentProfile) {
    throw new ServiceError(404, 'Application not found');
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      internship: {
        include: {
          companyProfile: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              location: true,
              industry: true,
              website: true,
              companySize: true,
              description: true,
            },
          },
          skills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      statusHistory: {
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          changedAt: true,
          // Internal company note is intentionally excluded from student visibility
        },
        orderBy: { changedAt: 'asc' },
      },
    },
  });

  // Verify application existence and strict student profile ownership
  if (!application || application.studentProfileId !== studentProfile.id) {
    throw new ServiceError(404, 'Application not found');
  }

  return {
    id: application.id,
    status: application.status,
    coverLetter: application.coverLetter,
    cvUrl: application.cvUrl,
    appliedAt: application.appliedAt,
    updatedAt: application.updatedAt,
    internship: {
      id: application.internship.id,
      title: application.internship.title,
      description: application.internship.description,
      responsibilities: application.internship.responsibilities,
      category: application.internship.category,
      workType: application.internship.workType,
      location: application.internship.location,
      duration: application.internship.duration,
      allowanceMin: application.internship.allowanceMin,
      allowanceMax: application.internship.allowanceMax,
      currency: application.internship.currency,
      positions: application.internship.positions,
      applicationDeadline: application.internship.applicationDeadline,
      status: application.internship.status,
      company: application.internship.companyProfile,
      skills: application.internship.skills.map((s) => ({
        skillId: s.skillId,
        name: s.skill?.name ?? '',
        type: s.type,
      })),
    },
    statusHistory: application.statusHistory,
  };
}

/**
 * Withdraw an active application owned by the authenticated student.
 * Supports withdrawal from APPLIED, UNDER_REVIEW, SHORTLISTED, or INTERVIEW.
 * Rejects withdrawal from ACCEPTED, REJECTED, or already WITHDRAWN.
 * Uses conditional atomic updates to prevent overwriting concurrent company status changes.
 */
export async function withdrawApplication(
  userId: string,
  applicationId: string
) {
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!studentProfile) {
    throw new ServiceError(404, 'Application not found');
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application || application.studentProfileId !== studentProfile.id) {
    throw new ServiceError(404, 'Application not found');
  }

  // Validate allowed withdrawal statuses
  if (application.status === 'WITHDRAWN') {
    throw new ServiceError(400, 'Application has already been withdrawn');
  }

  if (application.status === 'ACCEPTED') {
    throw new ServiceError(
      400,
      'Cannot withdraw an application that has already been accepted'
    );
  }

  if (application.status === 'REJECTED') {
    throw new ServiceError(
      400,
      'Cannot withdraw an application that has already been rejected'
    );
  }

  const allowedWithdrawalStatuses = [
    'APPLIED',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'INTERVIEW',
  ];

  if (!allowedWithdrawalStatuses.includes(application.status)) {
    throw new ServiceError(
      400,
      `Cannot withdraw application with status '${application.status}'`
    );
  }

  // Conditional atomic status update within a Prisma transaction
  return await prisma.$transaction(async (tx) => {
    const updateResult = await tx.application.updateMany({
      where: {
        id: applicationId,
        studentProfileId: studentProfile.id,
        status: { in: ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'] },
      },
      data: {
        status: 'WITHDRAWN',
      },
    });

    if (updateResult.count === 0) {
      // Status was changed concurrently by company or another process
      const current = await tx.application.findUnique({
        where: { id: applicationId },
        select: { status: true },
      });
      throw new ServiceError(
        409,
        `Application status changed concurrently to '${current?.status}'. Withdrawal could not be completed.`
      );
    }

    // Record audit history entry
    await tx.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: 'WITHDRAWN',
        changedById: userId,
        note: 'Application withdrawn by student',
      },
    });

    const updatedApp = await tx.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedApp;
  });
}
