import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Step8Review() {
  const { watch } = useFormContext();
  
  // Check both possible income fields depending on employment type
  const monthlyIncome = Number(watch('monthlyIncome') || watch('monthlyNetSalary')) || 0;
  const estimatedEMI = 15000; // Sample calculated EMI (or pull from loan calculator state)
  const maxAllowedEMI = monthlyIncome * 0.5;
  const isAffordable = estimatedEMI <= maxAllowedEMI;

  return (
    <div className="space-y-6 max-w-xl mx-auto p-6 bg-white shadow-sm rounded-lg">
      <h2 className="text-xl font-bold text-slate-900">Review & Submit</h2>
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Monthly Income:</span>
          <span className="font-semibold text-slate-900">₹{monthlyIncome.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Estimated Monthly EMI:</span>
          <span className="font-semibold text-slate-900">₹{estimatedEMI.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
          <span className="text-slate-600">Max Allowed EMI (50% rule):</span>
          <span className="font-semibold text-slate-900">₹{maxAllowedEMI.toLocaleString()}</span>
        </div>
        {!isAffordable && monthlyIncome > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            ⚠️ Warning: Estimated EMI exceeds 50% of monthly income.
          </div>
        )}
      </div>
    </div>
  );
}