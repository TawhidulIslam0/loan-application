import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';

export default function Step5Employment({ loanType }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const employmentType = watch('employmentType');

  // Cross-step validation: Business loan cannot have Salaried employment type
  useEffect(() => {
    if (loanType === 'Business' && employmentType === 'Salaried') {
      setValue('employmentType', '');
    }
  }, [loanType, employmentType, setValue]);

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6 bg-white shadow-sm rounded-lg">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Step 5: Employment & Income Details</h2>
        <p className="text-sm text-gray-600">Provide your professional background for affordability underwriting.</p>
      </div>

      {/* Employment Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Employment Type</label>
        <div className="grid grid-cols-3 gap-3">
          {loanType !== 'Business' && (
            <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer text-sm font-medium ${employmentType === 'Salaried' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
              <input type="radio" value="Salaried" {...register('employmentType', { required: 'Please select employment type' })} className="sr-only" />
              Salaried
            </label>
          )}
          <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer text-sm font-medium ${employmentType === 'Self-Employed' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
            <input type="radio" value="Self-Employed" {...register('employmentType', { required: 'Please select employment type' })} className="sr-only" />
            Self-Employed
          </label>
          <label className={`flex items-center justify-center p-3 border rounded-md cursor-pointer text-sm font-medium ${employmentType === 'Business Owner' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}>
            <input type="radio" value="Business Owner" {...register('employmentType', { required: 'Please select employment type' })} className="sr-only" />
            Business Owner
          </label>
        </div>
        {errors.employmentType && <ErrorMessage message={errors.employmentType.message} />}
        {loanType === 'Business' && (
          <p className="text-xs text-amber-600 mt-1">Note: Business loans require Self-Employed or Business Owner status.</p>
        )}
      </div>

      {/* Years of Experience / General Experience */}
      <div>
        <Input
          label="Years of Experience / Practice"
          type="number"
          step="0.5"
          {...register('yearsOfExperience', { valueAsNumber: true, required: 'Required', min: 0, max: 50 })}
          placeholder="e.g. 5"
        />
        {errors.yearsOfExperience && <ErrorMessage message={errors.yearsOfExperience.message} />}
      </div>

      {/* ----------------- SUB-FORM: SALARIED ----------------- */}
      {employmentType === 'Salaried' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200 animate-fadeIn">
          <h3 className="text-sm font-semibold text-gray-700">Salaried Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Company Name" {...register('companyName', { required: 'Company name is required' })} placeholder="e.g. Acme Corp" />
              {errors.companyName && <ErrorMessage message={errors.companyName.message} />}
            </div>
            <div>
              <Input label="Designation" {...register('designation', { required: 'Designation is required' })} placeholder="e.g. Software Engineer" />
              {errors.designation && <ErrorMessage message={errors.designation.message} />}
            </div>
          </div>
          <div>
            <Input label="Monthly Net Salary (₹)" type="number" {...register('monthlyNetSalary', { valueAsNumber: true, required: 'Salary is required', min: { value: 15000, message: 'Minimum ₹15,000 required' } })} placeholder="e.g. 65000" />
            <p className="text-xs text-gray-500 mt-1">Used for maximum EMI affordability check (max 50% ratio).</p>
            {errors.monthlyNetSalary && <ErrorMessage message={errors.monthlyNetSalary.message} />}
          </div>
        </div>
      )}

      {/* ----------------- SUB-FORM: SELF-EMPLOYED / BUSINESS OWNER ----------------- */}
      {(employmentType === 'Self-Employed' || employmentType === 'Business Owner') && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200 animate-fadeIn">
          <h3 className="text-sm font-semibold text-gray-700">Business & Enterprise Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Business Name" {...register('businessName', { required: 'Business name is required' })} placeholder="e.g. Innovate Solutions" />
              {errors.businessName && <ErrorMessage message={errors.businessName.message} />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select {...register('businessType', { required: 'Select business type' })} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900">
                <option value="">Select Type</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Partnership">Partnership</option>
                <option value="Private Limited">Private Limited</option>
                <option value="LLP">LLP</option>
              </select>
              {errors.businessType && <ErrorMessage message={errors.businessType.message} />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input label="Annual Turnover (₹)" type="number" {...register('annualTurnover', { valueAsNumber: true, required: 'Turnover required', min: { value: 300000, message: 'Minimum ₹3,00,000 turnover' } })} placeholder="e.g. 2500000" />
              {errors.annualTurnover && <ErrorMessage message={errors.annualTurnover.message} />}
            </div>
            <div>
              <Input label="Years in Business" type="number" {...register('yearsInBusiness', { valueAsNumber: true, required: 'Years required', min: { value: 2, message: 'Minimum 2 years required' } })} placeholder="e.g. 3" />
              {errors.yearsInBusiness && <ErrorMessage message={errors.yearsInBusiness.message} />}
            </div>
          </div>

          {employmentType === 'Self-Employed' && (
            <div>
              <Input label="Monthly Income (₹)" type="number" {...register('monthlyIncome', { valueAsNumber: true, required: 'Monthly income required', min: { value: 10000, message: 'Minimum ₹10,000 required' } })} placeholder="e.g. 80000" />
              <p className="text-xs text-gray-500 mt-1">Used for EMI affordability ratio check.</p>
              {errors.monthlyIncome && <ErrorMessage message={errors.monthlyIncome.message} />}
            </div>
          )}

          {employmentType === 'Business Owner' && (
            <div>
              <Input label="GST Number" {...register('gstNumber', { required: 'GST number is required for business owners' })} placeholder="22AAAAA0000A1Z5" className="uppercase" maxLength={15} />
              <p className="text-xs text-gray-500 mt-1">15-character regulatory format.</p>
              {errors.gstNumber && <ErrorMessage message={errors.gstNumber.message} />}
            </div>
          )}

          {/* Office Address Block */}
          <div className="pt-2 border-t border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Office / Business Address</h4>
            <Input label="Office Address Line 1" {...register('officeAddress.addressLine1', { required: 'Office address is required' })} placeholder="Building, Street, Area" />
            <div className="grid grid-cols-3 gap-2">
              <Input label="PIN Code" maxLength={6} {...register('officeAddress.pinCode', { required: 'PIN required', pattern: /^\d{6}$/ })} placeholder="110001" />
              <Input label="City" {...register('officeAddress.city', { required: 'City required' })} placeholder="City" />
              <Input label="State" {...register('officeAddress.state', { required: 'State required' })} placeholder="State" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}