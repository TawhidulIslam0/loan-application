import PropTypes from 'prop-types';

export default function ProgressBar({ currentStep, totalSteps, stepsList }) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="px-6 pt-6 bg-gray-50 border-b border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-lendswift-primary uppercase tracking-wider">
          Step {currentStep} of {totalSteps}: {stepsList[currentStep - 1].name}
        </span>
        <span className="text-xs font-bold text-gray-600">
          {Math.round(progressPercentage)}% Completed
        </span>
      </div>
      
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
        <div 
          className="bg-lendswift-accent h-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  stepsList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};