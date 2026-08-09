import { z } from 'zod';

export const step6Schema = z.object({
  hasCoApplicant: z.boolean(),
  coApplicantName: z.string().min(2, 'Co-applicant name is required').optional(),
  relationship: z.enum(['Spouse', 'Parent', 'Sibling', 'Business Partner']).optional(),
  coApplicantPAN: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format (e.g., ABCDE1234P)')
    .optional(),
  coApplicantIncome: z
    .number({ invalid_type_error: 'Must be a valid amount' })
    .min(0, 'Income cannot be negative')
    .optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the co-applicant consent and signature' }),
  }),
});