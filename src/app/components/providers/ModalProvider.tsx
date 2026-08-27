"use client";

import { useModalStore } from "@/lib/stores/modal-store";
import dynamic from "next/dynamic";


const CartPopup = dynamic(() => import("../CartPopup"));
const CheckoutRequirement = dynamic(() => import("../CheckoutRequirement"));
const AuthWrapper = dynamic(() => import("../auth-component/AuthWrapper"));
const SignOutConfirm = dynamic(() => import("../SignOutConfirm"));

export default function ModalProvider() {
    const activeModal = useModalStore(s => s.activeModal);
    const closeModal = useModalStore(s => s.closeModal);

    // Cart/checkout/shopper-auth/sign-out modals are all shopper concepts —
    // admin has its own auth and session-expiry handling (see
    // handleAdminUnauthorized in adminapi.ts). Guard is after the hooks
    // above, not before, since this persists across admin/shop navigation.


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