"use client";

import { createContext, useContext, useRef, ReactNode } from "react";

type CartIconContextType = {
    cartRef: React.RefObject<HTMLAnchorElement | null>;
};

const CartIconContext = createContext<CartIconContextType | null>(null);

export function CartIconProvider({ children }: { children: ReactNode }) {
    const cartRef = useRef<HTMLAnchorElement>(null);

    return (
        <CartIconContext.Provider value={{ cartRef }}>
            {children}
        </CartIconContext.Provider>
    );
}

export function useCartIcon() {
    const context = useContext(CartIconContext);
    if (!context) {
        throw new Error("useCartIcon must be used inside CartIconProvider");
    }
    return context;
}
