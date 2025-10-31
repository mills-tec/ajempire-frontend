"use client"

import { CheckoutProvider } from "../context/CheckoutContext";
import CheckoutWrapper from "./ui/CheckoutWrapper";

interface CheckoutRequirementProps {
    setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutRequirement({ setIsadress }: CheckoutRequirementProps) {
    return (
        <CheckoutProvider>
            <CheckoutWrapper setIsadress={setIsadress} />
        </CheckoutProvider>
    );
}
