import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step7Documents() {
  const { register, watch, formState: { errors } } = useFormContext();
  
  // Check if PAN was successfully verified in Step 3
  const isPanVerified = watch('panVerified');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Document Uploads</h2>
        <p className="text-sm text-slate-600 mt-1">Please upload the required verification documents.</p>
      </div>

      <div className="space-y-4">
        {/* PAN Card Upload Field */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-sm font-medium text-slate-800 mb-1">
            PAN Card Document {isPanVerified ? <span className="text-green-600 font-normal">(Optional - PAN already verified)</span> : <span className="text-red-500">*</span>}
          </label>
          <input
            type="file"
            {...register('panDocument', { 
              required: !isPanVerified ? 'PAN card document is required since PAN was not verified' : false 
            })}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.panDocument && (
            <p className="text-xs text-red-500 mt-1">{errors.panDocument.message}</p>
          )}
        </div>

        {/* Other document uploads can go here */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-sm font-medium text-slate-800 mb-1">
            Identity Proof (Aadhaar / Passport) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            {...register('identityDocument', { required: 'Identity proof is required' })}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.identityDocument && (
            <p className="text-xs text-red-500 mt-1">{errors.identityDocument.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}