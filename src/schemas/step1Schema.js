import { z } from 'zod';

export const loanPurposes = {
  Home: ['Purchase', 'Construction', 'Renovation'],
  Personal: ['Medical', 'Travel', 'Debt Consolidation', 'Wedding'],
  Business: ['Working Capital', 'Equipment Purchase', 'Expansion'],
};

export const createStep1Schema = () => {
  return z.object({
    loanType: z.enum(['Personal', 'Home', 'Business'], {
      required_error: 'Please select a loan type',
    }),
    loanAmount: z.number({ invalid_type_error: 'Please enter a valid loan amount' })
      .min(50000, 'Minimum loan amount is ₹50,000'),
    tenureMonths: z.number({ invalid_type_error: 'Please enter a valid tenure' })
      .min(12, 'Minimum tenure is 12 months'),
    purpose: z.string().min(1, 'Please select a loan purpose'),
  }).refine((data) => {
    let maxAmount = 1000000;
    let maxTenure = 60;

    if (data.loanType === 'Home') {
      maxAmount = 10000000; // 1 Cr
      maxTenure = 360;
    } else if (data.loanType === 'Business') {
      maxAmount = 5000000; // 50L
      maxTenure = 120;
    } else if (data.loanType === 'Personal') {
      maxAmount = 1000000; // 10L
      maxTenure = 60;
    }

    return data.loanAmount <= maxAmount && data.tenureMonths <= maxTenure;
  }, {
    message: 'Loan amount or tenure exceeds the maximum limit allowed for the selected loan type',
    path: ['loanAmount'],
  });
};