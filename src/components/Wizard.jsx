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
import { createStep1Schema } from '../schemas/step1Schema';
import { step2Schema } from '../schemas/step2Schema';

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

const defaultFormValues = {
  loanType: '',
  loanAmount: '',
  tenureMonths: '',
  purpose: '',

  fullName: '',
  dob: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobileNumber: '',
  alternateMobile: '',

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
};

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxTenure, setMaxTenure] = useState(30);
  const [isLoaded, setIsLoaded] = useState(false);

  const methods = useForm({
    defaultValues: defaultFormValues,
    mode: 'onBlur',
  });

  const watchedLoanType = methods.watch('loanType');
  const watchedLoanAmount = methods.watch('loanAmount');
  const watchedFormData = methods.watch();

  const showCoApplicant = isStep6Active(
    watchedLoanType,
    watchedLoanAmount
  );

  const stepsList = baseStepsList.filter((step) => {
    if (step.id === 6 && !showCoApplicant) {
      return false;
    }

    return true;
  });

  const totalSteps = stepsList.length;

  const currentStepId = stepsList[currentStep - 1]?.id || 1;

  useEffect(() => {
    if (currentStep > totalSteps) {
      setCurrentStep(totalSteps);
    }
  }, [currentStep, totalSteps]);

  useEffect(() => {
    let mounted = true;

    async function loadDraft() {
      try {
        const encryptedDraft = localStorage.getItem('lend_swift_draft');

        if (!encryptedDraft) {
          if (mounted) {
            setIsLoaded(true);
          }
          return;
        }

        const decrypted = await decryptData(encryptedDraft);

        if (!mounted) {
          return;
        }

        if (!decrypted?.data) {
          setIsLoaded(true);
          return;
        }

        const shouldResume = window.confirm(
          'An existing loan application draft was found. Would you like to resume?'
        );

        if (!shouldResume) {
          localStorage.removeItem('lend_swift_draft');
          setIsLoaded(true);
          return;
        }

        const restoredData = {
          ...defaultFormValues,
          ...decrypted.data,
        };

        methods.reset(restoredData);

        const savedStepId = Number(
          decrypted.stepId ?? decrypted.step
        );

        if (
          Number.isInteger(savedStepId) &&
          savedStepId >= 1 &&
          savedStepId <= baseStepsList.length
        ) {
          const restoredStepIndex = baseStepsList.findIndex(
            (step) => step.id === savedStepId
          );

          if (restoredStepIndex !== -1) {
            const visibleStepIndex = stepsList.findIndex(
              (step) => step.id === savedStepId
            );

            if (visibleStepIndex !== -1) {
              setCurrentStep(visibleStepIndex + 1);
            } else {
              const fallbackIndex = stepsList.findIndex(
                (step) => step.id === 8
              );

              setCurrentStep(
                fallbackIndex !== -1 ? fallbackIndex + 1 : 1
              );
            }
          }
        }
      } catch (error) {
        console.error('Failed to load loan draft:', error);
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }

    loadDraft();

    return () => {
      mounted = false;
    };
  }, [methods]);

  useAutoSave(watchedFormData, currentStepId);

  const handleNext = async () => {
    if (currentStepId === 1) {
      const values = methods.getValues();
      const result = createStep1Schema().safeParse(values);

      if (!result.success) {
        methods.clearErrors();

        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0];

          if (fieldName) {
            methods.setError(fieldName, {
              type: 'manual',
              message: issue.message,
            });
          }
        });

        return;
      }

      methods.clearErrors();
    }

    if (currentStepId === 2) {
      const values = methods.getValues();
      const result = step2Schema.safeParse(values);

      if (!result.success) {
        methods.clearErrors();

        result.error.issues.forEach((issue) => {
          const fieldName = issue.path[0];

          if (fieldName) {
            methods.setError(fieldName, {
              type: 'manual',
              message: issue.message,
            });
          }
        });

        return;
      }

      if (values.dob) {
        const dob = new Date(values.dob);
        const today = new Date();

        let age =
          today.getFullYear() -
          dob.getFullYear();

        const monthDifference =
          today.getMonth() -
          dob.getMonth();

        if (
          monthDifference < 0 ||
          (
            monthDifference === 0 &&
            today.getDate() < dob.getDate()
          )
        ) {
          age--;
        }

        setMaxTenure(Math.max(1, 65 - age));
      }

      methods.clearErrors();
    }

    const isValid = await methods.trigger();

    if (!isValid) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleEditStep = (targetStepId) => {
    const targetIndex = stepsList.findIndex(
      (step) => step.id === targetStepId
    );

    if (targetIndex !== -1) {
      setCurrentStep(targetIndex + 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const currentValues = methods.getValues();

      const payload = {
        stepId: currentStepId,
        data: currentValues,
        timestamp: new Date().toISOString(),
      };

      const { encryptData } = await import('../utils/encryption');
      const encrypted = await encryptData(payload);

      if (encrypted) {
        localStorage.setItem('lend_swift_draft', encrypted);
        alert('Draft saved successfully with encryption!');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleUpdateFormData = useCallback(
    async (data) => {
      Object.entries(data).forEach(([key, value]) => {
        methods.setValue(key, value, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });

      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    },
    [currentStep, totalSteps, methods]
  );

  const handleVerificationChange = useCallback(
    (verificationData) => {
      Object.entries(verificationData).forEach(([key, value]) => {
        methods.setValue(key, value, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });
    },
    [methods]
  );

  if (!isLoaded) {
    return null;
  }

  const CurrentComponent =
    stepsList[currentStep - 1]?.component || Step1LoanType;

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto my-10 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-white border-b border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-slate-900">
            LendSwift Loan Application
          </h1>

          <p className="text-sm font-medium text-slate-700 mt-1">
            Complete the steps below to apply for your instant loan.
          </p>
        </div>

        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepsList={stepsList}
        />

        <div className="p-6 min-h-[300px]">
          <CurrentComponent
            formData={methods.getValues()}
            updateFormData={handleUpdateFormData}
            setFormData={() => {}}
            maxTenure={maxTenure}
            setMaxTenure={setMaxTenure}
            nextStep={handleNext}
            prevStep={handlePrev}
            onVerificationChange={handleVerificationChange}
            loanType={watchedLoanType}
            loanAmount={watchedLoanAmount}
            editStep={handleEditStep}
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