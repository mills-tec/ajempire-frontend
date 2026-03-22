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

