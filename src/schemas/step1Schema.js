import { z } from 'zod';

export const loanPurposes = {
  Home: ['Purchase', 'Construction', 'Renovation'],
  Car: ['New Car', 'Used Car'],
  Personal: ['Medical', 'Travel', 'Debt Consolidation', 'Wedding'],
  Education: ['Higher Education Abroad', 'Domestic Tuition'],
};


export const createStep1Schema = (maxTenureYears = 30) => {
  const maxTenureMonths = maxTenureYears * 12;


  return z.object({
    loanType: z.enum(['Home', 'Car', 'Personal', 'Education'], {
      required_error: 'Please select a loan type',
    }),
    loanAmount: z.number({ invalid_type_error: 'Please enter a valid loan amount' })
      .min(1, 'Loan amount is required'),
    tenureMonths: z.number({ invalid_type_error: 'Please enter a valid tenure' })
      .min(6, 'Minimum tenure is 6 months')
      .max(maxTenureMonths, `Maximum tenure allowed is ${maxTenureMonths} months`),
    purpose: z.string().min(1, 'Please select a loan purpose'),
  }).refine((data) => {
    let min = 100000;
    let max = 10000000;


    if (data.loanType === 'Home') { min = 500000; max = 15000000; }
    else if (data.loanType === 'Car') { min = 100000; max = 3000000; }
    else if (data.loanType === 'Personal') { min = 50000; max = 1500000; }
    else if (data.loanType === 'Education') { min = 100000; max = 5000000; }


    return data.loanAmount >= min && data.loanAmount <= max;
  }, {
    message: 'Loan amount is out of the valid range for the selected loan type',
    path: ['loanAmount'],
  });
};
