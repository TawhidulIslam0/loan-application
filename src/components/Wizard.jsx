import React, { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import Step1LoanType from '../steps/Step1LoanType';
import { Step2PersonalInfo } from '../steps/Step2PersonalInfo';
import Step3KYC from '../steps/Step3KYC';
import Step4Address from '../steps/Step4Address';
import Step7Documents from '../steps/Step7Documents';

const stepsList = [
  { id: 1, name: 'Loan Details', component: Step1LoanType },
  { id: 2, name: 'Personal Info', component: Step2PersonalInfo },
  { id: 3, name: 'Identity KYC', component: Step3KYC },
  { id: 4, name: 'Address', component: Step4Address },
  { id: 5, name: 'Employment', component: () => <div className="p-6">Step 5 Placeholder</div> },
  { id: 6, name: 'Co-Applicant', component: () => <div className="p-6">Step 6 Placeholder</div> },
  { id: 7, name: 'Documents', component: Step7Documents },
  { id: 8, name: 'Review & Submit', component: () => <div className="p-6">Step 8 Placeholder</div> },
];

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [maxTenure, setMaxTenure] = useState(30);

  const methods = useForm({
    defaultValues: {
      loanType: 'Personal',
      panNumber: '',
      aadhaarNumber: '',
      aadhaarConsent: false,
      currentPin: '',
      currentCity: '',
      currentState: '',
      currentAddressLine1: '',
      residenceType: '',
      rentAmount: '',
      yearsAnAddress: '',
      previousAddress: '',
      sameAsPermanent: false,
      ...formData,
    },
    mode: 'onBlur',
  });

  const totalSteps = stepsList.length;

  const handleNext = async () => {
    // Validate current form fields using React Hook Form trigger
    const isValid = await methods.trigger();
    if (!isValid) {
      return; // Stop progression if validation fails
    }

    const activeForm = document.querySelector('form');
    if (activeForm) {
      const submitBtn = activeForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
      } else {
        activeForm.requestSubmit();
      }
    } else {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('lendswift_draft', JSON.stringify({ ...formData, ...methods.getValues() }));
    alert('Draft saved successfully!');
  };

  // Wrapped in useCallback to stabilize the reference passed to child components
  const handleUpdateFormData = useCallback(async (data) => {
    const isValid = await methods.trigger();
    if (!isValid) return;

    setFormData((prev) => ({ ...prev, ...data }));
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps, methods]);

  // Wrapped in useCallback to prevent infinite render loops with child useEffect hooks
  const handleVerificationChange = useCallback((verificationData) => {
    setFormData((prev) => ({ ...prev, ...verificationData }));
  }, []);

  const CurrentComponent = stepsList[currentStep - 1].component;

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto my-10 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-slate-900">LendSwift Loan Application</h1>
          <p className="text-sm font-medium text-slate-700 mt-1">Complete the steps below to apply for your instant loan.</p>
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} stepsList={stepsList} />

        <div className="p-6 min-h-[300px]">
          <CurrentComponent
            formData={formData}
            updateFormData={handleUpdateFormData}
            setFormData={setFormData}
            maxTenure={maxTenure}
            setMaxTenure={setMaxTenure}
            nextStep={handleNext}
            prevStep={handlePrev}
            onVerificationChange={handleVerificationChange}
          />
        </div>

        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onPrev={handlePrev}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    </FormProvider>
  );
}