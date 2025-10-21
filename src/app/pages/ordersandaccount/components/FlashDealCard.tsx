"use client"
import { useState } from "react";

export default function FlashDealCard() {
    const mockDeals = [
        {
            id: 1,
            title: "Get discounted on your order in the next 24hrs",
            description: "Applicable on nail kits only",
            discountPercent: 30,
            validUntil: "01-06-2025",
            code: "NAIL30",
            ctaText: "Get"
        },
        {
            id: 2,
            title: "Get discounted on your order in the next 24hrs",
            description: "Valid on orders above ₦10,000",
            discountPercent: 20,
            validUntil: "01-06-2025",
            code: "BIG20",
            ctaText: "Get Code"
        },
        {
            id: 3,
            title: "Save more on your next order",
            description: "Applicable on all categories",
            discountPercent: 25,
            validUntil: "01-08-2025",
            code: "SAVE25",
            ctaText: "Grab Deals"
        },
    ];

    const [deals] = useState(mockDeals);

    // Define alternating color themes
    const themes = [
        {
            bg: "bg-[#FFE6F4]",      // pink background
            accent: "bg-[#FF008C]",  // accent for button & badge
            text: "text-[#FF008C]",  // text color
        },
        {
            bg: "bg-[#F6E6FF]",      // purple background
            accent: "bg-[#A600FF]",  // accent for button & badge
            text: "text-[#A600FF]",  // text color
        },
    ];

    const handleGetCode = (dealCode: string) => {
        navigator.clipboard.writeText(dealCode);
        alert(`Coupon code ${dealCode} copied!`);
    };

    return (
        <div className="space-y-4">
            {deals.map((coupon, index) => {
                const theme = themes[index % themes.length]; // alternate between pink & purple

                return (
                    <div
                        key={coupon.id}
                        className={`font-poppins text-[14px] w-full flex items-center justify-between lg:p-5 p-3 rounded-md ${theme.bg}`}
                    >
                        <div>
                            <p className="lg:text-[15px] text-[13px]">{coupon.title}</p>
                            <div className="lg:text-[13px]  text-[11px] mt-1 opacity-80">
                                <p className="">{coupon.description}</p>
                                <p>{coupon.validUntil}</p>
                            </div>
                            <button
                                onClick={() => handleGetCode(coupon.code)}
                                className={`mt-2 text-white lg:text-[14px] text-[10px] ${theme.accent} w-auto p-2 px-4 text-center flex items-center h-[30px] rounded-full transition-all duration-200 hover:opacity-90`}
                            >
                                {coupon.ctaText}
                            </button>
                        </div>

                        <div className="flex flex-col items-end">
                            <p className={`lg:w-[80px] w-auto text-end  ${theme.accent} p-1 rounded-sm text-white text-[11px] lg:text-[13px]`}>
                                FLASH DEAL
                            </p>
                            <p className={` lg:text-[50px] text-[35px] font-semibold flex items-center justify-end gap-2 ${theme.text}`}>
                                {coupon.discountPercent}% <span className=" lg:text-[30px] text-[15px]  font-normal">off</span>
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

