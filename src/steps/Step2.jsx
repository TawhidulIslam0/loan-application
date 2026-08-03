import PropTypes from 'prop-types';

export default function Step2({ formData, setFormData }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Personal Information</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your legal name and contact details.</p>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input 
              id="firstName"
              type="text" 
              name="firstName"
              value={formData.firstName || ''}
              onChange={handleChange}
              placeholder="John" 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input 
              id="lastName"
              type="text" 
              name="lastName"
              value={formData.lastName || ''}
              onChange={handleChange}
              placeholder="Doe" 
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input 
            id="email"
            type="email" 
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="john.doe@example.com" 
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
          />
        </div>
      </div>
    </div>
  );
}

Step2.propTypes = {
  formData: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};