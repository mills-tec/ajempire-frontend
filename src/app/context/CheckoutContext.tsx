// "use client";

// import {
//     createContext,
//     useContext,
//     useState,
//     useEffect,
//     useMemo,
//     ReactNode,
// } from "react";

// // ---------------- TYPES ----------------
// export type PaymentMethod = "paystack" | "flutter";

// interface CheckoutContextType {
//     selectedPaymentMethod: PaymentMethod | null;
//     setSelectedPaymentMethod: (method: PaymentMethod | null) => void;
// }

// // ---------------- CONTEXT ----------------
// const CheckoutContext = createContext<CheckoutContextType | undefined>(
//     undefined
// );

// // ---------------- PROVIDER ----------------
// interface CheckoutProviderProps {
//     children: ReactNode;
// }

// export const CheckoutProvider = ({ children }: CheckoutProviderProps) => {
//     const [selectedPaymentMethod, setSelectedPaymentMethod] =
//         useState<PaymentMethod | null>(null);

//     // Load from localStorage on mount
//     useEffect(() => {
//         if (typeof window === "undefined") return;

//         const storedMethod = localStorage.getItem("checkout.paymentMethod");

//         if (storedMethod === "paystack" || storedMethod === "flutter") {
//             setSelectedPaymentMethod(storedMethod);
//         }
//     }, []);

//     // Persist to localStorage
//     useEffect(() => {
//         if (typeof window === "undefined") return;

//         if (selectedPaymentMethod) {
//             localStorage.setItem(
//                 "checkout.paymentMethod",
//                 selectedPaymentMethod
//             );
//         } else {
//             localStorage.removeItem("checkout.paymentMethod");
//         }
//     }, [selectedPaymentMethod]);

//     const value = useMemo(
//         () => ({
//             selectedPaymentMethod,
//             setSelectedPaymentMethod,
//         }),
//         [selectedPaymentMethod]
//     );

//     return (
//         <CheckoutContext.Provider value={value}>
//             {children}
//         </CheckoutContext.Provider>
//     );
// };

// // ---------------- HOOK ----------------
// export const useCheckout = (): CheckoutContextType => {
//     const context = useContext(CheckoutContext);

//     if (!context) {
//         throw new Error("useCheckout must be used within CheckoutProvider");
//     }

//     return context;
// };

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PaymentMethod = "paystack" | "flutter";

interface CheckoutStore {
    selectedPaymentMethod: PaymentMethod;
    setSelectedPaymentMethod: (method: PaymentMethod) => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
    persist(
        (set) => ({
            // ✅ default is paystack
            selectedPaymentMethod: "paystack",

            setSelectedPaymentMethod: (method) =>
                set({ selectedPaymentMethod: method }),
        }),
        {
            name: "checkout.paymentMethod", // localStorage key
        }
    )
);

