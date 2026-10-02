import { z } from 'zod';

/**
 * Validates that an optional string is a valid HTTP or HTTPS URL,
 * transforming empty or whitespace strings to null.
 */
export const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid URL starting with http:// or https://' }
  )
  .transform((val) => (val ? val : null))
  .nullable()
  .optional()
  .or(z.literal('').transform(() => null));
