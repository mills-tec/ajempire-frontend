"use client";

import ShippingAdressForm from "../ShippingAdressForm";
import PaymentMethod from "../PaymentMethod";
import SelectLogistics from "../SelectLogistics";
import Spinner from "../Spinner";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCartStore, CheckoutStep } from "@/lib/stores/cart-store";
import { useEffect, useRef } from "react";
import { useModalStore } from "@/lib/stores/modal-store";

// import { useCartStore, CheckoutStep } from "@/store/cartStore";

interface CheckoutWrapperProps {
    setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutWrapper({ setIsadress }: CheckoutWrapperProps) {
    const router = useRouter();
    // const {} = useCartStore();
    const checkoutStep = useCartStore((s) => s.checkoutStep);
    const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);

    // inside the component
    const closeModal = useModalStore((s) => s.closeModal);


    const steps = [
        CheckoutStep.ADDRESS_FORM,
        CheckoutStep.PAYMENT_METHOD,
        CheckoutStep.LOGISTICS,
        CheckoutStep.ORDER_SUMMARY,
    ];

    const goToNextStep = () => {
        const i = steps.indexOf(checkoutStep);
        if (i < steps.length - 1) {
            setCheckoutStep(steps[i + 1]);
        }
    };

    const goToPreviousStep = () => {
        const i = steps.indexOf(checkoutStep);
        if (i > 0) {
            setCheckoutStep(steps[i - 1]);
        }
    };

    // useEffect(() => {
    //     if (checkoutStep === CheckoutStep.ORDER_SUMMARY) {
    //         router.push("/checkoutpage");
    //     }
    // }, [checkoutStep, router]);
    const redirected = useRef(false);

    useEffect(() => {
        if (
            checkoutStep === CheckoutStep.ORDER_SUMMARY &&
            !redirected.current
        ) {
            redirected.current = true;
            router.replace("/checkoutpage");
        }
    }, [checkoutStep, router]);

    const stepVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, transition: { duration: 0.3 } },
    };

    switch (checkoutStep) {
        case CheckoutStep.ADDRESS_FORM:
            return (
                <motion.div {...stepVariants}>
                    <ShippingAdressForm
                        onContinue={goToNextStep}
                        setIsadress={setIsadress}
                        onClose={closeModal}
                    />
                </motion.div>
            );

        case CheckoutStep.PAYMENT_METHOD:
            return (
                <PaymentMethod
                    onNext={goToNextStep}
                    goToPreviousStep={goToPreviousStep}
                    setIsadress={setIsadress}
                    onClose={closeModal}
                />
            );

        case CheckoutStep.LOGISTICS:
            return (
                <SelectLogistics
                    onContinue={goToNextStep}
                    onBack={goToPreviousStep}
                    setIsadress={setIsadress}
                    onClose={closeModal}
                />
            );

        default:
            return <div>Checkout flow error</div>;
    }
}
