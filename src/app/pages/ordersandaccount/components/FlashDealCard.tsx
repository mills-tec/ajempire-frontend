"use client";
import { useState } from "react";

interface Deal {
    id: string | number;
    title: string;
    description?: string;
    validUntil?: string;
    status: "unused" | "used" | "expired";
    code: string;
    ctaText?: string;
    discountPercent: number;
}

type Props = {
    deals?: Deal[];
};

export default function FlashDealCard({ deals = [] }: Props) {
    // 🎨 Color themes
    const themes = [
        {
            bg: "bg-[#FFE6F4]", // pink background
            accent: "bg-[#FF008C]", // pink accent
            text: "text-[#FF008C]", // pink text
        },
        {
            bg: "bg-[#F6E6FF]", // purple background
            accent: "bg-[#A600FF]", // purple accent
            text: "text-[#A600FF]", // purple text
        },
    ];

    // 🩶 Gray theme for used / expired
    const grayTheme = {
        bg: "bg-[#D3D3D3]",
        text: "text-[#737373]",
        accent: "bg-[#737373]",
    };

    const handleGetCode = (dealCode: string) => {
        navigator.clipboard.writeText(dealCode);
        alert(`Coupon code ${dealCode} copied!`);
    };

    return (
        <div className="space-y-4">
            {deals.map((coupon, index) => {

                const theme =
                    coupon.status === "unused"
                        ? themes[index % themes.length]
                        : grayTheme;

                return (
                    <div
                        key={coupon.id}
                        className={`font-poppins text-[14px] w-full flex items-center justify-between lg:p-5 p-3 rounded-md ${theme.bg}`}
                    >
                        <div>

                            <p className={`lg:text-[15px] text-[13px] `}>
                                {coupon.title}
                            </p>

                            <div
                                className={`lg:text-[13px] text-[11px] mt-1 opacity-80 `}
                            >
                                <p>{coupon.description}</p>
                                <p>{coupon.validUntil}</p>
                            </div>

                            {/* show Get button only for unused */}
                            {coupon.status === "unused" ? (
                                <button
                                    onClick={() => handleGetCode(coupon.code)}
                                    className={`mt-2 text-white ${theme.accent} w-auto p-2 px-4 text-center flex items-center h-[30px] rounded-full transition-all duration-200 hover:opacity-90`}
                                >
                                    {coupon.ctaText}
                                </button>
                            ) : (
                                // gray inactive button for used/expired
                                <button
                                    disabled
                                    className={`mt-2 ${theme.accent} ${theme.text} bg-opacity-30 w-auto p-2 px-4 text-center flex items-center h-[30px] rounded-full text-white transition-all duration-200`}
                                >
                                    {coupon.ctaText}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            <p
                                className={`${theme.accent} text-white p-1 rounded-sm text-[11px] lg:text-[13px]`}>
                                FLASH DEAL
                            </p>
                            <p
                                className={`${theme.text} lg:text-[50px] text-[35px] font-semibold flex items-center justify-end gap-2`}
                            >
                                {coupon.discountPercent}%{" "}
                                <span className="lg:text-[30px] text-[15px] font-normal">
                                    off
                                </span>
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
