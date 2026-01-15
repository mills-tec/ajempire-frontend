"use client";

import { useState } from "react";
import AdminLogin from "./Adminlogin";
import AdminAuth from "./AdminAuth";


export default function AdminAuthStep() {
    const [step, setStep] = useState<"auth" | "login">("auth");

    if (step === "login") {
        return <AdminLogin />;
    }

    return <AdminAuth onProceed={() => setStep("login")} />;
}