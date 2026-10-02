export interface ProfileCompletionItem {
  key: string;
  label: string;
  completed: boolean;
  weight: number;
}

export interface ProfileCompletion {
  percentage: number;
  completedWeight: number;
  totalWeight: 100;
  completedItems: number;
  totalItems: number;
  missing: ProfileCompletionItem[];
}

export const STUDENT_COMPLETION_WEIGHTS = {
  profileImage: 5,
  university: 10,
  degree: 10,
  fieldOfStudy: 10,
  currentYear: 5,
  expectedGraduation: 5,
  location: 5,
  preferredRole: 10,
  preferredWorkType: 5,
  bio: 10,
  skills: 15,
  linkedinUrl: 5,
  githubOrPortfolio: 5,
} as const;

export const COMPANY_COMPLETION_WEIGHTS = {
  companyName: 15,
  industry: 15,
  companySize: 10,
  location: 10,
  description: 20,
  logoUrl: 10,
  website: 10,
  linkedinUrl: 10,
} as const;

function hasValue(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
}

/**
 * Calculates Student profile completion based on a 100-point transparent weighted model.
 * 
 * Weights:
 * - Profile photo: 5
 * - University: 10
 * - Degree: 10
 * - Field of study: 10
 * - Current year: 5
 * - Expected graduation: 5
 * - Location: 5
 * - Preferred role: 10
 * - Preferred work type: 5
 * - Bio: 10
 * - At least 3 skills: 15
 * - LinkedIn: 5
 * - GitHub OR Portfolio: 5
 * Total: 100
 */
export function calculateStudentProfileCompletion(profileData: any): ProfileCompletion {
  if (!profileData) {
    return {
      percentage: 0,
      completedWeight: 0,
      totalWeight: 100,
      completedItems: 0,
      totalItems: 13,
      missing: [],
    };
  }

  const profileImage = profileData.user?.profileImage ?? profileData.profileImage;
  const skills = profileData.skills || [];

  const items: ProfileCompletionItem[] = [
    {
      key: 'profileImage',
      label: 'Add a profile photo',
      completed: hasValue(profileImage),
      weight: STUDENT_COMPLETION_WEIGHTS.profileImage,
    },
    {
      key: 'university',
      label: 'Add your university',
      completed: hasValue(profileData.university),
      weight: STUDENT_COMPLETION_WEIGHTS.university,
    },
    {
      key: 'degree',
      label: 'Add your degree',
      completed: hasValue(profileData.degree),
      weight: STUDENT_COMPLETION_WEIGHTS.degree,
    },
    {
      key: 'fieldOfStudy',
      label: 'Add your field of study',
      completed: hasValue(profileData.fieldOfStudy),
      weight: STUDENT_COMPLETION_WEIGHTS.fieldOfStudy,
    },
    {
      key: 'currentYear',
      label: 'Add your current academic year',
      completed: profileData.currentYear !== null && profileData.currentYear !== undefined && Number(profileData.currentYear) > 0,
      weight: STUDENT_COMPLETION_WEIGHTS.currentYear,
    },
    {
      key: 'expectedGraduation',
      label: 'Add your expected graduation date',
      completed: profileData.expectedGraduation !== null && profileData.expectedGraduation !== undefined,
      weight: STUDENT_COMPLETION_WEIGHTS.expectedGraduation,
    },
    {
      key: 'location',
      label: 'Add your location',
      completed: hasValue(profileData.location),
      weight: STUDENT_COMPLETION_WEIGHTS.location,
    },
    {
      key: 'preferredRole',
      label: 'Add your preferred internship role',
      completed: hasValue(profileData.preferredRole),
      weight: STUDENT_COMPLETION_WEIGHTS.preferredRole,
    },
    {
      key: 'preferredWorkType',
      label: 'Add your preferred work type (Remote, Hybrid, Onsite)',
      completed: hasValue(profileData.preferredWorkType),
      weight: STUDENT_COMPLETION_WEIGHTS.preferredWorkType,
    },
    {
      key: 'bio',
      label: 'Add a personal bio',
      completed: hasValue(profileData.bio),
      weight: STUDENT_COMPLETION_WEIGHTS.bio,
    },
    {
      key: 'skills',
      label: 'Add at least 3 skills',
      completed: Array.isArray(skills) && skills.length >= 3,
      weight: STUDENT_COMPLETION_WEIGHTS.skills,
    },
    {
      key: 'linkedinUrl',
      label: 'Add your LinkedIn profile',
      completed: hasValue(profileData.linkedinUrl),
      weight: STUDENT_COMPLETION_WEIGHTS.linkedinUrl,
    },
    {
      key: 'githubOrPortfolio',
      label: 'Add your GitHub or Portfolio link',
      completed: hasValue(profileData.githubUrl) || hasValue(profileData.portfolioUrl),
      weight: STUDENT_COMPLETION_WEIGHTS.githubOrPortfolio,
    },
  ];

  const completedWeight = items.reduce((acc, curr) => acc + (curr.completed ? curr.weight : 0), 0);
  const completedItems = items.filter((i) => i.completed).length;
  const missing = items.filter((i) => !i.completed);

  return {
    percentage: completedWeight,
    completedWeight,
    totalWeight: 100,
    completedItems,
    totalItems: items.length,
    missing,
  };
}

/**
 * Calculates Company profile completion based on a 100-point transparent weighted model.
 * 
 * Weights:
 * - Company name: 15
 * - Industry: 15
 * - Company size: 10
 * - Location: 10
 * - Description: 20
 * - Company logo: 10
 * - Website: 10
 * - LinkedIn: 10
 * Total: 100
 */
export function calculateCompanyProfileCompletion(profileData: any): ProfileCompletion {
  if (!profileData) {
    return {
      percentage: 0,
      completedWeight: 0,
      totalWeight: 100,
      completedItems: 0,
      totalItems: 8,
      missing: [],
    };
  }

  const items: ProfileCompletionItem[] = [
    {
      key: 'companyName',
      label: 'Add company name',
      completed: hasValue(profileData.companyName),
      weight: COMPANY_COMPLETION_WEIGHTS.companyName,
    },
    {
      key: 'industry',
      label: 'Add your industry',
      completed: hasValue(profileData.industry),
      weight: COMPANY_COMPLETION_WEIGHTS.industry,
    },
    {
      key: 'companySize',
      label: 'Select company size',
      completed: hasValue(profileData.companySize),
      weight: COMPANY_COMPLETION_WEIGHTS.companySize,
    },
    {
      key: 'location',
      label: 'Add company location',
      completed: hasValue(profileData.location),
      weight: COMPANY_COMPLETION_WEIGHTS.location,
    },
    {
      key: 'description',
      label: 'Add an about description',
      completed: hasValue(profileData.description),
      weight: COMPANY_COMPLETION_WEIGHTS.description,
    },
    {
      key: 'logoUrl',
      label: 'Upload company logo',
      completed: hasValue(profileData.logoUrl),
      weight: COMPANY_COMPLETION_WEIGHTS.logoUrl,
    },
    {
      key: 'website',
      label: 'Add company website',
      completed: hasValue(profileData.website),
      weight: COMPANY_COMPLETION_WEIGHTS.website,
    },
    {
      key: 'linkedinUrl',
      label: 'Add LinkedIn company page',
      completed: hasValue(profileData.linkedinUrl),
      weight: COMPANY_COMPLETION_WEIGHTS.linkedinUrl,
    },
  ];

  const completedWeight = items.reduce((acc, curr) => acc + (curr.completed ? curr.weight : 0), 0);
  const completedItems = items.filter((i) => i.completed).length;
  const missing = items.filter((i) => !i.completed);

  return {
    percentage: completedWeight,
    completedWeight,
    totalWeight: 100,
    completedItems,
    totalItems: items.length,
    missing,
  };
}
