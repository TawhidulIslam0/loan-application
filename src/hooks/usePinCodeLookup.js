import { useState, useCallback } from "react";
import pinCodeDatabase from "../utils/pinCodeData.json";

export const usePinCodeLookup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const lookupPinCode = useCallback(async (pin) => {
        const pinStr = String(pin);

        if (pinStr.length !== 6) {
            return {
                city: "",
                state: "",
                postOffice: "",
                error: null
            };
        }
        setIsLoading(true);
        setError(null);

        return new Promise((resolve) => {
            setTimeout(() => {
                const found = pinCodeDatabase.find(
                    item => item.pin === pinStr
                );

                setIsLoading(false);

                if (found) {
                    resolve({
                        city: found.city,
                        state: found.state,
                        postOffice: found.postOffice,
                        error: null
                    });
                } else {
                    const err = "PIN code not found";
                    setError(err);

                    resolve({
                        city: "",
                        state: "",
                        postOffice: "",
                        error: err
                    });
                }
            }, 300);
        });
    }, []);
    return { lookupPinCode, isLoading, error };
};