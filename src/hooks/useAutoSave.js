import { useEffect, useRef } from 'react';
import { encryptData } from '../utils/encryption';

export function useAutoSave(formData, currentStep, storageKey = 'lend_swift_draft') {
  const savedRef = useRef(formData);

  useEffect(() => {
    savedRef.current = formData;
  }, [formData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const payload = {
        step: currentStep,
        data: savedRef.current,
        timestamp: new Date().toISOString(),
      };
      const encrypted = await encryptData(payload);
      if (encrypted) {
        localStorage.setItem(storageKey, encrypted);
        console.debug('Auto-saved encrypted state at step', currentStep);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [currentStep, storageKey]);
}