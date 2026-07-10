"use client";

import PaymentMethod from "../PaymentMethod";
import SelectLogistics from "../SelectLogistics";
import ShippingAdressForm from "../ShippingAdressForm";

import { CheckoutStep, useCartStore } from "@/lib/stores/cart-store";
import { useModalStore } from "@/lib/stores/modal-store";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";

interface CheckoutWrapperProps {
  setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
}

const STEP_ORDER = [
  CheckoutStep.ADDRESS_FORM,
  CheckoutStep.PAYMENT_METHOD,
  CheckoutStep.LOGISTICS,
  CheckoutStep.ORDER_SUMMARY,
] as const;

const stepVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const SKELETON_ITEM_ROWS = 3;
const SKELETON_SUMMARY_ROWS = 4;

function OrderSummarySkeleton() {
  return (
    <div className="fixed inset-0 z-50 bg-white flex lg:items-center lg:justify-center">
      <div className="w-full max-w-md p-4 space-y-4 animate-pulse">
        {/* Header */}
        <div className="h-6 w-40 bg-gray-200 rounded-md" />

        {/* Item rows */}
        {Array.from({ length: SKELETON_ITEM_ROWS }).map((_, i) => (
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
        {Array.from({ length: SKELETON_SUMMARY_ROWS }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        ))}

        {/* Button */}
        <div className="h-11 w-full bg-gray-200 rounded-full mt-2" />
      </div>
    </div>
  );
}

export default function CheckoutWrapper({ setIsadress }: CheckoutWrapperProps) {
  const router = useRouter();

  const checkoutStep = useCartStore((s) => s.checkoutStep);
  const setCheckoutStep = useCartStore((s) => s.setCheckoutStep);
  const resetCheckoutFlow = useCartStore((s) => s.resetCheckoutFlow);
  const closeModal = useModalStore((s) => s.closeModal);

  // isNavigating stays true from router.replace() until /checkoutpage has
  // rendered, so the skeleton can cover the whole navigation.
  const [isNavigating, startTransition] = useTransition();
  const navigationStarted = useRef(false);

  // Every modal session starts fresh from the address step, with stale
  // logistics/token data from an abandoned flow cleared.
  useEffect(() => {
    resetCheckoutFlow();
  }, [resetCheckoutFlow]);

  const finishCheckout = useCallback(() => {
    if (navigationStarted.current) return;
    navigationStarted.current = true;
    setCheckoutStep(CheckoutStep.ORDER_SUMMARY);
    startTransition(() => {
      router.replace("/checkoutpage");
    });
  }, [router, setCheckoutStep]);

  const goToNextStep = useCallback(() => {
    const next = STEP_ORDER[STEP_ORDER.indexOf(checkoutStep) + 1];
    if (next === undefined) return;
    if (next === CheckoutStep.ORDER_SUMMARY) {
      finishCheckout();
    } else {
      setCheckoutStep(next);
    }
  }, [checkoutStep, finishCheckout, setCheckoutStep]);

  const goToPreviousStep = useCallback(() => {
    const prev = STEP_ORDER[STEP_ORDER.indexOf(checkoutStep) - 1];
    if (prev !== undefined) setCheckoutStep(prev);
  }, [checkoutStep, setCheckoutStep]);

  // Tear the modal down only after navigation has committed. Resets just the
  // step — selectedLogistic/requestToken must survive for /checkoutpage.
  useEffect(() => {
    if (!navigationStarted.current || isNavigating) return;
    closeModal();
    setCheckoutStep(CheckoutStep.ADDRESS_FORM);
  }, [isNavigating, closeModal, setCheckoutStep]);

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
          skipLogistics={finishCheckout}
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
      return <OrderSummarySkeleton />;

    default:
      return null;
  }
}
