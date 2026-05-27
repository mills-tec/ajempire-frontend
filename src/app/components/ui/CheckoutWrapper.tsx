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
import axios from "axios";
import { globalUrl } from "@/api/api";

// import { useCartStore, CheckoutStep } from "@/store/cartStore";

interface CheckoutWrapperProps {
  setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CheckoutWrapper({ setIsadress }: CheckoutWrapperProps) {
  const router = useRouter();
  const isLogisticsMode = useCartStore((s) => s.isLogisticsMode);

  // const {} = useCartStore();
  const checkoutStep = useCartStore((s) => s.checkoutStep);
  const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);
  const resetCheckoutFlow = useCartStore((s) => s.resetCheckoutFlow);

  // inside the component
  const closeModal = useModalStore((s) => s.closeModal);

  // Reset checkout flow to address step when component mounts
  useEffect(() => {
    resetCheckoutFlow();
  }, [resetCheckoutFlow]);

  const steps = [
    CheckoutStep.ADDRESS_FORM,
    CheckoutStep.PAYMENT_METHOD,
    CheckoutStep.LOGISTICS,
    CheckoutStep.ORDER_SUMMARY,
  ];

  const goToNextStep = async () => {
    const i = steps.indexOf(checkoutStep);
    if (i < steps.length - 1) {
      const nextStep = steps[i + 1];

      setCheckoutStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    const i = steps.indexOf(checkoutStep);
    if (i > 0) {
      setCheckoutStep(steps[i - 1]);
    }
  };

  const redirected = useRef(false);

  useEffect(() => {
    if (checkoutStep === CheckoutStep.ORDER_SUMMARY && !redirected.current) {
      redirected.current = true;
      closeModal();
      resetCheckoutFlow();
      router.replace("/checkoutpage");
    }
  }, [checkoutStep, router, closeModal, resetCheckoutFlow]);

  const stepVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  console.log(checkoutStep);

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
          skipLogistics={() => {
            setCheckoutStep(3);
          }}
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

    case CheckoutStep.ORDER_SUMMARY:
      return (
        <div className="p-4 space-y-4 animate-pulse">
          {/* Header */}
          <div className="h-6 w-40 bg-gray-200 rounded-md" />

          {/* Item rows */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          ))}

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Summary rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          ))}

          {/* Button */}
          <div className="h-11 w-full bg-gray-200 rounded-full mt-2" />
        </div>
      );

    default:
      return null;
  }
}
