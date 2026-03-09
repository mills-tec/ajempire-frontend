import { Suspense } from "react";
import PaymentConfirmation from "../components/PaymentConfirmation";

export default function PaymentPage() {

    return (
        <>
            <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                <PaymentConfirmation />
            </Suspense>
        </>
    )
}