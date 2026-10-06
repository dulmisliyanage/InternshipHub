import { z } from 'zod';

const optionalString = (maxLength: number, fieldName: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .transform((val) => (val ? val : null))
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null));

export const workTypeEnum = z.enum(['REMOTE', 'HYBRID', 'ONSITE'], {
  message: 'Work type must be REMOTE, HYBRID, or ONSITE',
});

export const internshipSkillTypeEnum = z.enum(['REQUIRED', 'PREFERRED'], {
  message: 'Skill type must be REQUIRED or PREFERRED',
});

export const internshipSkillItemSchema = z.object({
  skillId: z
    .string({ error: 'Skill ID is required' })
    .trim()
    .min(1, 'Skill ID cannot be empty'),
  type: internshipSkillTypeEnum.default('REQUIRED'),
});

const allowanceNumber = (fieldName: string) =>
  z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (val === '' || val === null || val === undefined) return null;
      const num = Number(val);
      return isNaN(num) ? null : Math.floor(num);
    })
    .refine((val) => val === null || val >= 0, {
      message: `${fieldName} cannot be negative`,
    })
    .nullable()
    .optional();

const positionsNumber = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return 1;
    const num = Number(val);
    return isNaN(num) ? 1 : Math.floor(num);
  })
  .refine((val) => val >= 1, {
    message: 'Positions must be at least 1',
  })
  .default(1);

const deadlineDate = z
  .union([z.string(), z.date()])
  .transform((val) => {
    if (!val || val === '') return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  })
  .nullable()
  .optional();

export const createInternshipSchema = z
  .object({
    title: z
      .string({ error: 'Title is required' })
      .trim()
      .min(1, 'Title is required and cannot be empty')
      .max(150, 'Title cannot exceed 150 characters'),
    category: optionalString(150, 'Category'),
    description: z
      .string({ error: 'Description is required' })
      .trim()
      .min(1, 'Description is required and cannot be empty')
      .max(5000, 'Description cannot exceed 5000 characters'),
    responsibilities: optionalString(5000, 'Responsibilities'),
    location: optionalString(150, 'Location'),
    workType: workTypeEnum,
    duration: optionalString(100, 'Duration'),
    allowanceMin: allowanceNumber('Minimum allowance'),
    allowanceMax: allowanceNumber('Maximum allowance'),
    currency: z
      .string()
      .trim()
      .max(10, 'Currency code cannot exceed 10 characters')
      .transform((val) => val || 'LKR')
      .nullable()
      .optional()
      .default('LKR'),
    positions: positionsNumber,
    applicationDeadline: deadlineDate,
    skills: z.array(internshipSkillItemSchema).optional().default([]),
  })
  .refine(
    (data) => {
      if (
        data.allowanceMin !== null &&
        data.allowanceMin !== undefined &&
        data.allowanceMax !== null &&
        data.allowanceMax !== undefined
      ) {
        return data.allowanceMin <= data.allowanceMax;
      }
      return true;
    },
    {
      message: 'Minimum allowance cannot be greater than maximum allowance',
      path: ['allowanceMin'],
    }
  )
  .refine(
    (data) => {
      if (!data.skills || data.skills.length <= 1) return true;
      const skillIds = data.skills.map((s) => s.skillId);
      return new Set(skillIds).size === skillIds.length;
    },
    {
      message:
        'Duplicate skill specified: each skill can only be listed once as either REQUIRED or PREFERRED',
      path: ['skills'],
    }
  );

export const updateInternshipSchema = createInternshipSchema;

export type CreateInternshipInput = z.infer<typeof createInternshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
