import { useState } from 'react';
import ProgressBar from './ProgressBar';
import StepNavigation from './StepNavigation';
import Step1 from '../steps/Step1';
import Step2 from '../steps/Step2';
import Step3 from '../steps/Step3';

const stepsList = [
  { id: 1, name: 'Loan Details', component: Step1 },
  { id: 2, name: 'Personal Info', component: Step2 },
  { id: 3, name: 'Identity KYC', component: Step3 },
  { id: 4, name: 'Address', component: () => <div className="p-6">Step 4 Placeholder</div> },
  { id: 5, name: 'Employment', component: () => <div className="p-6">Step 5 Placeholder</div> },
  { id: 6, name: 'Co-Applicant', component: () => <div className="p-6">Step 6 Placeholder</div> },
  { id: 7, name: 'Documents', component: () => <div className="p-6">Step 7 Placeholder</div> },
  { id: 8, name: 'Review & Submit', component: () => <div className="p-6">Step 8 Placeholder</div> },
];

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const totalSteps = stepsList.length;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem('lendswift_draft', JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  const CurrentComponent = stepsList[currentStep - 1].component;

  return (
    <div className="max-w-3xl mx-auto my-10 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-white border-b border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-slate-900">LendSwift Loan Application</h1>
        <p className="text-sm font-medium text-slate-700 mt-1">Complete the steps below to apply for your instant loan.</p>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} stepsList={stepsList} />

      <div className="p-6 min-h-[300px]">
        <CurrentComponent formData={formData} setFormData={setFormData} />
      </div>

      <StepNavigation 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        onNext={handleNext} 
        onPrev={handlePrev} 
        onSaveDraft={handleSaveDraft} 
      />
    </div>
  );
}