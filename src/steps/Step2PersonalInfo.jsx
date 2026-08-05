import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema, calculateAge } from '../schemas/step2Schema';
import { Select } from "../components/common/Select";
import { ErrorMessage } from "../components/common/ErrorMessage";
import PropTypes from 'prop-types';

export function Step2PersonalInfo({ formData, updateFormData, nextStep, prevStep, setMaxTenure }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: formData?.fullName ? formData : {
      fullName: '',
      dob: '',
      gender: '',
      maritalStatus: '',
      email: '',
      mobileNumber: '',
      alternateMobile: '',
    },
  });


  const dobValue = watch('dob');


  const onSubmit = (data) => {
    if (data.dob) {
      const age = calculateAge(data.dob);
      const calculatedMaxTenureYears = Math.max(1, 65 - age);
      if (setMaxTenure) {
        setMaxTenure(calculatedMaxTenureYears);
      }
    }
    if (updateFormData) updateFormData(data);
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl mx-auto">
      {/* Hidden submit button so Wizard's query selector targets this form safely */}
      <button type="submit" className="hidden" aria-hidden="true" />


      <div>
        <h2 className="text-xl font-bold text-gray-800">Step 2: Personal Information</h2>
        <p className="text-sm text-gray-600 mb-4">Please enter your personal details.</p>
      </div>


      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          {...register('fullName')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.fullName && <ErrorMessage message={errors.fullName.message} />}
      </div>


      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          {...register('dob')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.dob && <ErrorMessage message={errors.dob.message} />}
        {dobValue && !errors.dob && (
          <p className="text-xs text-gray-500 mt-1">Calculated Age: {calculateAge(dobValue)} years</p>
        )}
      </div>


      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
        <div className="flex space-x-6">
          {['Male', 'Female', 'Other'].map((g) => (
            <label key={g} className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value={g} {...register('gender')} className="text-blue-600 focus:ring-blue-500" />
              <span>{g}</span>
            </label>
          ))}
        </div>
        {errors.gender && <ErrorMessage message={errors.gender.message} />}
      </div>


      {/* Marital Status */}
      <div>
        <Select
          label="Marital Status"
          options={[
            { label: 'Select Marital Status', value: '' },
            { label: 'Single', value: 'Single' },
            { label: 'Married', value: 'Married' },
            { label: 'Divorced', value: 'Divorced' },
            { label: 'Widowed', value: 'Widowed' },
          ]}
          error={errors.maritalStatus?.message}
          {...register('maritalStatus')}
        />
      </div>


      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && <ErrorMessage message={errors.email.message} />}
      </div>


      {/* Mobile Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
        <input
          type="text"
          maxLength={10}
          {...register('mobileNumber')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.mobileNumber && <ErrorMessage message={errors.mobileNumber.message} />}
      </div>


      {/* Alternate Mobile Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile Number (Optional)</label>
        <input
          type="text"
          maxLength={10}
          {...register('alternateMobile')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.alternateMobile && <ErrorMessage message={errors.alternateMobile.message} />}
      </div>
    </form>
  );
}


Step2PersonalInfo.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func,
  prevStep: PropTypes.func,
  setMaxTenure: PropTypes.func,
};
