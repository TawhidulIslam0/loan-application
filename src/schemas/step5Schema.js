import { z } from 'zod';

// Base schema for common fields across all employment types
const baseEmploymentSchema = z.object({
  employmentType: z.enum(['Salaried', 'Self-Employed', 'Business Owner'], {
    required_error: 'Please select an employment type',
  }),
  yearsOfExperience: z
    .number({ invalid_type_error: 'Must be a number' })
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years'),
});

// Salaried Sub-schema
const salariedSchema = baseEmploymentSchema.extend({
  employmentType: z.literal('Salaried'),
  companyName: z.string().min(2, 'Company name is required'),
  designation: z.string().min(2, 'Designation is required'),
  monthlyNetSalary: z
    .number({ invalid_type_error: 'Must be a valid amount' })
    .min(15000, 'Minimum monthly net salary must be at least ₹15,000'),
});

// Self-Employed Sub-schema
const selfEmployedSchema = baseEmploymentSchema.extend({
  employmentType: z.literal('Self-Employed'),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  annualTurnover: z
    .number({ invalid_type_error: 'Must be a valid amount' })
    .min(300000, 'Minimum annual turnover must be at least ₹3,00,000'),
  yearsInBusiness: z
    .number({ invalid_type_error: 'Must be a number' })
    .min(2, 'Minimum 2 years in business required'),
  monthlyIncome: z
    .number({ invalid_type_error: 'Must be a valid amount' })
    .min(10000, 'Monthly income is required'),
  officeAddress: z.object({
    addressLine1: z.string().min(5, 'Office address is required'),
    pinCode: z.string().regex(/^\d{6}$/, 'Must be a valid 6-digit PIN code'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
  }),
});

// Business Owner Sub-schema
const businessOwnerSchema = baseEmploymentSchema.extend({
  employmentType: z.literal('Business Owner'),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  annualTurnover: z
    .number({ invalid_type_error: 'Must be a valid amount' })
    .min(300000, 'Minimum annual turnover must be at least ₹3,00,000'),
  yearsInBusiness: z
    .number({ invalid_type_error: 'Must be a number' })
    .min(2, 'Minimum 2 years in business required'),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      'Invalid GST format (e.g., 22AAAAA0000A1Z5)'
    ),
  officeAddress: z.object({
    addressLine1: z.string().min(5, 'Office address is required'),
    pinCode: z.string().regex(/^\d{6}$/, 'Must be a valid 6-digit PIN code'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
  }),
});

export const step5Schema = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);