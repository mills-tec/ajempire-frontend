"use client";

import ShippingAdressForm from "../ShippingAdressForm";
import PaymentMethod from "../PaymentMethod";
import SelectLogistics from "../SelectLogistics";
import Spinner from "../Spinner";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCartStore, CheckoutStep } from "@/lib/stores/cart-store";

// import { useCartStore, CheckoutStep } from "@/store/cartStore";

interface CheckoutWrapperProps {
    setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutWrapper({ setIsadress }: CheckoutWrapperProps) {
    const router = useRouter();
    // const {} = useCartStore();
    const checkoutStep = useCartStore((s) => s.checkoutStep);
    const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);

    const goToNextStep = () => {
        setCheckoutStep(
            checkoutStep === CheckoutStep.ADDRESS_FORM
                ? CheckoutStep.PAYMENT_METHOD
                : checkoutStep === CheckoutStep.PAYMENT_METHOD
                    ? CheckoutStep.LOGISTICS
                    : CheckoutStep.ORDER_SUMMARY
        );
    };

    const goToPreviousStep = () => {
        setCheckoutStep(
            checkoutStep === CheckoutStep.LOGISTICS
                ? CheckoutStep.PAYMENT_METHOD
                : CheckoutStep.ADDRESS_FORM
        );
    };

    // Redirect only when we HIT final step
    if (checkoutStep === CheckoutStep.ORDER_SUMMARY) {
        router.push("/checkoutpage");
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

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
                    />
                </motion.div>
            );

        case CheckoutStep.PAYMENT_METHOD:
            return (
                <PaymentMethod
                    onNext={goToNextStep}
                    goToPreviousStep={goToPreviousStep}
                    setIsadress={setIsadress}
                />
            );

        case CheckoutStep.LOGISTICS:
            return (
                <SelectLogistics
                    onContinue={goToNextStep}
                    onBack={goToPreviousStep}
                    setIsadress={setIsadress}
                />
            );

        default:
            return <div>Checkout flow error</div>;
    }
}
