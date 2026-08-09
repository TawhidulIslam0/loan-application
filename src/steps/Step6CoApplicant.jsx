import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';

// Helper to determine if Step 6 is active based on loan type and amount
export const isStep6Active = (loanType, loanAmount) => {
  const amount = Number(loanAmount) || 0;
  const type = (loanType || '').toLowerCase();
  
  if (type.includes('home')) return true;
  if (type.includes('personal') && amount > 500000) return true;
  if (type.includes('business') && amount > 2000000) return true;
  return false;
};

export default function Step6CoApplicant({ loanType, loanAmount }) {
  const { register, watch, formState: { errors } } = useFormContext();
  const active = isStep6Active(loanType, loanAmount);

  if (!active) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        <p>Step 6 (Co-Applicant) is not required for your selected loan type and amount.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6 bg-white shadow-sm rounded-lg">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Step 6: Co-Applicant & Guarantor Details</h2>
        <p className="text-sm text-gray-600">Required based on your loan type and principal amount.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Input 
            label="Co-Applicant Full Name" 
            {...register('coApplicantName', { required: 'Co-applicant name is required' })} 
            placeholder="e.g. Jane Doe" 
          />
          {errors.coApplicantName && <ErrorMessage message={errors.coApplicantName.message} />}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
          <select 
            {...register('relationship', { required: 'Please select a relationship' })} 
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900"
          >
            <option value="">Select Relationship</option>
            <option value="Spouse">Spouse</option>
            <option value="Parent">Parent</option>
            <option value="Sibling">Sibling</option>
            <option value="Business Partner">Business Partner</option>
          </select>
          {errors.relationship && <ErrorMessage message={errors.relationship.message} />}
        </div>

        <div>
          <Input 
            label="Co-Applicant PAN Number" 
            {...register('coApplicantPAN', { 
              required: 'PAN is required',
              pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]$/, message: 'Invalid PAN format' }
            })} 
            placeholder="ABCDE1234P" 
            className="uppercase"
            maxLength={10}
          />
          {errors.coApplicantPAN && <ErrorMessage message={errors.coApplicantPAN.message} />}
        </div>

        <div>
          <Input 
            label="Co-Applicant Monthly Income (₹)" 
            type="number" 
            {...register('coApplicantIncome', { valueAsNumber: true, required: 'Income is required', min: 0 })} 
            placeholder="e.g. 40000" 
          />
          <p className="text-xs text-gray-500 mt-1">Combined with primary income for total EMI affordability calculation.</p>
          {errors.coApplicantIncome && <ErrorMessage message={errors.coApplicantIncome.message} />}
        </div>

        <div className="pt-2 border-t border-gray-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              {...register('consent', { required: 'Consent is required to proceed' })} 
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              I verify that the co-applicant details provided are accurate and consent to credit verification and liability sharing.
            </span>
          </label>
          {errors.consent && <ErrorMessage message={errors.consent.message} />}
        </div>
      </div>
    </div>
  );
}