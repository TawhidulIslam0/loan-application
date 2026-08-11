/**
 * Calculate loan EMI and total borrowing cost.
 *
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *
 * @param {number|string} principal
 * @param {number|string} annualInterestRate
 * @param {number|string} tenureMonths
 * @returns {{
 *   emi: number,
 *   totalPayment: number,
 *   totalInterest: number
 * }}
 */
export const calculateEMI = (
  principal,
  annualInterestRate,
  tenureMonths
) => {
  const P = Number(principal) || 0;
  const n = Number(tenureMonths) || 12;
  const annualRate = Number(annualInterestRate) || 10.5;

  if (P <= 0) {
    return {
      emi: 0,
      totalPayment: 0,
      totalInterest: 0,
    };
  }

  const r = annualRate / 12 / 100;

  if (r === 0) {
    const emi = P / n;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(P),
      totalInterest: 0,
    };
  }

  const factor = Math.pow(1 + r, n);
  const emi = (P * r * factor) / (factor - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
  };
};

export const calculateProcessingFee = (principal, loanType) => {
  const P = Number(principal) || 0;
  const type = String(loanType || '').toLowerCase();

  let feePercentage = 0.01;

  if (type.includes('home')) {
    feePercentage = 0.005;
  } else if (type.includes('business')) {
    feePercentage = 0.015;
  }

  const fee = P * feePercentage;

  return Math.round(Math.min(Math.max(fee, 2000), 25000));
};

export const getIndicativeInterestRate = (
  loanType,
  loanAmount,
  employmentType
) => {
  const amount = Number(loanAmount) || 0;
  const type = String(loanType || '').toLowerCase();
  const employment = String(employmentType || '').toLowerCase();

  let rate = 10.5;

  if (type.includes('home')) {
    rate = 8.5;
  } else if (type.includes('business')) {
    rate = 14.0;
  } else if (type.includes('personal')) {
    rate = amount > 1000000 ? 11.0 : 12.5;
  }

  if (employment.includes('salaried')) {
    rate -= 0.5;
  }

  return Number(rate.toFixed(2));
};

export const calculateLoanDetails = ({
  loanAmount,
  tenureMonths,
  loanType,
  employmentType,
  monthlyIncome,
  coApplicantIncome = 0,
}) => {
  const principal = Number(loanAmount) || 0;
  const primaryIncome = Number(monthlyIncome) || 0;
  const additionalIncome = Number(coApplicantIncome) || 0;

  const annualRate = getIndicativeInterestRate(
    loanType,
    principal,
    employmentType
  );

  const {
    emi,
    totalPayment,
    totalInterest,
  } = calculateEMI(
    principal,
    annualRate,
    tenureMonths
  );

  const processingFee = calculateProcessingFee(
    principal,
    loanType
  );

  const combinedMonthlyIncome = primaryIncome + additionalIncome;
  const maxAllowedEMI = combinedMonthlyIncome * 0.5;

  const isAffordable =
    combinedMonthlyIncome > 0 && emi <= maxAllowedEMI;

  const emiToIncomeRatio =
    combinedMonthlyIncome > 0
      ? (emi / combinedMonthlyIncome) * 100
      : 0;

  return {
    annualRate,
    emi,
    totalPayment,
    totalInterest,
    processingFee,
    combinedMonthlyIncome: Math.round(combinedMonthlyIncome),
    maxAllowedEMI: Math.round(maxAllowedEMI),
    emiToIncomeRatio: Number(emiToIncomeRatio.toFixed(2)),
    isAffordable,
  };
};

