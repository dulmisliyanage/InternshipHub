import { z } from 'zod';

export const internshipDiscoveryQuerySchema = z.object({
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

  search: z.string().trim().max(100, 'Search term cannot exceed 100 characters').optional(),
  workType: z
    .enum(['REMOTE', 'HYBRID', 'ONSITE'], {
      message: 'Work type must be REMOTE, HYBRID, or ONSITE',
    })
    .optional(),
  category: z.string().trim().max(100, 'Category cannot exceed 100 characters').optional(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional(),
});

export type InternshipDiscoveryQuery = z.infer<typeof internshipDiscoveryQuerySchema>;
