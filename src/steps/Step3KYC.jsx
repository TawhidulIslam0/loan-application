import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { MaskedInput } from '../components/common/MaskedInput';
import { Checkbox } from '../components/common/Checkbox';
import { ErrorMessage } from "../components/common/ErrorMessage";
import { useVerification } from '../hooks/useVerification';

export default function Step3KYC({ onVerificationChange }) {
  const { control, watch, formState: { errors } } = useFormContext();
  
  const loanType = watch('loanType') || 'Personal';
  const panValue = watch('panNumber');
  const aadhaarValue = watch('aadhaarNumber');

  const panVerification = useVerification();
  const aadhaarVerification = useVerification();

  useEffect(() => {
    if (onVerificationChange) {
      onVerificationChange({ panVerified: panVerification.isVerified });
    }
  }, [panVerification.isVerified, onVerificationChange]);

  const handlePanBlur = async () => {
    if (panValue) {
      await panVerification.verify(panValue, 'PAN', loanType);
    }
  };

  const handleAadhaarBlur = async () => {
    if (aadhaarValue) {
      await aadhaarVerification.verify(aadhaarValue, 'Aadhaar');
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
            rules={{ required: 'PAN is required' }}
            render={({ field }) => (
              <MaskedInput
                {...field}
                label="PAN Number"
                type="pan"
                placeholder="ABCDE1234F"
                onBlur={async (e) => {
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
            rules={{ required: 'Aadhaar is required' }}
            render={({ field }) => (
              <MaskedInput
                {...field}
                label="Aadhaar Number"
                type="aadhaar"
                placeholder="XXXX XXXX 1234"
                onBlur={async (e) => {
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

      {/* Regulatory Aadhaar Consent Checkbox */}
      <div className="pt-2 border-t border-gray-100">
        <Controller
          name="aadhaarConsent"
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