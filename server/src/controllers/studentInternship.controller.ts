import { Response } from 'express';
import prisma from '../prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { internshipDiscoveryQuerySchema } from '../validators/internshipDiscovery.validator';

/**
 * Common projection for company profile to ensure no private account/user credentials leak.
 */
const publicCompanySummarySelect = {
  id: true,
  companyName: true,
  logoUrl: true,
  location: true,
  industry: true,
};

const publicCompanyDetailSelect = {
  ...publicCompanySummarySelect,
  companySize: true,
  website: true,
  linkedinUrl: true,
  description: true,
};

/**
 * Standardized skill inclusion for student discovery.
 */
const skillsInclude = {
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
};

/**
 * Returns the Prisma filter condition for discoverable internships:
 * 1. Must have status 'PUBLISHED' (Excludes DRAFT, CLOSED, ARCHIVED)
 * 2. Application deadline must not have passed (Expired-deadline policy)
 */
function getDiscoveryEligibilityWhere(now: Date = new Date()) {
  return {
    status: 'PUBLISHED' as const,
    OR: [
      { applicationDeadline: { gte: now } },
      { applicationDeadline: null },
    ],
  };
}

/**
 * Format listing items for the student discovery list.
 */
function formatDiscoveryListItem(internship: any) {
  return {
    id: internship.id,
    title: internship.title,
    category: internship.category,
    description: internship.description,
    workType: internship.workType,
    location: internship.location,
    duration: internship.duration,
    allowanceMin: internship.allowanceMin,
    allowanceMax: internship.allowanceMax,
    currency: internship.currency,
    positions: internship.positions,
    applicationDeadline: internship.applicationDeadline,
    status: internship.status,
    publishedAt: internship.publishedAt,
    createdAt: internship.createdAt,
    company: internship.companyProfile
      ? {
          id: internship.companyProfile.id,
          companyName: internship.companyProfile.companyName,
          logoUrl: internship.companyProfile.logoUrl,
          location: internship.companyProfile.location,
          industry: internship.companyProfile.industry,
        }
      : null,
    skills: Array.isArray(internship.skills)
      ? internship.skills.map((s: any) => ({
          skillId: s.skillId,
          name: s.skill?.name ?? '',
          category: s.skill?.category?.name ?? null,
          type: s.type,
        }))
      : [],
  };
}

/**
 * Format full details for an individual published internship.
 */
function formatDiscoveryDetailItem(internship: any) {
  return {
    id: internship.id,
    title: internship.title,
    category: internship.category,
    description: internship.description,
    responsibilities: internship.responsibilities,
    workType: internship.workType,
    location: internship.location,
    duration: internship.duration,
    allowanceMin: internship.allowanceMin,
    allowanceMax: internship.allowanceMax,
    currency: internship.currency,
    positions: internship.positions,
    applicationDeadline: internship.applicationDeadline,
    status: internship.status,
    publishedAt: internship.publishedAt,
    createdAt: internship.createdAt,
    updatedAt: internship.updatedAt,
    company: internship.companyProfile
      ? {
          id: internship.companyProfile.id,
          companyName: internship.companyProfile.companyName,
          logoUrl: internship.companyProfile.logoUrl,
          location: internship.companyProfile.location,
          industry: internship.companyProfile.industry,
          companySize: internship.companyProfile.companySize,
          website: internship.companyProfile.website,
          linkedinUrl: internship.companyProfile.linkedinUrl,
          description: internship.companyProfile.description,
        }
      : null,
    skills: Array.isArray(internship.skills)
      ? internship.skills.map((s: any) => ({
          skillId: s.skillId,
          name: s.skill?.name ?? '',
          category: s.skill?.category?.name ?? null,
          type: s.type,
        }))
      : [],
  };
}

/**
 * GET /api/student/internships
 * Retrieve paginated published internships with active deadlines.
 */
export async function getPublishedInternships(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  // 1. Validate query parameters
  const parseResult = internshipDiscoveryQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues.map((err) => ({
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

  const { page, limit, search, workType, category, location } = parseResult.data;

  try {
    const now = new Date();
    const whereClause: any = {
      ...getDiscoveryEligibilityWhere(now),
    };

    if (workType) {
      whereClause.workType = workType;
    }

    if (category) {
      whereClause.category = {
        contains: category,
        mode: 'insensitive',
      };
    }

    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive',
      };
    }

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            {
              companyProfile: {
                companyName: { contains: search, mode: 'insensitive' },
              },
            },
            {
              skills: {
                some: {
                  skill: {
                    name: { contains: search, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        },
      ];
    }

    // Run count and query in parallel for pagination
    const [totalCount, internships] = await Promise.all([
      prisma.internship.count({ where: whereClause }),
      prisma.internship.findMany({
        where: whereClause,
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          companyProfile: {
            select: publicCompanySummarySelect,
          },
          skills: skillsInclude,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 'success',
      internships: internships.map(formatDiscoveryListItem),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalItems: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching published internships for student:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve published internships',
    });
  }
}

/**
 * GET /api/student/internships/:id
 * Retrieve full details of one published internship.
 * Returns 404 if the internship is DRAFT, CLOSED, ARCHIVED, expired, or non-existent.
 */
export async function getPublishedInternshipById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const id = req.params.id as string;
  if (!id) {
    res.status(400).json({
      status: 'error',
      message: 'Internship ID is required',
    });
    return;
  }

  try {
    const now = new Date();
    const internship = await prisma.internship.findFirst({
      where: {
        id,
        ...getDiscoveryEligibilityWhere(now),
      },
      include: {
        companyProfile: {
          select: publicCompanyDetailSelect,
        },
        skills: skillsInclude,
      },
    });

    if (!internship) {
      res.status(404).json({
        status: 'error',
        message: 'Internship listing not found or is no longer available',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      internship: formatDiscoveryDetailItem(internship),
    });
  } catch (error) {
    console.error('Error fetching published internship details by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve internship details',
    });
  }
}
