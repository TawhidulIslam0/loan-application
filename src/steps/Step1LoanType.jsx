import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { loanPurposes } from '../schemas/step1Schema';
import { Select } from '../components/common/Select';
import { ErrorMessage } from '../components/common/ErrorMessage';
import PropTypes from 'prop-types';

export default function Step1LoanType({ maxTenure }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedLoanType = watch('loanType');
  const watchedPurpose = watch('purpose');

  const availablePurposes = loanPurposes[selectedLoanType] || [];

  useEffect(() => {
    if (
      watchedPurpose &&
      !availablePurposes.includes(watchedPurpose)
    ) {
      setValue('purpose', '', {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  }, [
    selectedLoanType,
    watchedPurpose,
    availablePurposes,
    setValue,
  ]);

  const purposeOptions = availablePurposes.map((purpose) => ({
    label: purpose,
    value: purpose,
  }));

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Step 1: Select Loan Type
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Choose your loan type and amount preference.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Type
        </label>

        <div className="grid grid-cols-3 gap-4">
          {['Personal', 'Home', 'Business'].map((type) => (
            <label
              key={type}
              className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                selectedLoanType === type
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-300 hover:bg-gray-50'
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

        {errors.loanType && (
          <ErrorMessage message={errors.loanType.message} />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Loan Amount (₹)
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            ₹
          </span>

          <input
            type="number"
            {...register('loanAmount', {
              valueAsNumber: true,
            })}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter loan amount"
          />
        </div>

        {errors.loanAmount && (
          <ErrorMessage message={errors.loanAmount.message} />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tenure (in months)
        </label>

        <input
          type="number"
          {...register('tenureMonths', {
            valueAsNumber: true,
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter tenure in months"
        />

        {errors.tenureMonths && (
          <ErrorMessage message={errors.tenureMonths.message} />
        )}

        {maxTenure && (
          <p className="text-xs text-gray-500 mt-1">
            Max tenure available based on your age:{' '}
            {maxTenure * 12} months
          </p>
        )}
      </div>

      <div>
        <Select
          label="Loan Purpose"
          options={[
            {
              label: 'Select loan purpose',
              value: '',
            },
            ...purposeOptions,
          ]}
          error={errors.purpose?.message}
          {...register('purpose')}
        />
      </div>
    </div>
  );
}

Step1LoanType.propTypes = {
  maxTenure: PropTypes.number,
};