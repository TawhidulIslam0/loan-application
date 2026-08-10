import React, { useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createStep1Schema, loanPurposes } from '../schemas/step1Schema';
import { Select } from '../components/common/Select';
import { ErrorMessage } from '../components/common/ErrorMessage';
import PropTypes from 'prop-types';

export default function Step1LoanType({ formData, updateFormData, maxTenure }) {
  const schema = createStep1Schema(maxTenure);

  const localMethods = useForm({
    resolver: zodResolver(schema),
    defaultValues: formData?.loanType ? formData : {
      loanType: 'Personal',
      loanAmount: '',
      tenureMonths: '',
      purpose: loanPurposes['Personal'][0],
    },
    mode: 'onChange',
  });

  const parentMethods = useFormContext();

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = localMethods;

  const selectedLoanType = watch('loanType');
  const watchedLoanAmount = watch('loanAmount');
  const availablePurposes = loanPurposes[selectedLoanType] || [];

  useEffect(() => {
    if (parentMethods) {
      parentMethods.setValue('loanType', selectedLoanType);
      parentMethods.setValue('loanAmount', watchedLoanAmount);
    }
  }, [selectedLoanType, watchedLoanAmount, parentMethods]);

  useEffect(() => {
    if (watch('purpose') && !availablePurposes.includes(watch('purpose'))) {
      setValue('purpose', availablePurposes[0] || '', { shouldValidate: true });
    }
  }, [selectedLoanType, availablePurposes, setValue, watch]);

  const onSubmit = (data) => {
    if (parentMethods) {
      parentMethods.setValue('loanType', data.loanType);
      parentMethods.setValue('loanAmount', data.loanAmount);
    }
    if (updateFormData) {
      updateFormData(data);
    }
  };

  const purposeOptions = availablePurposes.map((p) => ({ label: p, value: p }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
      <button type="submit" className="hidden" aria-hidden="true" />

      <div>
        <h2 className="text-xl font-bold text-gray-800">Step 1: Select Loan Type</h2>
        <p className="text-sm text-gray-600 mb-4">Choose your loan type and amount preference.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Loan Type</label>
        <div className="grid grid-cols-3 gap-4">
          {['Personal', 'Home', 'Business'].map((type) => (
            <label
              key={type}
              className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedLoanType === type ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold' : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                value={type}
                {...register('loanType')}
                className="sr-only"
              />
              {type} Loan
            </label>
          ))}
        </div>
        {errors.loanType && <ErrorMessage message={errors.loanType.message} />}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
          <input
            type="number"
            {...register('loanAmount', { valueAsNumber: true })}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter loan amount"
          />
        </div>
        {errors.loanAmount && <ErrorMessage message={errors.loanAmount.message} />}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (in months)</label>
        <input
          type="number"
          {...register('tenureMonths', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter tenure in months"
        />
        {errors.tenureMonths && <ErrorMessage message={errors.tenureMonths.message} />}
        {maxTenure && (
          <p className="text-xs text-gray-500 mt-1">Max tenure available based on your age: {maxTenure * 12} months</p>
        )}
      </div>

      <div>
        <Select
          label="Loan Purpose"
          name="purpose"
          register={register}
          options={purposeOptions}
          error={errors.purpose?.message}
        />
      </div>
    </form>
  );
}

Step1LoanType.propTypes = {
  formData: PropTypes.object,
  updateFormData: PropTypes.func,
  maxTenure: PropTypes.number,
};