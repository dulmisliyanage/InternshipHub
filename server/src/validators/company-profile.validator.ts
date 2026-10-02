import { z } from 'zod';
import { optionalUrl } from './common.validator';

const optionalString = (maxLength: number, fieldName: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .transform((val) => (val ? val : null))
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null));

export const companySizeEnum = z.enum(
  ['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'],
  {
    message: 'Company size must be STARTUP, SMALL, MEDIUM, LARGE, or ENTERPRISE',
  }
);

export const updateCompanyProfileSchema = z.object({
  companyName: z
    .string({
      error: 'Company name is required',
    })
    .trim()
    .min(1, 'Company name is required and cannot be empty')
    .max(150, 'Company name cannot exceed 150 characters'),
  industry: optionalString(150, 'Industry'),
  companySize: companySizeEnum
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  location: optionalString(150, 'Location'),
  website: optionalUrl,
  linkedinUrl: optionalUrl,
  description: optionalString(2000, 'Description'),
  logoUrl: optionalUrl,
});

export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;
