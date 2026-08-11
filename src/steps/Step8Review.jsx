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
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-xl font-bold text-slate-900">
          Step 8: Review & Pre-Approval Summary
        </h2>
        <p className="text-sm text-slate-600">
          Please review your information and financial breakdown before final
          submission.
        </p>
      </header>

      {/* Pre-Approval Summary */}
      <section className="space-y-4 rounded-xl border bg-slate-50 p-5">
        <h3 className="border-b pb-2 text-lg font-bold text-slate-900">
          Pre-Approval Summary
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <SummaryItem label="Loan Amount" value={formatINR(loanAmount)} />
          <SummaryItem label="Tenure" value={`${tenureMonths} Months`} />
          <SummaryItem
            label="Indicative Interest Rate"
            value={`${calculations.annualRate}% p.a.`}
          />
          <SummaryItem
            label="Estimated Monthly EMI"
            value={formatINR(calculations.emi)}
            highlight
          />
          <SummaryItem
            label="Total Interest Payable"
            value={formatINR(calculations.totalInterest)}
          />
          <SummaryItem
            label="Total Cost of Borrowing"
            value={formatINR(calculations.totalPayment)}
          />
          <SummaryItem
            label="Processing Fee"
            value={formatINR(calculations.processingFee)}
          />
        </div>

        <div className="space-y-2 border-t pt-3 text-sm">
          <IncomeRow label="Primary Monthly Income" value={monthlyIncome} />

          {step6Active && (
            <IncomeRow
              label="Co-Applicant Income"
              value={coApplicantIncome}
            />
          )}

          <IncomeRow
            label="Combined Monthly Income"
            value={calculations.combinedMonthlyIncome}
          />
          <IncomeRow
            label="Max Allowed EMI (50% limit)"
            value={calculations.maxAllowedEMI}
          />

          <div className="flex justify-between">
            <span className="text-slate-600">EMI-to-Income Ratio:</span>
            <strong
              className={
                calculations.isAffordable
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {calculations.emiToIncomeRatio}%
            </strong>
          </div>
        </div>

        {!calculations.isAffordable && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">⚠️ EMI Affordability Warning</p>
            <p className="mt-1">
              Your estimated EMI exceeds 50% of your combined monthly income.
              You may still proceed, but additional consent is required.
            </p>
          </div>
        )}
      </section>

      {/* Application Summary */}
      <section className="space-y-3">
        <h3 className="font-bold text-slate-900">Application Summary</h3>

        <div className="space-y-2 text-sm">
          {reviewRows.map(([title, value, step]) => (
            <ReviewRow
              key={title}
              title={title}
              value={value}
              onEdit={() => setCurrentStep(step)}
            />
          ))}
        </div>
      </section>

      {/* Missing Documents */}
      {!allDocumentsUploaded && (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="mb-2 font-semibold">Missing mandatory documents</p>

          <ul className="ml-5 list-disc space-y-1">
            {missingDocuments.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setCurrentStep(7)}
            className="mt-3 font-semibold underline"
          >
            Go to Step 7
          </button>
        </section>
      )}

      {/* E-Signature */}
      <section className="space-y-2 border-t pt-4">
        <h3 className="font-bold text-slate-900">Captured E-Signature</h3>

        {hasESignature ? (
          <div className="inline-block rounded border bg-white p-2">
            <img
              src={formData.eSignature}
              alt="Captured E-Signature"
              className="h-20 object-contain"
            />
          </div>
        ) : (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            No signature found. Please complete the e-signature in Step 7.
          </div>
        )}
      </section>

      {/* Consents */}
      <section className="space-y-3 border-t pt-4">
        <h3 className="font-bold text-slate-900">
          Declarations & Consents
        </h3>

        <Consent
          register={register}
          name="consentAccurate"
          text="I confirm all information and documents provided in this application are accurate and true."
        />

        <Consent
          register={register}
          name="consentCreditCheck"
          text="I authorise LendSwift to check my credit score and history via CIBIL/Equifax."
        />

        <Consent
          register={register}
          name="consentTerms"
          text={
            <>
              I agree to the{' '}
              <a
                href={TERMS_AND_CONDITIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline"
              >
                Terms and Conditions
              </a>{' '}
              and privacy policy.
            </>
          }
        />

        <Consent
          register={register}
          name="consentComms"
          text="I consent to receive status updates and communications regarding this loan application via SMS, WhatsApp, and Email."
        />

        {highEmiRequired && (
          <Consent
            register={register}
            name="consentHighEmi"
            text="I acknowledge that my estimated EMI exceeds 50% of my combined monthly income and consent to proceed subject to additional review."
            warning
          />
        )}
      </section>

      {/* Submit */}
      <section className="border-t pt-6">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`w-full rounded-lg py-3 font-bold text-white ${
            canSubmit
              ? 'bg-blue-600 shadow-md hover:bg-blue-700'
              : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          Submit Application
        </button>

        {!canSubmit && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Complete all required consents and mandatory documents before
            submitting.
          </p>
        )}
      </section>
    </div>
  );
}

function SummaryItem({ label, value, highlight = false }) {
  return (
    <div>
      <span className="block text-slate-500">{label}</span>
      <span
        className={`font-semibold ${
          highlight ? 'text-blue-600' : 'text-slate-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function IncomeRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-600">{label}:</span>
      <span className="font-semibold text-slate-900">
        {formatINR(value)}
      </span>
    </div>
  );
}

function ReviewRow({ title, value, onEdit }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-white p-3">
      <div className="min-w-0">
        <span className="font-medium text-slate-900">{title}:</span>{' '}
        <span className="text-slate-700">{value}</span>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 font-semibold text-blue-600 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

function Consent({ register, name, text, warning = false }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg p-1 ${
        warning ? 'border border-amber-300 bg-amber-50 p-3' : ''
      }`}
    >
      <input
        type="checkbox"
        {...register(name)}
        className="mt-1 h-4 w-4 rounded text-blue-600"
      />
      <span className={warning ? 'text-sm text-amber-900' : 'text-sm text-slate-700'}>
        {text}
      </span>
    </label>
  );
}

function SuccessModal({ data }) {
  const rows = [
    ['Application Reference', data.refNumber],
    ['Submitted', data.date],
    ['Loan Type', `${data.loanType} Loan`],
    ['Loan Amount', formatINR(data.loanAmount)],
    ['Tenure', `${data.tenureMonths} months`],
    ['Interest Rate', `${data.annualRate}% p.a.`],
    ['Estimated EMI', `${formatINR(data.emi)} / month`],
    ['Total Interest', formatINR(data.totalInterest)],
    ['Total Cost of Borrowing', formatINR(data.totalPayment)],
    ['Processing Fee', formatINR(data.processingFee)],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-600">
            ✓
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Application Submitted!
          </h2>

          <p className="text-sm text-slate-600">
            Your loan application has been successfully received.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border bg-slate-50 p-4 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-slate-500">{label}:</span>
              <span className="break-all text-right font-semibold text-slate-900">
                {value}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500">
          This is an indicative pre-approval summary. Final approval and terms
          are subject to verification and lender assessment.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Start New Application
        </button>
      </div>
    </div>
  );
}

