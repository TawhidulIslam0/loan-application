import { useState, useCallback } from 'react';
import { validatePAN, validateAadhaar } from '../utils/validators';

export const useVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);

  const verify = useCallback(async (value, type) => {
    setIsVerifying(true);
    setIsVerified(false);
    setError(null);

    return new Promise((resolve) => {
      setTimeout(() => {
        let result;

        if (type === 'PAN') {
          result = validatePAN(value);
        } 
        
        else if (type === 'Aadhaar') {
          result = validateAadhaar(value);
        } 
        
        else {
          result = {
            isValid: false,
            error: 'Unknown verification type',
          };
        }

        setIsVerifying(false);

        if (result.isValid) {
          setIsVerified(true);
          setError(null);
          resolve(true);
        } 
        
        else {
          setIsVerified(false);
          setError(result.error);
          resolve(false);
        }

      }, 1500);
    });

  }, []);

  const resetVerification = useCallback(() => {
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  }, []);

  return {
    isVerifying,
    isVerified,
    error,
    verify,
    resetVerification,
  };
};