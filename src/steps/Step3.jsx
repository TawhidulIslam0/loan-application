import PropTypes from 'prop-types';

export default function Step3({ formData, setFormData }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 3: Identity & KYC</h2>
      <p className="text-sm text-gray-600 mb-4">Provide your identification details for verification.</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
            National ID / PAN Number
          </label>
          <input 
            id="nationalId"
            type="text" 
            name="nationalId"
            value={formData.nationalId || ''}
            onChange={handleChange}
            placeholder="ABCDE1234F" 
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
          />
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
          <input 
            id="dob"
            type="date" 
            name="dob"
            value={formData.dob || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
          />
        </div>
      </div>
    </div>
  );
}

Step3.propTypes = {
  formData: PropTypes.shape({
    nationalId: PropTypes.string,
    dob: PropTypes.string,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};