"use client";

import CheckoutWrapper from "./ui/CheckoutWrapper";

interface CheckoutRequirementProps {
    children?: React.ReactNode;
    setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutRequirement({ children, setIsadress }: CheckoutRequirementProps) {
    return (
        <>
            <CheckoutWrapper setIsadress={setIsadress} />
            {children}
        </>
    );
}
