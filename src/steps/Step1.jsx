import PropTypes from 'prop-types';

export default function Step1({ formData, setFormData }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Select Loan Details</h2>
      <p className="text-sm text-gray-600 mb-4">Choose your loan type and amount preference.</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount ($)
          </label>
          <input 
            id="loanAmount"
            type="number" 
            name="loanAmount"
            value={formData.loanAmount || ''}
            onChange={handleChange}
            placeholder="e.g., 50000" 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lendswift-primary focus:outline-none" 
          />
        </div>
        <div>
          <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700 mb-1">
            Loan Purpose
          </label>
          <select 
            id="loanPurpose"
            name="loanPurpose"
            value={formData.loanPurpose || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-lendswift-primary focus:outline-none"
          >
            <option value="">Select Purpose</option>
            <option value="home">Home Improvement</option>
            <option value="business">Business Expansion</option>
            <option value="personal">Personal Debt Consolidation</option>
          </select>
        </div>
      </div>
    </div>
  );
}

Step1.propTypes = {
  formData: PropTypes.shape({
    loanAmount: PropTypes.string,
    loanPurpose: PropTypes.string,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};