import { z } from 'zod';

/**
 * Zod schema for querying applicants of a company internship.
 */
export const companyApplicantQuerySchema = z.object({
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

export type CompanyApplicantQueryInput = z.infer<typeof companyApplicantQuerySchema>;

/**
 * Zod schema for validating internship ID route parameter.
 */
export const internshipIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Internship ID is required'),
});

export type InternshipIdParam = z.infer<typeof internshipIdParamSchema>;

/**
 * Zod schema for validating application ID route parameter.
 */
export const applicationIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Application ID is required'),
});

export type ApplicationIdParam = z.infer<typeof applicationIdParamSchema>;
