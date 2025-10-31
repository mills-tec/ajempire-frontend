"use client"
import { useCheckout } from "@/app/context/CheckoutContext";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SelectedpaymentMethod() {
    const payStackLogo =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAmVBMVEX///8THjItve8AAADr+P3Y8PuT2PUAAAtFw/Aeu+/Z2twAEiqE1PS+5/kAABcAAB4AACILGS9ozPKx4ve8vsI6O0cADSj0+/5ayPEAABqho6gAABL5+frt7u/n6OkAt+7P0NOIi5KWmJ7Fx8pkaHKtr7RHTFkgKj0rMkNXWV+i3vZ/gopUWmUyOkk+Q1EdIjQlKTRucXgcICzHyFeLAAAEk0lEQVR4nO2Xi3KjOBBF0SgZNmgC0gYrCxIMCDA4tvGQ//+47ZYf8QYnqSln9lHbpyrBenLVut0uBwFBEARBEARBEARBEARBEARBEARBEARBEARBEP9hrLX/tIQZ0apdNX/nC4umqj4KQ8oFz98Yu/k65/FaUTU3/KMopCGL3xL19fvda74/XS0qYeFVou6+vObuM0Tx6hpR70WqcK6Ooqnv2+ZgkWq97dsqci4vOudcgX2Ry/MosGnb77Zr8FKVbwST69w5WITd27psnOv8jl07bNe420GU7fK8ey3q9tucm+NgxBMz7qRSMm6xbV2WQEOPJgubHybjDjtXYcY7O4VaKZUka9tywRiTWQa+KjfYHQ9bY37ACZrRSCVk2BZHUTmPOZslxc0FXkQxppjCd2QtrJwMfBLQw5huXMLEBif1MKmcMqa0SBSYaYL/0CUEb6zS+IkpWLMogiaGrQT8SWX3oirD1C56ren+twvcn4limdjEEh5pUEFTm6WKGYqKYqYG2C/NmGgLGBqqqut5G+TbAZSMy+VY1Bks1GOI0haFHQUTfNxyxXjeoCi7FOxCYbhg9C93X89EabgiO2kmxqDVTGLA8gS6U9wwSSF8ksnccqb6qrSBTzp3MHq5VUzC+gJWqoXtQtBagjH7eMLrS+p1Aua7YPQPRPkbCizIyOxSqV2JTTCyToNa+h2lYiYKDFxQMqzWqOVUEhq4YTxFUIKxFhakmdSnS+qNjjcplsVc1NMs+YCHF1Gy9p+2EOZyofavCHKJoio4foxzlAqCLvHu0XyyZ6KMDxQcaiNAFN7VydMoCm3QzjVB+l3gWNLhhXof3R5sUI5KbPymtRcVKOzsMpbgnGrkYQIezrp9nTqK8ocCPQdR5bmoBCwnZwUhCB4f7mecBjEK6GU0s+qDldiHPwI1KAreLesJnIV3FvkCBQOgGyPlJ+6O60P0VH1wkG13lS8JXSqZCmfJFzxdKJ4PZ6KYWHSRg0DFdeAg33Z5lMKJvagq8zfgzVuLDWxeoSivVmy6tvbmW6ZR3vuSEEFFUVOTbrR4rnz2BUt96QLf/ZrxJUHFHAqPGuDNO6g4CTdYt1BUgeqYv+GUK0j2FkKY5diCw8SaV1hElOGZ8iUhwAqhQ1zPm70oyACWuJmoeaROybcvnhp31D7Fm2dsMAG5JPF61hKbBlxRLDLh+5MRXFeMEk9j1oHzJ4CyqgSIspvYH0OENR7DgH6XKRG/vsDb3+fcnonSba3iWE37dWWrjJGTG4YBRVY9FCLGvZW7lTCxHN1hnjbxgP5pVtKY3k3DsMIc6ZaJMXoFi6vngeHBpn5gs1A9zjk3OmRPWVWnnLFlk4Kly3LfU1TgnuV+qIB5UXGad1xURE1TQrssjk2ssSi89E97eP4lUn+8cP9qzIu6UHCPo5UvDvGFnL6Sc099+ylRxUpN692l79PrRb1k30+KqkOmoYqHM0N8gqj3IyXDN0V1Wmqhk83na4KK/sLsB4Ptuq68tMoTuamd0l+g6Tr+jb8nCYIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCOJ/y58ow3Z4Sc3OfAAAAABJRU5ErkJggg==";
    const flutterWaveLogo = "https://logotyp.us/file/flutterwave.svg";
    // 💡 USE CONTEXT VALUE FOR EVERYTHING
    const { selectedPaymentMethod, setSelectedPaymentMethod } = useCheckout();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, [])

    if (!mounted) {
        return (
            <div className="w-[350px] h-[280px] bg-gray-100  animate-pulse  rounded-md"></div>
        );
    }

    return (
        <div className="lg:w-[390px] w-[350px] h-[269px] shadow-md rounded-md border border-gray-200 p-4  font-poppins">
            <h1 className="text-[17px] font-semibold opacity-75 mb-4">Payment Method</h1>
            <div className="space-y-4 w-full flex items-center flex-col">

                {/* Paystack Option */}
                <div
                    // 💡 Use Context state for conditional styling
                    className={`w-full flex items-center justify-between border px-6 py-3 rounded-lg cursor-pointer ${selectedPaymentMethod === "paystack" ? "border-primaryhover bg-pink-50" : "border-gray-300 bg-gray-50 opacity-50"
                        }`}
                    onClick={() => setSelectedPaymentMethod("paystack")}
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="payment"
                            // 💡 Use Context state for radio check
                            checked={selectedPaymentMethod === "paystack"}
                            onChange={() => setSelectedPaymentMethod("paystack")}
                            className=" accent-primaryhover"
                        />
                        <label className="text-[14px]">Paystack</label>
                    </div>
                    <Image src={payStackLogo} alt="Paystack" width={50} height={50} className="bg-transparent object-contain" />
                </div>

                {/* Flutterwave Option */}
                <div
                    // 💡 Use Context state for conditional styling
                    className={`w-full flex items-center justify-between border px-6 py-3 rounded-lg cursor-pointer ${selectedPaymentMethod === "flutter" ? "border-primaryhover bg-pink-50" : " border-gray-300 bg-gray-50 opacity-50"
                        }`}
                    onClick={() => setSelectedPaymentMethod("flutter")}
                >
                    <div className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="payment"
                            // 💡 Use Context state for radio check
                            checked={selectedPaymentMethod === "flutter"}
                            onChange={() => setSelectedPaymentMethod("flutter")}
                            className=" accent-primaryhover"
                        />
                        <label className="text-[14px]">Flutterwave</label>
                    </div>
                    <Image src={flutterWaveLogo} alt="Flutterwave" width={70} height={70} />
                </div>
            </div>
        </div>
    );
}

