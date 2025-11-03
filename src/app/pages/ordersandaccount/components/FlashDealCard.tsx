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
    const themes = [
        {
            bg: "bg-[#FFE6F4]", // pink
            accent: "bg-[#FF008C]",
            text: "text-[#FF008C]",
        },
        {
            bg: "bg-[#F6E6FF]", // purple
            accent: "bg-[#A600FF]",
            text: "text-[#A600FF]",
        },
    ];

    const handleGetCode = (dealCode: string) => {
        navigator.clipboard.writeText(dealCode);
        alert(`Coupon code ${dealCode} copied!`);
    };

    return (
        <div className="space-y-4">
            {deals.map((coupon, index) => {
                const theme = themes[index % themes.length];
                const isInactive = coupon.status !== "unused"; // used or expired

                return (
                    <div
                        key={coupon.id}
                        className={`font-poppins text-[14px] w-full flex items-center justify-between lg:p-5 p-3 rounded-md ${isInactive ? "bg-[#E9E9E9]" : theme.bg
                            }`}
                    >
                        <div>
                            {/* Used */}
                            {coupon.status === "used" && (
                                <div className="flex items-center gap-2 mb-1">
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 32 32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g clipPath="url(#clip0_1335_22850)">
                                            <path
                                                d="M8.53307 15.9997L14.9331 21.3331L23.4664 10.6664M15.9997 30.9331C14.0387 30.9331 12.0968 30.5468 10.285 29.7963C8.47321 29.0459 6.82697 27.9459 5.44028 26.5592C4.05359 25.1725 2.95361 23.5263 2.20314 21.7145C1.45267 19.9027 1.06641 17.9608 1.06641 15.9997C1.06641 14.0387 1.45267 12.0968 2.20314 10.285C2.95361 8.47321 4.05359 6.82697 5.44028 5.44028C6.82697 4.05359 8.47321 2.95361 10.285 2.20314C12.0968 1.45267 14.0387 1.06641 15.9997 1.06641C19.9603 1.06641 23.7587 2.63974 26.5592 5.44028C29.3597 8.24082 30.9331 12.0392 30.9331 15.9997C30.9331 19.9603 29.3597 23.7587 26.5592 26.5592C23.7587 29.3597 19.9603 30.9331 15.9997 30.9331Z"
                                                stroke="#737373"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1335_22850">
                                                <rect width="32" height="32" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p className="lg:text-[15px] text-[13px]">{coupon.title}</p>
                                </div>
                            )}

                            {/* Expired */}
                            {coupon.status === "expired" && (
                                <div className="flex items-center gap-2 mb-1">
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 32 32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M20.272 17.6005L16.75 15.5665V8.5C16.75 8.30109 16.671 8.11032 16.5303 7.96967C16.3897 7.82902 16.1989 7.75 16 7.75C15.8011 7.75 15.6103 7.82902 15.4697 7.96967C15.329 8.11032 15.25 8.30109 15.25 8.5V16C15.25 16.1316 15.2847 16.261 15.3505 16.375C15.4163 16.489 15.511 16.5837 15.625 16.6495L19.522 18.8995C19.607 18.9493 19.7011 18.9817 19.7988 18.9949C19.8964 19.008 19.9957 19.0017 20.0909 18.9761C20.1861 18.9506 20.2752 18.9064 20.3532 18.8461C20.4311 18.7858 20.4963 18.7107 20.545 18.625C20.6446 18.4529 20.6718 18.2483 20.6206 18.0562C20.5694 17.8641 20.444 17.7002 20.272 17.6005ZM16 1C7.7155 1 1 7.7155 1 16C1 24.2845 7.7155 31 16 31C24.28 30.991 30.991 24.28 31 16C31 7.7155 24.2845 1 16 1ZM16 29.5C14.2272 29.5 12.4717 29.1508 10.8338 28.4724C9.19588 27.7939 7.70765 26.7995 6.45406 25.5459C5.20047 24.2923 4.20606 22.8041 3.52763 21.1662C2.84919 19.5283 2.5 17.7728 2.5 16C2.5 14.2272 2.84919 12.4717 3.52763 10.8338C4.20606 9.19588 5.20047 7.70765 6.45406 6.45406C7.70765 5.20047 9.19588 4.20606 10.8338 3.52763C12.4717 2.84919 14.2272 2.5 16 2.5C19.5792 2.50397 23.0107 3.92756 25.5416 6.45844C28.0724 8.98932 29.496 12.4208 29.5 16C29.5 19.5804 28.0777 23.0142 25.5459 25.5459C23.0142 28.0777 19.5804 29.5 16 29.5Z"
                                            fill="#737373"
                                        />
                                    </svg>
                                    <p className="lg:text-[15px] text-[13px]">{coupon.title}</p>
                                </div>
                            )}

                            {/* Default (Unused) */}
                            {coupon.status === "unused" && (
                                <p className="lg:text-[15px] text-[13px]">{coupon.title}</p>
                            )}

                            <div
                                className={`lg:text-[13px] text-[11px] mt-1 opacity-80 ${isInactive ? "px-10" : "p-0"
                                    }`}
                            >
                                <p>{coupon.description}</p>
                                <p>{coupon.validUntil}</p>
                            </div>

                            {/* Buttons */}
                            {coupon.status === "unused" && (
                                <button
                                    onClick={() => handleGetCode(coupon.code)}
                                    className={`mt-2 text-white ${theme.accent} w-auto p-2 px-4 text-center flex items-center h-[30px] rounded-full transition-all duration-200 hover:opacity-90`}
                                >
                                    {coupon.ctaText}
                                </button>
                            )}

                            {isInactive && (
                                <div className="px-10">
                                    <button
                                        disabled
                                        className={`mt-2 text-white bg-[#B0B0B0] w-auto p-2 px-4 text-center flex items-center h-[30px] rounded-full cursor-not-allowed`}
                                    >
                                        {coupon.status === "used" ? "Used" : "Expired"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end">
                            <p
                                className={`${isInactive ? "bg-[#B0B0B0]" : theme.accent
                                    } text-white p-1 rounded-sm text-[11px] lg:text-[13px]`}
                            >
                                FLASH DEAL
                            </p>
                            <p
                                className={`${isInactive ? "text-[#737373]" : theme.text
                                    } lg:text-[50px] text-[35px] font-semibold flex items-center justify-end gap-2`}
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
