"use client";

import dynamic from "next/dynamic";
import { useModalStore } from "@/lib/stores/modal-store";


const CartPopup = dynamic(() => import("../CartPopup"));
const CheckoutRequirement = dynamic(() => import("../CheckoutRequirement"));
const AuthWrapper = dynamic(() => import("../auth-component/AuthWrapper"));
const SignOutConfirm = dynamic(() => import("../SignOutConfirm"));

export default function ModalProvider() {
    const activeModal = useModalStore(s => s.activeModal);
    const closeModal = useModalStore(s => s.closeModal);

    return (
        <>
            {activeModal === "cart" && <CartPopup />}
            {activeModal === "checkout" && <CheckoutRequirement />}
            {activeModal === "authwrapper" && (
                <AuthWrapper onClose={closeModal} />
            )}
            {activeModal === "signout-confirm" && <SignOutConfirm />}
        </>
    );
}