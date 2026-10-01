import { z } from 'zod';

// Explicitly allow only STUDENT and COMPANY roles for public registration.
// Any attempt to register as ADMIN is rejected at the validator layer.
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['STUDENT', 'COMPANY']),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Google Authentication payload (supports GIS credential token or idToken)
export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential token is required').optional(),
  idToken: z.string().min(1, 'Google ID token is required').optional(),
}).refine((data) => !!(data.credential || data.idToken), {
  message: 'Either credential or idToken is required',
});

// First-time Google user onboarding completion:
// Strictly allow only STUDENT or COMPANY. ADMIN is forbidden.
export const googleCompleteRegistrationSchema = z.object({
  onboardingToken: z.string().min(1, 'Onboarding token is required'),
  role: z.enum(['STUDENT', 'COMPANY']),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type GoogleCompleteRegistrationInput = z.infer<typeof googleCompleteRegistrationSchema>;
