import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import Step1LoanType from '../steps/Step1LoanType';
import { Step2PersonalInfo } from '../steps/Step2PersonalInfo';
import Step3KYC from '../steps/Step3KYC';
import Step4Address from '../steps/Step4Address';
import Step5Employment from '../steps/Step5Employment';
import Step6CoApplicant, { isStep6Active } from '../steps/Step6CoApplicant';
import Step7Documents from '../steps/Step7Documents';
import Step8Review from '../steps/Step8Review';
import { useAutoSave } from '../hooks/useAutoSave';
import { decryptData } from '../utils/encryption';

const baseStepsList = [
  { id: 1, name: 'Loan Details', component: Step1LoanType },
  { id: 2, name: 'Personal Info', component: Step2PersonalInfo },
  { id: 3, name: 'Identity KYC', component: Step3KYC },
  { id: 4, name: 'Address', component: Step4Address },
  { id: 5, name: 'Employment', component: Step5Employment },
  { id: 6, name: 'Co-Applicant', component: Step6CoApplicant },
  { id: 7, name: 'Documents', component: Step7Documents },
  { id: 8, name: 'Review & Submit', component: Step8Review },
];

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [maxTenure, setMaxTenure] = useState(30);
  const [isLoaded, setIsLoaded] = useState(false);

  const methods = useForm({
    defaultValues: {
      loanType: 'Personal',
      loanAmount: '',
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

  // Watch loanType and loanAmount to determine if Step 6 is active dynamically
  const watchedLoanType = methods.watch('loanType');
  const watchedLoanAmount = methods.watch('loanAmount');
  const showCoApplicant = isStep6Active(watchedLoanType, watchedLoanAmount);

  // Filter steps list based on conditional Step 6 visibility
  const stepsList = baseStepsList.filter((step) => {
    if (step.id === 6 && !showCoApplicant) return false;
    return true;
  });

  const totalSteps = stepsList.length;

  // Load encrypted draft on mount
  useEffect(() => {
    async function loadDraft() {
      const encryptedDraft = localStorage.getItem('lend_swift_draft');
      if (encryptedDraft) {
        const decrypted = await decryptData(encryptedDraft);
        if (decrypted && decrypted.data) {
          if (window.confirm('An existing loan application draft was found. Would you like to resume?')) {
            setFormData(decrypted.data);
            methods.reset(decrypted.data);
            if (decrypted.step) setCurrentStep(decrypted.step);
          }
        }
      }
      setIsLoaded(true);
    }
    loadDraft();
  }, [methods]);

  // Wire auto-save hook (every 30s)
  useAutoSave(methods.getValues(), currentStep);

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (!isValid) return;

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

  const handleSaveDraft = async () => {
    const currentValues = methods.getValues();
    const payload = { step: currentStep, data: currentValues, timestamp: new Date().toISOString() };
    const { encryptData } = await import('../utils/encryption');
    const encrypted = await encryptData(payload);
    if (encrypted) {
      localStorage.setItem('lend_swift_draft', encrypted);
      alert('Draft saved successfully with encryption!');
    }
  };

  const handleUpdateFormData = useCallback(async (data) => {
    const isValid = await methods.trigger();
    if (!isValid) return;

    setFormData((prev) => ({ ...prev, ...data }));
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps, methods]);

  const handleVerificationChange = useCallback((verificationData) => {
    setFormData((prev) => ({ ...prev, ...verificationData }));
  }, []);

  if (!isLoaded) return null;

  const CurrentComponent = stepsList[currentStep - 1]?.component || Step1LoanType;

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
            loanType={watchedLoanType}
            loanAmount={watchedLoanAmount}
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