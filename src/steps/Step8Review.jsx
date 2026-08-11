import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { calculateLoanDetails } from '../utils/emiCalculator';
import { isStep6Active } from './Step6CoApplicant';

const TERMS_AND_CONDITIONS_URL = '/documents/terms-and-conditions.pdf';

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

const isUploaded = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value);

export default function Step8Review({ setCurrentStep }) {
  const { watch, register } = useFormContext();
  const [successData, setSuccessData] = useState(null);
  const formData = watch();

  const loanAmount = Number(formData.loanAmount) || 0;
  const tenureMonths = Number(formData.tenureMonths) || 36;
  const loanType = formData.loanType || 'Personal';
  const employmentType = formData.employmentType || 'Salaried';
  const monthlyIncome = Number(
    formData.monthlyIncome || formData.monthlyNetSalary || 0
  );

  const step6Active = isStep6Active(loanType, loanAmount);
  const coApplicantIncome = step6Active
    ? Number(formData.coApplicantIncome) || 0
    : 0;

  const calculations = calculateLoanDetails({
    loanAmount,
    tenureMonths,
    loanType,
    employmentType,
    monthlyIncome,
    coApplicantIncome,
  });

  const requiredDocuments = [
    ['Aadhaar Front', 'aadhaarFrontFile'],
    ['Aadhaar Back', 'aadhaarBackFile'],
    ['Bank Statement', 'bankStatementFile'],
    ['Photograph', 'photoFile'],
    ...(!formData.panVerified ? [['PAN Card', 'panDocument']] : []),
    ...(employmentType === 'Salaried'
      ? [
          ['Salary Slip 1', 'salarySlip1'],
          ['Salary Slip 2', 'salarySlip2'],
          ['Salary Slip 3', 'salarySlip3'],
        ]
      : []),
    ...(employmentType === 'Self-Employed' ||
    employmentType === 'Business Owner'
      ? [
          ['ITR Year 1', 'itrYear1'],
          ['ITR Year 2', 'itrYear2'],
        ]
      : []),
    ...(loanType === 'Home'
      ? [['Property Documents', 'propertyDocFile']]
      : []),
    ...(loanType === 'Business'
      ? [
          ['Business Registration', 'businessRegFile'],
          ['GST Quarter 1', 'gstQuarter1'],
          ['GST Quarter 2', 'gstQuarter2'],
          ['GST Quarter 3', 'gstQuarter3'],
          ['GST Quarter 4', 'gstQuarter4'],
        ]
      : []),
  ];

  const missingDocuments = requiredDocuments
    .filter(([, field]) => !isUploaded(formData[field]))
    .map(([name]) => name);

  const allDocumentsUploaded = missingDocuments.length === 0;
  const hasESignature = isUploaded(formData.eSignature);

  const allConsents =
    formData.consentAccurate &&
    formData.consentCreditCheck &&
    formData.consentTerms &&
    formData.consentComms;

  const highEmiRequired = !calculations.isAffordable;
  const highEmiConsentSatisfied =
    !highEmiRequired || Boolean(formData.consentHighEmi);

  const canSubmit =
    allConsents &&
    allDocumentsUploaded &&
    hasESignature &&
    highEmiConsentSatisfied;

  const handleSubmit = () => {
    if (!canSubmit) return;

    setSuccessData({
      refNumber: crypto.randomUUID(),
      date: new Date().toLocaleString('en-IN'),
      ...calculations,
      ...formData,
      loanAmount,
      tenureMonths,
      loanType,
    });
  };

  if (successData) {
    return <SuccessModal data={successData} />;
  }

  const reviewRows = [
    [
      '1. Loan Details',
      `${loanType} Loan (${formatINR(loanAmount)})`,
      1,
    ],
    [
      '2. Personal Information',
      formData.fullName || 'Information provided',
      2,
    ],
    [
      '3. KYC & Verification',
      formData.panVerified ? 'PAN Verified' : 'KYC information provided',
      3,
    ],
    [
      '4. Address Details',
      formData.currentCity || formData.city || 'Address provided',
      4,
    ],
    [
      '5. Employment & Income',
      `${employmentType} — ${formatINR(monthlyIncome)} monthly`,
      5,
    ],
    [
      '6. Co-Applicant & Guarantor',
      step6Active
        ? formData.coApplicantName
          ? `${formData.coApplicantName} — ${formatINR(
              coApplicantIncome
            )} monthly`
          : 'Details required'
        : 'Not required for this application',
      6,
    ],
    [
      '7. Documents & E-Signature',
      allDocumentsUploaded && hasESignature
        ? 'All required documents uploaded'
        : `Missing ${missingDocuments.length} document(s)`,
      7,
    ],
  ];}

  

 

