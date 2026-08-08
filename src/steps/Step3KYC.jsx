import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { MaskedInput } from '../components/common/MaskedInput';
import { Checkbox } from '../components/common/Checkbox';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useVerification } from '../hooks/useVerification';
import { validatePAN, validateAadhaar } from '../utils/validators';

export default function Step3KYC({ onVerificationChange }) {
  const { control, watch, formState: { errors } } = useFormContext();

  const loanType = watch('loanType') || 'Personal';
  const loanAmount = watch('loanAmount') || 0;
  const panValue = watch('panNumber');
  const aadhaarValue = watch('aadhaarNumber');

  // Conditional logic for Passport: Shown if Home Loan > 50L (5,000,000)
  const showPassport = loanType === 'Home' && Number(loanAmount) > 5000000;

  const panVerification = useVerification();
  const aadhaarVerification = useVerification();

  useEffect(() => {
    if (onVerificationChange) {
      onVerificationChange({ panVerified: panVerification.isVerified });
    }
  }, [panVerification.isVerified, onVerificationChange]);

  const handlePanBlur = async () => {
    if (panValue) {
      const result = validatePAN(panValue, loanType);
      if (result.isValid) {
        await panVerification.verify(panValue, 'PAN', loanType);
      }
    }
  };

  const handleAadhaarBlur = async () => {
    if (aadhaarValue) {
      const result = validateAadhaar(aadhaarValue);
      if (result.isValid) {
        await aadhaarVerification.verify(aadhaarValue, 'Aadhaar');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto p-4 bg-white shadow-sm rounded-lg">
      <h2 className="text-xl font-bold text-gray-800">Step 3: Identity Verification (KYC)</h2>
      <p className="text-sm text-gray-600">Please provide your PAN and Aadhaar details for instant regulatory verification.</p>

      {/* PAN Field */}
      <div className="space-y-1 relative">
        <div className="flex items-center gap-2">
          <Controller
            name="panNumber"
            control={control}
            rules={{
              required: 'PAN is required',
              validate: (val) => {
                const res = validatePAN(val, loanType);
                return res.isValid || res.error;
              },
            }}
            render={({ field }) => (
              <MaskedInput
                {...field}
                label="PAN Number"
                type="pan"
                placeholder="ABCDE1234P"
                onBlur={async () => {
                  field.onBlur();
                  await handlePanBlur();
                }}
                maxLength={10}
                error={errors.panNumber?.message}
                className="uppercase flex-1 border rounded-md p-2"
              />
            )}
          />
          {panVerification.isVerifying && (
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mt-6" />
          )}
          {panVerification.isVerified && (
            <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-1 rounded mt-6">✓ Verified</span>
          )}
        </div>
        {panVerification.error && <ErrorMessage message={panVerification.error} />}
      </div>

      {/* Aadhaar Field */}
      <div className="space-y-1 relative">
        <div className="flex items-center gap-2">
          <Controller
            name="aadhaarNumber"
            control={control}
            rules={{
              required: 'Aadhaar is required',
              validate: (val) => {
                const res = validateAadhaar(val);
                return res.isValid || res.error;
              },
            }}
            render={({ field }) => (
              <MaskedInput
                {...field}
                label="Aadhaar Number"
                type="aadhaar"
                placeholder="XXXX XXXX 1234"
                onBlur={async () => {
                  field.onBlur();
                  await handleAadhaarBlur();
                }}
                maxLength={12}
                error={errors.aadhaarNumber?.message}
                className="flex-1 border rounded-md p-2"
              />
            )}
          />
          {aadhaarVerification.isVerifying && (
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mt-6" />
          )}
          {aadhaarVerification.isVerified && (
            <span className="text-green-600 font-semibold text-sm bg-green-50 px-2 py-1 rounded mt-6">✓ Verified</span>
          )}
        </div>
        {aadhaarVerification.error && <ErrorMessage message={aadhaarVerification.error} />}
      </div>

      {/* Voter ID (Optional) */}
      <div className="space-y-1">
        <Controller
          name="voterId"
          control={control}
          rules={{
            pattern: {
              value: /^[A-Z]{3}\d{7}$/,
              message: 'Voter ID must be 3 letters followed by 7 digits (e.g., ABC1234567)',
            },
          }}
          render={({ field }) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID (Optional)</label>
              <input
                type="text"
                {...field}
                maxLength={10}
                placeholder="ABC1234567"
                className="w-full uppercase px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        />
        {errors.voterId && <ErrorMessage message={errors.voterId.message} />}
      </div>

      {/* Passport (Conditional: Home Loan > 50L) */}
      {showPassport && (
        <div className="space-y-1 animate-fadeIn">
          <Controller
            name="passportNumber"
            control={control}
            rules={{
              required: showPassport ? 'Passport number is required for Home Loans above 50L' : false,
              pattern: {
                value: /^[A-Z]\d{7}$/,
                message: 'Passport must be 1 letter followed by 7 digits (e.g., A1234567)',
              },
            }}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passport Number (Required for Home Loan &gt; ₹50,00,000)
                </label>
                <input
                  type="text"
                  {...field}
                  maxLength={8}
                  placeholder="A1234567"
                  className="w-full uppercase px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          />
          {errors.passportNumber && <ErrorMessage message={errors.passportNumber.message} />}
        </div>
      )}

      {/* Regulatory Aadhaar Consent Checkbox */}
      <div className="pt-2 border-t border-gray-100">
        <Controller
          name="aadhaarConsent"
          control={control}
          rules={{ required: 'You must provide Aadhaar consent to proceed' }}
          render={({ field: { value, onChange, ...field } }) => (
            <Checkbox
              {...field}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              label="I hereby give my explicit consent to LendSwift to fetch and verify my Aadhaar data from UIDAI for identity authentication purposes in compliance with RBI guidelines."
            />
          )}
        />
        {errors.aadhaarConsent && <ErrorMessage message={errors.aadhaarConsent.message} />}
      </div>
    </div>
  );
}