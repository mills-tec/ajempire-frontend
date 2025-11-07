"use client";
import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";

// --- 1. Define Types ---
interface CheckoutContextType {
    selectedPaymentMethod: string | null;
    setSelectedPaymentMethod: (method: string) => void;
}

// --- 2. Create Context ---
// We use 'undefined' as the default value to clearly indicate when the hook 
// is used outside the provider (the 'if (!context)' check).
const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// --- 3. Define Provider Component ---
interface CheckoutProviderProps {
    children: ReactNode;
}

export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({ children }) => {

    // 1. Initialize state from Local Storage or default to null
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(() => {
        if (typeof window !== 'undefined') { // Check if running in browser
            return localStorage.getItem('paymentMethod') || null;
        }
        return null;
    });

    // 2. Save state to Local Storage whenever it changes
    // This is the key to surviving the refresh!
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (selectedPaymentMethod) {
                localStorage.setItem('paymentMethod', selectedPaymentMethod);
            } else {
                localStorage.removeItem('paymentMethod');
            }
        }
    }, [selectedPaymentMethod]);

    console.log("CheckoutProvider state on render:", selectedPaymentMethod);

    const contextValue = useMemo(() => ({
        selectedPaymentMethod,
        setSelectedPaymentMethod,
    }), [selectedPaymentMethod]);

    return (
        <CheckoutContext.Provider value={contextValue}>
            {children}
        </CheckoutContext.Provider>
    );
};

// --- 4. Define Custom Hook ---
// This hook is exported as a NAMED EXPORT
export const useCheckout = (): CheckoutContextType => {
    const context = useContext(CheckoutContext);

    // Check to ensure the hook is used within the Provider
    if (!context) {
        throw new Error("useCheckout must be used inside CheckoutProvider");
    }

    return context;
};