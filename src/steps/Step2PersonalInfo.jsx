import React from 'react';
import { useFormContext } from 'react-hook-form';
import { calculateAge } from '../schemas/step2Schema';
import { Select } from '../components/common/Select';
import { ErrorMessage } from '../components/common/ErrorMessage';

export function Step2PersonalInfo() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const dobValue = watch('dob');

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-800">
          Step 2: Personal Information
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Please enter your personal details.
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name (as per PAN)
        </label>

        <input
          type="text"
          {...register('fullName')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter full name"
        />

        {errors.fullName && (
          <ErrorMessage message={errors.fullName.message} />
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Birth
        </label>

        <input
          type="date"
          {...register('dob')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {errors.dob && (
          <ErrorMessage message={errors.dob.message} />
        )}

        {dobValue && !errors.dob && (
          <p className="text-xs text-gray-500 mt-1">
            Calculated Age: {calculateAge(dobValue)} years
          </p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender
        </label>

        <div className="flex space-x-6">
          {['Male', 'Female', 'Other'].map((gender) => (
            <label
              key={gender}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                value={gender}
                {...register('gender')}
                className="text-blue-600 focus:ring-blue-500"
              />

              <span>{gender}</span>
            </label>
          ))}
        </div>

        {errors.gender && (
          <ErrorMessage message={errors.gender.message} />
        )}
      </div>

      {/* Marital Status */}
      <div>
        <Select
          label="Marital Status"
          options={[
            {
              label: 'Select Marital Status',
              value: '',
            },
            {
              label: 'Single',
              value: 'Single',
            },
            {
              label: 'Married',
              value: 'Married',
            },
            {
              label: 'Divorced',
              value: 'Divorced',
            },
            {
              label: 'Widowed',
              value: 'Widowed',
            },
          ]}
          error={errors.maritalStatus?.message}
          {...register('maritalStatus')}
        />
      </div>

      {/* Father's Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Father's Name
        </label>

        <input
          type="text"
          {...register('fatherName')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter father's name"
        />

        {errors.fatherName && (
          <ErrorMessage message={errors.fatherName.message} />
        )}
      </div>

      {/* Mother's Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mother's Name
        </label>

        <input
          type="text"
          {...register('motherName')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter mother's name"
        />

        {errors.motherName && (
          <ErrorMessage message={errors.motherName.message} />
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>

        <input
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="name@example.com"
        />

        {errors.email && (
          <ErrorMessage message={errors.email.message} />
        )}
      </div>

      {/* Mobile Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mobile Number
        </label>

        <input
          type="text"
          maxLength={10}
          {...register('mobileNumber')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="10-digit mobile number"
        />

        {errors.mobileNumber && (
          <ErrorMessage message={errors.mobileNumber.message} />
        )}
      </div>

      {/* Alternate Mobile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alternate Mobile Number (Optional)
        </label>

        <input
          type="text"
          maxLength={10}
          {...register('alternateMobile')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Alternate 10-digit number"
        />

        {errors.alternateMobile && (
          <ErrorMessage message={errors.alternateMobile.message} />
        )}
      </div>
    </div>
  );
}