// CheckoutWrapper.tsx (REWRITTEN)
"use client"
import React, { useState, useEffect } from 'react';
import ShippingAdressForm from '../ShippingAdressForm';
import PaymentMethod from '../PaymentMethod';
import { useRouter } from 'next/navigation';
import Spinner from '../Spinner';
import { useCheckout } from '@/app/context/CheckoutContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    useEffect(() => {
        localStorage.setItem("checkoutStep", String(currentStep));
    }, [currentStep]);

    // Restore step on refresh
    useEffect(() => {
        const savedStep = localStorage.getItem("checkoutStep");
        if (savedStep) {
            setCurrentStep(Number(savedStep));
        }
    }, []);

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
    const goToPreviousStep = () => {
        setCurrentStep(prevStep => {
            if (prevStep === CheckoutStep.PAYMENT_METHOD) return CheckoutStep.ADDRESS_FORM;
            return prevStep;
        });
    };


    // 💡 REMOVED: The redirecting spinner is no longer needed for navigation

    if (isRedirecting) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }

    // 3. Render the current step
    const stepVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4, delay: 0.1 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    // Render step
    switch (currentStep) {
        case CheckoutStep.ADDRESS_FORM:
            return (
                <motion.div
                    key="address"
                    variants={stepVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="w-full"
                >
                    <ShippingAdressForm onContinue={goToNextStep} setIsadress={setIsadress} />
                </motion.div>
            );

        case CheckoutStep.PAYMENT_METHOD:
            return <PaymentMethod onNext={goToNextStep} setIsadress={setIsadress} goToPreviousStep={goToPreviousStep} />;

        default:
            return <div>Checkout Flow Error</div>;
    }
}