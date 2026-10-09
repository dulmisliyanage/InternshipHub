import { z } from 'zod';

/**
 * Zod schema for submitting a new student internship application.
 * Uses .strict() to immediately reject prohibited fields such as
 * studentProfileId, status, cvUrl, cvFileId, changedById, etc.
 */
export const createStudentApplicationSchema = z
  .object({
    internshipId: z.string().trim().min(1, 'Internship ID is required'),
    coverLetter: z
      .string()
      .trim()
      .max(5000, 'Cover letter cannot exceed 5000 characters')
      .optional()
      .nullable(),
  })
  .strict();

export type CreateStudentApplicationInput = z.infer<typeof createStudentApplicationSchema>;

/**
 * Zod schema for querying student-owned applications list.
 */
export const studentApplicationQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === '') return true;
        const num = Number(val);
        return Number.isInteger(num) && num >= 1;
      },
      { message: 'Page must be an integer greater than or equal to 1' }
    )
    .transform((val) => {
      if (val === undefined || val === '') return 1;
      return Number(val);
    }),

  limit: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === '') return true;
        const num = Number(val);
        return Number.isInteger(num) && num >= 1 && num <= 50;
      },
      { message: 'Limit must be an integer between 1 and 50' }
    )
    .transform((val) => {
      if (val === undefined || val === '') return 10;
      return Number(val);
    }),

  status: z
    .enum(
      [
        'APPLIED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW',
        'ACCEPTED',
        'REJECTED',
        'WITHDRAWN',
      ],
      {
        message:
          'Status must be APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED, or WITHDRAWN',
      }
    )
    .optional(),
});

export type StudentApplicationQueryInput = z.infer<typeof studentApplicationQuerySchema>;

/**
 * Zod schema for validating application ID route parameter.
 */
export const applicationIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Application ID is required'),
});
