// --- PAN Validation ---
export const validatePAN = (pan) => {
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

  // 4th character indicates entity type
  const validEntityTypes = new Set([
    'P', // Individual
    'C', // Company
    'H', // HUF
    'F', // Firm
    'A', // Association of Persons
    'T', // Trust
    'B', // Body of Individuals
    'L', // Local Authority
    'J', // Artificial Juridical Person
    'G', // Government
  ]);

  if (!validEntityTypes.has(upperPAN[3])) {
    return {
      isValid: false,
      error: 'Invalid PAN entity type.',
    };
  }

  return { isValid: true, error: null };
};

// --- Aadhaar Verhoeff Checksum Algorithm ---

const d = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];

const p = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
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
    return {
      isValid: false,
      error: 'Aadhaar is required',
    };
  }

  // Remove spaces, dashes, etc.
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
      error: 'Invalid Aadhaar checksum.',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};