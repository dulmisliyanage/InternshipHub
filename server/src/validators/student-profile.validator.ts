import { z } from 'zod';
import { optionalUrl } from './common.validator';

const optionalDate = z
  .union([
    z
      .string()
      .trim()
      .refine(
        (val) => {
          if (!val) return true;
          const timestamp = Date.parse(val);
          return !isNaN(timestamp);
        },
        { message: 'Expected graduation must be a valid date' }
      ),
    z.date(),
    z.null(),
  ])
  .nullish()
  .transform((val) => {
    if (!val) return null;
    return val instanceof Date ? val : new Date(val);
  });

const optionalYear = z
  .union([
    z
      .number()
      .int('Current year must be an integer')
      .min(1, 'Current year must be at least 1')
      .max(10, 'Current year must be between 1 and 10'),
    z
      .string()
      .trim()
      .regex(/^\d+$/, 'Current year must be a positive integer')
      .transform(Number)
      .refine((n) => n >= 1 && n <= 10, {
        message: 'Current year must be between 1 and 10',
      }),
    z.null(),
  ])
  .nullish()
  .transform((val) => (val === undefined || val === null ? null : Number(val)));

export const studentSkillItemSchema = z.object({
  skillId: z.string().trim().min(1, 'Skill ID is required'),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    message: 'Proficiency must be BEGINNER, INTERMEDIATE, or ADVANCED',
  }),
});

export const updateStudentProfileSchema = z
  .object({
    university: z
      .string()
      .trim()
      .max(150, 'University cannot exceed 150 characters')
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    degree: z
      .string()
      .trim()
      .max(150, 'Degree cannot exceed 150 characters')
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    fieldOfStudy: z
      .string()
      .trim()
      .max(150, 'Field of study cannot exceed 150 characters')
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    currentYear: optionalYear,
    expectedGraduation: optionalDate,
    location: z
      .string()
      .trim()
      .max(150, 'Location cannot exceed 150 characters')
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    preferredRole: z
      .string()
      .trim()
      .max(150, 'Preferred role cannot exceed 150 characters')
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    preferredWorkType: z
      .enum(['REMOTE', 'HYBRID', 'ONSITE'], {
        message: 'Preferred work type must be REMOTE, HYBRID, or ONSITE',
      })
      .nullable()
      .optional()
      .or(z.literal('').transform(() => null)),
    profileImage: optionalUrl,
    bio: z
      .string()
      .trim()
      .max(1000, 'Bio cannot exceed 1000 characters')
      .nullable()
      .optional()
      .transform((v) => (v ? v : null)),
    githubUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    portfolioUrl: optionalUrl,
    cvUrl: optionalUrl,
    skills: z.array(studentSkillItemSchema).optional(),
  })
  .refine(
    (data) => {
      if (!data.skills || data.skills.length === 0) return true;
      const ids = data.skills.map((s) => s.skillId);
      return new Set(ids).size === ids.length;
    },
    {
      message: 'Duplicate skill IDs are not allowed in the same submission',
      path: ['skills'],
    }
  );

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type StudentSkillItemInput = z.infer<typeof studentSkillItemSchema>;
