// CheckoutWrapper.tsx (REWRITTEN)
"use client"
import React, { useState, useEffect } from 'react';
import ShippingAdressForm from '../ShippingAdressForm';
import PaymentMethod from '../PaymentMethod';
import OrderSummaryPage from './OrderSummaryPage'; // Ensure this is the correct path
import { useRouter } from 'next/navigation';
import Spinner from '../Spinner';
import { useCheckout } from '@/app/context/CheckoutContext';

// 1. Define the possible steps
enum CheckoutStep {
    ADDRESS_FORM,
    PAYMENT_METHOD,
    ORDER_SUMMARY, // <-- Final step
}


interface CheckoutWrapperProps {
    setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutWrapper({ setIsadress }: CheckoutWrapperProps) {
    // You no longer need the router if you are staying on the same page
    const router = useRouter(); // <--- REMOVED UNLESS NEEDED ELSEWHERE

    const { selectedPaymentMethod } = useCheckout();
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.ADDRESS_FORM);

    // 💡 REMOVED: This state is now managed globally by CheckoutContext
    // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(""); 

    // 💡 REMOVED: No more redirecting/loading spinner for navigation
    const [isRedirecting, setIsRedirecting] = useState(false);

    // 2. Navigation Function
    const goToNextStep = () => {
        setCurrentStep(prevStep => {
            if (prevStep === CheckoutStep.ADDRESS_FORM) return CheckoutStep.PAYMENT_METHOD;
            if (prevStep === CheckoutStep.PAYMENT_METHOD) return CheckoutStep.ORDER_SUMMARY;
            return prevStep; // Stay put if already at the end
        });
    };

    // 💡 REMOVED: The useEffect that performs the router.push is gone!

    useEffect(() => {
        if (currentStep === CheckoutStep.ORDER_SUMMARY) {
            setIsRedirecting(true);
            console.log("Final Selected Payment Method:", selectedPaymentMethod);
            setTimeout(() => {
                router.push('/checkoutpage');
            }, 300);
        }
    }, [currentStep, router]);


    // 💡 REMOVED: The redirecting spinner is no longer needed for navigation

    if (isRedirecting) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }


    // 3. Render the current step
    switch (currentStep) {
        case CheckoutStep.ADDRESS_FORM:
            return <ShippingAdressForm onContinue={goToNextStep} setIsadress={setIsadress} />;

        case CheckoutStep.PAYMENT_METHOD:
            // PaymentMethod sets the state inside CheckoutContext
            return <PaymentMethod onNext={goToNextStep} setIsadress={setIsadress} />;

        default:
            return <div>Checkout Flow Error</div>;
    }
}