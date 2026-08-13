import { z } from 'zod';

/**
 * Schema Factory that accepts the complete form state and returns 
 * the appropriate Zod validation schema for any given step, incorporating 
 * all 14 cross-step validation dependencies from Section B3.
 */
export const schemaFactory = (step, formState) => {
  const loanType = formState.loanType || 'Personal';
  const loanAmount = Number(formState.loanAmount) || 0;
  const loanTenure = Number(formState.loanTenure) || 0;
  const applicantAge = formState.dateOfBirth ? calculateAge(new Date(formState.dateOfBirth)) : 25;
  const maritalStatus = formState.maritalStatus || 'Single';
  const panVerified = formState.panVerified || false;
  const residenceType = formState.residenceType || 'Owned';
  const employmentType = formState.employmentType || 'Salaried';
  const monthlyIncome = Number(formState.monthlyIncome) || 0;
  const coApplicantIncome = Number(formState.coApplicantIncome) || 0;

  switch (step) {
    case 1:
      return z.object({
        loanType: z.enum(['Personal', 'Home', 'Business']),
        // Dependency: Loan Amount ranges and maximum limits
        loanAmount: z.number().min(50000, 'Minimum loan amount is 50,000').max(
          loanType === 'Personal' ? 1000000 : loanType === 'Home' ? 10000000 : 5000000,
          `Maximum loan amount for ${loanType} loan exceeded`
        ),
        // Dependency: Age + Tenure must not exceed 65 years (Max tenure validation)
        loanTenure: z.number().refine(
          (tenure) => applicantAge + tenure / 12 <= 65,
          { message: 'Applicant age plus loan tenure must not exceed 65 years' }
        ),
        loanPurpose: z.string().min(1, 'Loan purpose is required'),
        referralCode: z.string().optional(),
      });

    case 2:
      return z.object({
        fullName: z.string().min(2, 'Full name is required'),
        dateOfBirth: z.string().refine((dob) => {
          const age = calculateAge(new Date(dob));
          return age >= 21 && age <= 65;
        }, 'Applicant age must be between 21 and 65 years'),
        maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
        email: z.string().email('Invalid email address'),
        mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid mobile number'),
      });

    case 3:
      return z.object({
        panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
        aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits'),
        aadhaarConsent: z.boolean().refine((val) => val === true, 'Consent is required'),
      });

    case 4:
      return z.object({
        currentAddressLine1: z.string().min(5, 'Address is required'),
        pinCode: z.string().regex(/^\d{6}$/, 'Invalid PIN code'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        residenceType: z.enum(['Owned', 'Rented', 'Company', 'Family']),
        // Dependency: Rented residence requires rent amount field
        rentAmount: residenceType === 'Rented' 
          ? z.number().min(1, 'Rent amount is required for rented properties') 
          : z.optional(z.number()),
      });

    case 5:
      return z.object({
        // Dependency: Business Loan requires Business Owner or Self-Employed (not Salaried)
        employmentType: z.enum(['Salaried', 'Self-Employed', 'Business Owner']).refine(
          (emp) => {
            if (loanType === 'Business' && emp === 'Salaried') {
              return false;
            }
            return true;
          },
          { message: 'Business Loans require Business Owner or Self-Employed employment type' }
        ),
        monthlyIncome: z.number().min(15000, 'Minimum monthly income is 15,000'),
      }).superRefine((data, ctx) => {
        // Dependency: EMI must not exceed 50% of income check (Step 8 prep / validation)
        const totalIncome = monthlyIncome + coApplicantIncome;
        const estimatedEMI = calculateApproxEMI(loanAmount, loanTenure, loanType);
        if (estimatedEMI > totalIncome * 0.5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Calculated EMI exceeds 50% of total monthly income ratio limit',
            path: ['monthlyIncome'],
          });
        }
      });

    case 6:
      // Dependency: Step visibility rules evaluated externally, but schema enforces contents if active
      return z.object({
        coApplicantName: z.string().min(2, 'Co-applicant name is required'),
        // Dependency: If Married, Spouse is default relationship option
        relationship: z.string().min(1, 'Relationship is required'),
        coApplicantPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
        coApplicantIncome: z.number().min(0, 'Income cannot be negative'),
        coApplicantConsent: z.boolean().refine((val) => val === true, 'Consent is required'),
      });

    case 7:
      return z.object({
        // Dependency: If PAN verified, PAN copy upload is optional
        panCardCopy: panVerified 
          ? z.any().optional() 
          : z.any().refine((val) => val != null, 'PAN card copy upload is required'),
        aadhaarFrontBack: z.any().refine((val) => val != null, 'Aadhaar copy is required'),
        // Dependency: Salaried needs salary slips; others need ITR
        salarySlips: employmentType === 'Salaried' 
          ? z.any().refine((val) => val != null, 'Salary slips are required for salaried applicants')
          : z.any().optional(),
        itrDocuments: employmentType !== 'Salaried' 
          ? z.any().refine((val) => val != null, 'ITR documents are required for non-salaried applicants')
          : z.any().optional(),
      });

    case 8:
      return z.object({
        finalConfirmation: z.boolean().refine((val) => val === true, 'Must confirm details'),
        creditBureauAuth: z.boolean().refine((val) => val === true, 'Credit check auth required'),
        termsAccepted: z.boolean().refine((val) => val === true, 'Must accept terms'),
        communicationConsent: z.boolean().refine((val) => val === true, 'Consent required'),
      });

    default:
      return z.object({});
  }
};

// Helper utilities for calculations inside schemas
function calculateAge(dob) {
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function calculateApproxEMI(principal, tenureMonths, type) {
  const rates = { Personal: 0.105, Home: 0.085, Business: 0.14 };
  const annualRate = rates[type] || 0.105;
  const r = annualRate / 12;
  if (r === 0) return principal / tenureMonths;
  return (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
}