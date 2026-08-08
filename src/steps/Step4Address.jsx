import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '../components/common/Input';
import { Checkbox } from '../components/common/Checkbox';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { usePinCodeLookup } from '../hooks/usePinCodeLookup';

export default function Step4Address() {
  const { register, watch, setValue, clearErrors, formState: { errors } } = useFormContext();
  const { lookupPinCode, isLoading } = usePinCodeLookup();

  const currentPin = watch('currentPin');
  const residenceType = watch('residenceType');
  const yearsAnAddress = watch('yearsAnAddress');
  const sameAsPermanent = watch('sameAsPermanent');
  const currentState = watch('currentState');

  const [autoDetectedState, setAutoDetectedState] = useState('');
  const [stateMismatchWarning, setStateMismatchWarning] = useState(false);

  // PIN Code auto-fill effect with robust handling
  useEffect(() => {
    let isMounted = true;
    async function handlePinLookup() {
      if (currentPin && currentPin.length === 6) {
        try {
          const result = await lookupPinCode(currentPin);
          if (isMounted && result && !result.error) {
            setValue('currentCity', result.city || '', { shouldValidate: true, shouldDirty: true });
            setValue('currentState', result.state || '', { shouldValidate: true, shouldDirty: true });
            setAutoDetectedState(result.state || '');
            clearErrors(['currentCity', 'currentState']);
          }
        } catch (err) {
          console.error("PIN lookup failed:", err);
        }
      }
    }
    handlePinLookup();
    return () => { isMounted = false; };
  }, [currentPin, lookupPinCode, setValue, clearErrors]);

  // State-PIN code cross-validation warning
  useEffect(() => {
    if (autoDetectedState && currentState) {
      if (autoDetectedState.trim().toLowerCase() !== currentState.trim().toLowerCase()) {
        setStateMismatchWarning(true);
      } else {
        setStateMismatchWarning(false);
      }
    } else {
      setStateMismatchWarning(false);
    }
  }, [currentState, autoDetectedState]);

  // 'Same as permanent address' field copying logic
  useEffect(() => {
    if (sameAsPermanent) {
      setValue('permanentAddressLine1', watch('currentAddressLine1'), { shouldValidate: true });
      setValue('permanentPin', currentPin, { shouldValidate: true });
      setValue('permanentCity', watch('currentCity'), { shouldValidate: true });
      setValue('permanentState', currentState, { shouldValidate: true });
    }
  }, [sameAsPermanent, currentPin, currentState, setValue, watch]);

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6 bg-white shadow-sm rounded-lg">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Step 4: Address Details</h2>
        <p className="text-sm text-gray-600">Provide your current residential information and history.</p>
      </div>

      {/* Current Address Line 1 */}
      <div>
        <Input
          label="Current Address Line 1"
          {...register('currentAddressLine1', { required: 'Address is required' })}
          placeholder="House No., Street Name, Area"
        />
        {errors.currentAddressLine1 && <ErrorMessage message={errors.currentAddressLine1.message} />}
      </div>

      {/* Current Address Line 2 (Optional) */}
      <div>
        <Input
          label="Current Address Line 2 (Optional)"
          {...register('currentAddressLine2')}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </div>

      {/* PIN Code & City Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="PIN Code"
            maxLength={6}
            {...register('currentPin', { 
              required: 'PIN code is required', 
              pattern: { value: /^\d{6}$/, message: 'Must be exactly 6 digits' } 
            })}
            placeholder="e.g. 110001"
          />
          {isLoading && <p className="text-xs text-blue-500 mt-1">Fetching location details...</p>}
          {errors.currentPin && <ErrorMessage message={errors.currentPin.message} />}
        </div>
        <div>
          <Input
            label="City"
            {...register('currentCity', { required: 'City is required' })}
            placeholder="Enter or auto-filled via PIN"
          />
          {errors.currentCity && <ErrorMessage message={errors.currentCity.message} />}
        </div>
      </div>

      {/* State Input with Cross-Validation Warning */}
      <div>
        <Input
          label="State"
          {...register('currentState', { required: 'State is required' })}
          placeholder="Enter or auto-filled via PIN"
        />
        {stateMismatchWarning && (
          <p className="text-xs text-amber-600 font-medium mt-1">
            Warning: The state you entered does not match the auto-detected PIN location state ({autoDetectedState}).
          </p>
        )}
        {errors.currentState && <ErrorMessage message={errors.currentState.message} />}
      </div>

      {/* Residence Type & Conditional Rent Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Residence Type</label>
          <select
            {...register('residenceType', { required: 'Please select residence type' })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Select Type</option>
            <option value="Owned">Owned</option>
            <option value="Rented">Rented</option>
            <option value="Company">Company</option>
            <option value="Family">Family</option>
          </select>
          {errors.residenceType && <ErrorMessage message={errors.residenceType.message} />}
        </div>

        {residenceType === 'Rented' && (
          <div>
            <Input
              label="Monthly Rent Amount (₹)"
              type="number"
              {...register('rentAmount', { required: 'Rent amount is required for rented homes' })}
              placeholder="e.g. 15000"
            />
            {errors.rentAmount && <ErrorMessage message={errors.rentAmount.message} />}
          </div>
        )}
      </div>

      {/* Years at Address & Conditional Previous Address Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Years at Current Address</label>
        <select
          {...register('yearsAnAddress', { required: 'Please specify duration' })}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Select duration</option>
          <option value="lt1">Less than 1 year</option>
          <option value="1to3">1 - 3 years</option>
          <option value="3plus">3+ years</option>
        </select>
        {errors.yearsAnAddress && <ErrorMessage message={errors.yearsAnAddress.message} />}
      </div>

      {yearsAnAddress === 'lt1' && (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Previous Address Details</h3>
          <Input
            label="Previous Address Line 1"
            {...register('previousAddress', { required: 'Previous address is required since duration is under 1 year' })}
            placeholder="Full previous residential address"
          />
          {errors.previousAddress && <ErrorMessage message={errors.previousAddress.message} />}
        </div>
      )}

      {/* Same as Permanent Address Checkbox */}
      <div className="pt-3 border-t border-gray-100">
        <Checkbox
          {...register('sameAsPermanent')}
          label="Permanent address is same as current address"
        />
      </div>

      {/* Conditional: Permanent Address Fields if Unchecked */}
      {!sameAsPermanent && (
        <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Permanent Address Details</h3>
          <Input
            label="Permanent Address Line 1"
            {...register('permanentAddressLine1', { required: 'Permanent address is required' })}
            placeholder="House No., Street Name, Area"
          />
          {errors.permanentAddressLine1 && <ErrorMessage message={errors.permanentAddressLine1.message} />}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Permanent PIN Code"
              maxLength={6}
              {...register('permanentPin', { required: 'Permanent PIN code is required' })}
              placeholder="e.g. 110001"
            />
            <Input
              label="Permanent City"
              {...register('permanentCity', { required: 'Permanent city is required' })}
              placeholder="City"
            />
          </div>
          <Input
            label="Permanent State"
            {...register('permanentState', { required: 'Permanent state is required' })}
            placeholder="State"
          />
        </div>
      )}
    </div>
  );
}