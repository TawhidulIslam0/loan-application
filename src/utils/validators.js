// ==========================================
// C3.1: PAN Validation Algorithm
// ==========================================
export const validatePAN = (pan, loanType = 'Personal') => {
  if (!pan || typeof pan !== 'string') {
    return { isValid: false, error: 'PAN is required' };
  }

  const upperPAN = pan.trim().toUpperCase();

  // Standard PAN format: 5 letters, 4 digits, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(upperPAN)) {
    return {
      isValid: false,
      error: 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234P)',
    };
  }

  const fourthChar = upperPAN[3];

  // Rule C3.1: Only P for Personal/Home; P, C, or F for Business
  if (loanType === 'Business') {
    if (!['P', 'C', 'F'].includes(fourthChar)) {
      return {
        isValid: false,
        error: 'Business loans require PAN with 4th character as P (Individual), C (Company), or F (Firm)',
      };
    }
  } else {
    if (fourthChar !== 'P') {
      return {
        isValid: false,
        error: 'Personal and Home loans require an Individual PAN (4th character must be P)',
      };
    }
  }

  return { isValid: true, error: null };
};

// ==========================================
// C3.2: Aadhaar Verhoeff Checksum Algorithm
// ==========================================
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export const validateVerhoeff = (numStr) => {
  if (!numStr || !/^\d+$/.test(numStr)) {
    return false;
  }

  let c = 0;
  const digits = numStr.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }

  return c === 0;
};

export const validateAadhaar = (aadhaar) => {
  if (!aadhaar || typeof aadhaar !== 'string') {
    return { isValid: false, error: 'Aadhaar is required' };
  }

  const cleanAadhaar = aadhaar.replace(/\D/g, '');

  if (cleanAadhaar.length !== 12) {
    return {
      isValid: false,
      error: 'Aadhaar must be exactly 12 digits.',
    };
  }

  if (!validateVerhoeff(cleanAadhaar)) {
    return {
      isValid: false,
      error: 'Invalid Aadhaar checksum (Verhoeff validation failed).',
    };
  }

  return { isValid: true, error: null };
};

// ==========================================
// C3.3: EMI Calculation & Indian Formatting
// ==========================================

export const formatIndianCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateLoanDetails = (principal, tenureMonths, loanType) => {
  const P = Number(principal);
  const n = Number(tenureMonths);

  if (!P || !n || P <= 0 || n <= 0) {
    return { emi: 0, totalInterest: 0, totalAmount: 0, processingFee: 0 };
  }

  // Interest Rates p.a.
  const rates = {
    Personal: 10.5,
    Home: 8.5,
    Business: 14.0,
  };

  const annualRate = rates[loanType] || 10.5;
  const r = annualRate / 12 / 100; // Monthly interest rate

  // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  // Processing Fee: 1% of loan amount (Min ₹2,000, Max ₹25,000)
  let processingFee = P * 0.01;
  if (processingFee < 2000) processingFee = 2000;
  if (processingFee > 25000) processingFee = 25000;

  return {
    annualRate,
    emi,
    totalInterest,
    totalPayment,
    processingFee,
  };
};