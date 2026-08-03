import PropTypes from 'prop-types';

export default function StepNavigation({ currentStep, totalSteps, onNext, onPrev, onSaveDraft }) {
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
      <button
        type="button"
        onClick={onSaveDraft}
        className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition shadow-sm"
      >
        Save Draft
      </button>

      <div className="flex space-x-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition shadow-sm"
          >
            Previous
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition shadow-sm"
        >
          {currentStep === totalSteps ? 'Submit Application' : 'Next Step'}
        </button>
      </div>
    </div>
  );
}

StepNavigation.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrev: PropTypes.func.isRequired,
  onSaveDraft: PropTypes.func.isRequired,
};