"use client";

import { useState } from "react";
import Image from "next/image";
import Spinner from "./Spinner";
import { useCheckout } from "../context/CheckoutContext";

interface PaymentMethodProps {
    onNext: () => void;
    setIsadress?: (value: boolean) => void;

}

export default function PaymentMethod({ onNext, setIsadress, }: PaymentMethodProps) {
    // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"paystack" | "flutter" | "">("");
    const [loading, setLoading] = useState(false)
    const { selectedPaymentMethod, setSelectedPaymentMethod } = useCheckout();

    const payStackLogo =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAmVBMVEX///8THjItve8AAADr+P3Y8PuT2PUAAAtFw/Aeu+/Z2twAEiqE1PS+5/kAABcAAB4AACILGS9ozPKx4ve8vsI6O0cADSj0+/5ayPEAABqho6gAABL5+frt7u/n6OkAt+7P0NOIi5KWmJ7Fx8pkaHKtr7RHTFkgKj0rMkNXWV+i3vZ/gopUWmUyOkk+Q1EdIjQlKTRucXgcICzHyFeLAAAEk0lEQVR4nO2Xi3KjOBBF0SgZNmgC0gYrCxIMCDA4tvGQ//+47ZYf8QYnqSln9lHbpyrBenLVut0uBwFBEARBEARBEARBEARBEARBEARBEARBEARBEP9hrLX/tIQZ0apdNX/nC4umqj4KQ8oFz98Yu/k65/FaUTU3/KMopCGL3xL19fvda74/XS0qYeFVou6+vObuM0Tx6hpR70WqcK6Ooqnv2+ZgkWq97dsqci4vOudcgX2Ry/MosGnb77Zr8FKVbwST69w5WITd27psnOv8jl07bNe420GU7fK8ey3q9tucm+NgxBMz7qRSMm6xbV2WQEOPJgubHybjDjtXYcY7O4VaKZUka9tywRiTWQa+KjfYHQ9bY37ACZrRSCVk2BZHUTmPOZslxc0FXkQxppjCd2QtrJwMfBLQw5huXMLEBif1MKmcMqa0SBSYaYL/0CUEb6zS+IkpWLMogiaGrQT8SWX3oirD1C56ren+twvcn4limdjEEh5pUEFTm6WKGYqKYqYG2C/NmGgLGBqqqut5G+TbAZSMy+VY1Bks1GOI0haFHQUTfNxyxXjeoCi7FOxCYbhg9C93X89EabgiO2kmxqDVTGLA8gS6U9wwSSF8ksnccqb6qrSBTzp3MHq5VUzC+gJWqoXtQtBagjH7eMLrS+p1Aua7YPQPRPkbCizIyOxSqV2JTTCyToNa+h2lYiYKDFxQMqzWqOVUEhq4YTxFUIKxFhakmdSnS+qNjjcplsVc1NMs+YCHF1Gy9p+2EOZyofavCHKJoio4foxzlAqCLvHu0XyyZ6KMDxQcaiNAFN7VydMoCm3QzjVB+l3gWNLhhXof3R5sUI5KbPymtRcVKOzsMpbgnGrkYQIezrp9nTqK8ocCPQdR5bmoBCwnZwUhCB4f7mecBjEK6GU0s+qDldiHPwI1KAreLesJnIV3FvkCBQOgGyPlJ+6O60P0VH1wkG13lS8JXSqZCmfJFzxdKJ4PZ6KYWHSRg0DFdeAg33Z5lMKJvagq8zfgzVuLDWxeoSivVmy6tvbmW6ZR3vuSEEFFUVOTbrR4rnz2BUt96QLf/ZrxJUHFHAqPGuDNO6g4CTdYt1BUgeqYv+GUK0j2FkKY5diCw8SaV1hElOGZ8iUhwAqhQ1zPm70oyACWuJmoeaROybcvnhp31D7Fm2dsMAG5JPF61hKbBlxRLDLh+5MRXFeMEk9j1oHzJ4CyqgSIspvYH0OENR7DgH6XKRG/vsDb3+fcnonSba3iWE37dWWrjJGTG4YBRVY9FCLGvZW7lTCxHN1hnjbxgP5pVtKY3k3DsMIc6ZaJMXoFi6vngeHBpn5gs1A9zjk3OmRPWVWnnLFlk4Kly3LfU1TgnuV+qIB5UXGad1xURE1TQrssjk2ssSi89E97eP4lUn+8cP9qzIu6UHCPo5UvDvGFnL6Sc099+ylRxUpN692l79PrRb1k30+KqkOmoYqHM0N8gqj3IyXDN0V1Wmqhk83na4KK/sLsB4Ptuq68tMoTuamd0l+g6Tr+jb8nCYIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCOJ/y58ow3Z4Sc3OfAAAAABJRU5ErkJggg==";
    const flutterWaveLogo = "https://logotyp.us/file/flutterwave.svg";
    const handleContinue = () => {
        if (!selectedPaymentMethod) return;
        setLoading(true);

        // simulate loading delay before navigating
        setTimeout(() => {
            setLoading(false);
            console.log("Selected payment method:", selectedPaymentMethod);
            onNext();
        }, 700);
    };

    console.log(selectedPaymentMethod)
    return (
        <div className="fixed inset-0 bg-[#FFFFFF] flex lg:items-center lg:justify-center z-50">
            {
                loading && (
                    <Spinner />
                )
            }
            <div className="w-full relative shadow-lg font-poppins text-[14px] lg:w-[50%] lg:h-[500px] lg:px-10 px-5 py-8">
                <p className="text-center font-semibold opacity-75">Payment Method</p>
                <div className="lg:hidden flex items-center justify-between gap-1 mb-5 mt-5">
                    <div className="flex items-center gap-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z" fill="#0085FF" />
                        </svg>
                        <p>Shipping</p>
                    </div>
                    <div>
                        <svg width="22" height="1" viewBox="0 0 22 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 0.5H21.5" stroke="#CFCFCF" stroke-linecap="square" />
                        </svg>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z" fill="#A600FF" />
                        </svg>

                        <p className="text-[#A3A3A3]">Payment</p>
                    </div>
                    <div>
                        <svg width="22" height="1" viewBox="0 0 22 1" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 0.5H21.5" stroke="#CFCFCF" stroke-linecap="square" />
                        </svg>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="24" rx="12" fill="#AEAEAE" />
                            <path d="M11 7V13.6667L14 17" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p className="text-[#A3A3A3]">Review</p>
                    </div>
                </div>

                <div className="lg:px-[30px]">
                    <div className="flex flex-col gap-2 mt-10 mb-8">
                        <p>Choose a payment method</p>
                        <div className="text-[#7E7E7E] font-[11px]">
                            <p className="text-[11px]">You will not be charged until you review this order on</p>
                            <p className="text-[11px] ">the next page.</p>
                        </div>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-4">
                        {/* Paystack Option */}
                        <div
                            className={`flex items-center justify-between border px-6 py-3 rounded-lg cursor-pointer ${selectedPaymentMethod === "paystack" ? "border-primaryhover bg-pink-50" : "border-gray-300"
                                }`}
                            onClick={() => setSelectedPaymentMethod("paystack")}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={selectedPaymentMethod === "paystack"}
                                    onChange={() => setSelectedPaymentMethod("paystack")}
                                    className=""
                                />
                                <label>Paystack</label>
                            </div>
                            <Image src={payStackLogo} alt="Paystack" width={50} height={50} className="bg-transparent object-contain" />
                        </div>

                        {/* Flutterwave Option */}
                        <div
                            className={`flex items-center justify-between border px-6 py-3 rounded-lg cursor-pointer ${selectedPaymentMethod === "flutter" ? "border-primaryhover bg-pink-50" : "border-gray-300"
                                }`}
                            onClick={() => setSelectedPaymentMethod("flutter")}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={selectedPaymentMethod === "flutter"}
                                    onChange={() => setSelectedPaymentMethod("flutter")}
                                />
                                <label>Flutterwave</label>
                            </div>
                            <Image src={flutterWaveLogo} alt="Flutterwave" width={70} height={70} />
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="flex items-end justify-end mt-10">
                        <button
                            disabled={!selectedPaymentMethod}
                            onClick={
                                handleContinue
                            }
                            className={`w-full h-[35px] rounded-md text-white ${selectedPaymentMethod ? "bg-primaryhover hover:bg-[#E6007E]" : "bg-gray-300 cursor-not-allowed"
                                }`}
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* Close Button */}
                <div
                    className="absolute top-6 right-6 cursor-pointer"
                    onClick={() => setIsadress && setIsadress(false)}
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0.75 13.8575L7.30375 7.30375L13.8575 13.8575M13.8575 0.75L7.3025 7.30375L0.75 0.75"
                            stroke="black"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
