"use client";
import { useIssueReturn } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import { CloseIcon } from "@/components/svgs/CloseIcon";

import { IReturnRequest } from "@/lib/types";
import Image from "next/image";

import Skeleton from "@/components/ui/Skeleton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import OrderTabs from "../../components/OrderTabs";

const ClockIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`size-5 ${active ? "fill-[#0085FF]" : "fill-black/45"}`}>
        <g clipPath="url(#ret-clock)">
            <path d="M24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12ZM12 5.25C12 5.05109 11.921 4.86032 11.7803 4.71967C11.6397 4.57902 11.4489 4.5 11.25 4.5C11.0511 4.5 10.8603 4.57902 10.7197 4.71967C10.579 4.86032 10.5 5.05109 10.5 5.25V13.5C10.5 13.6322 10.535 13.762 10.6014 13.8764C10.6678 13.9907 10.7632 14.0854 10.878 14.151L16.128 17.151C16.3003 17.2441 16.5022 17.2661 16.6905 17.2124C16.8788 17.1586 17.0386 17.0333 17.1358 16.8633C17.2329 16.6933 17.2597 16.492 17.2104 16.3024C17.1612 16.1129 17.0397 15.9502 16.872 15.849L12 13.065V5.25Z" />
        </g>
        <defs><clipPath id="ret-clock"><rect width="24" height="24" fill="white" /></clipPath></defs>
    </svg>
);


const TruckIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" className={`size-5 ${active ? "fill-purple-600" : "fill-black/45"}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" />
        <g clipPath="url(#ret-truck)">
            <path d="M4 7V8H13.5V15.5H10.422C10.199 14.6405 9.426 14 8.5 14C7.574 14 6.801 14.6405 6.578 15.5H6V13H5V16.5H6.578C6.801 17.3595 7.574 18 8.5 18C9.426 18 10.199 17.3595 10.422 16.5H14.578C14.801 17.3595 15.574 18 16.5 18C17.426 18 18.199 17.3595 18.422 16.5H20V12.422L19.9685 12.3435L18.9685 9.3435L18.86 9H14.5V7H4ZM4.5 9V10H9V9H4.5ZM14.5 10H18.1405L19 12.5625V15.5H18.422C18.199 14.6405 17.426 14 16.5 14C15.574 14 14.801 14.6405 14.578 15.5H14.5V10ZM5 11V12H8V11H5ZM8.5 15C9.0585 15 9.5 15.4415 9.5 16C9.5 16.5585 9.0585 17 8.5 17C7.9415 17 7.5 16.5585 7.5 16C7.5 15.4415 7.9415 15 8.5 15ZM16.5 15C17.0585 15 17.5 15.4415 17.5 16C17.5 16.5585 17.0585 17 16.5 17C15.9415 17 15.5 16.5585 15.5 16C15.5 15.4415 15.9415 15 16.5 15Z" fill="white" />
        </g>
        <defs><clipPath id="ret-truck"><rect width="16" height="16" fill="white" transform="translate(4 4)" /></clipPath></defs>
    </svg>
);

const CheckCircleIcon = ({ active }: { active: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`size-5 ${active ? "fill-green-500" : "fill-black/45"}`} xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12ZM11.3152 17.136L18.224 8.4992L16.976 7.5008L11.0848 14.8624L6.912 11.3856L5.888 12.6144L11.3152 17.136Z" />
    </svg>
);

const StepDash = () => (
    <svg width="1" height="97" viewBox="0 0 1 97" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="0.5" y1="2.18557e-08" x2="0.499996" y2="97" stroke="black" strokeDasharray="6 6" />
    </svg>
);

const STATUS_STEPS = [
    { key: "processing", label: "Return Processing", desc: "Your request is under review",    Icon: ClockIcon,       activeColor: "text-[#0085FF]" },
    { key: "approved",   label: "Return Approved",   desc: "Your return has been approved",   Icon: CheckCircleIcon, activeColor: "text-green-500"  },
    { key: "delivered",  label: "Return Delivered",  desc: "Items are being shipped back",    Icon: TruckIcon,       activeColor: "text-purple-600" },
    { key: "refunded",   label: "Return Completed",  desc: "Return successfully received",    Icon: CheckCircleIcon, activeColor: "text-green-500"  },
];
const _STATUS_ORDER = ["processing", "approved", "delivered", "refunded"];

export default function Status() {
    const { getReturnRequest } = useIssueReturn();
    const [data, setData] = useState<IReturnRequest>({
        _id: "",
        reason: "",
        itemUsed: false,
        imageEvidence: "",
        phoneNumber: "",
        order: { _id: "", order_id: "" },
        user: "",
        product: [{
            _id: "", product: "", name: "", qty: 0, price: 0,
            discountedPrice: 0, image: "", variants: { options: [] },
        }],
        status: "processing",
        statusUpdatedAt: [],
        total: 0,
        createdAt: "",
        updatedAt: "",
        __v: 0,
    });
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [imageOpen, setImageOpen] = useState(false);


   
    useEffect(() => {
        (async () => {
            const req = await getReturnRequest(params?.id as string);
            if (req.status) {
                setData(req.message);
                console.log(req.message);
            }
            setLoading(false);
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isRejected = data.status === "rejected";

    const statusBadgeClass =
        data.status === "processing" ? "bg-blue-50 text-[#0085FF] border border-blue-200" :
        data.status === "approved"   ? "bg-green-50 text-green-500 border border-green-200" :
        data.status === "delivered"  ? "bg-purple-50 text-purple-600 border border-purple-200" :
        data.status === "refunded"   ? "bg-green-50 text-green-500 border border-green-200" :
        data.status === "rejected"   ? "bg-red-50 text-red-700 border border-red-200" :
                                       "bg-gray-100 text-gray-600 border border-gray-200";

    const fmtDate = (iso: string) =>
        iso ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";

    const getStepDate = (stepKey: string) => {
        const entry = data.statusUpdatedAt?.find((s) => s.status === stepKey);
        return entry ? fmtDate(entry.updatedAt) : null;
    };

    const totalStr = Number(data.total).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="flex flex-col gap-4">
            {loading ? (
                <>
                    <Skeleton height={44} borderRadius={8} className="w-full" />
                    <section className="grid grid-cols-1 md:grid-cols-3 md:gap-5 rounded-2xl p-5 md:p-8 bg-white gap-10">
                        <div className="flex flex-col gap-5 order-2 md:order-1">
                            <div className="flex flex-col gap-2">
                                <Skeleton height={20} borderRadius={4} className="w-1/2 mb-3 hidden md:block" />
                                <Skeleton height={14} borderRadius={4} className="w-2/5" />
                                <Skeleton height={14} borderRadius={4} className="w-3/5" />
                                <Skeleton height={14} borderRadius={4} className="w-2/5" />
                                <Skeleton height={16} borderRadius={4} className="w-1/2 mt-8" />
                            </div>
                            <div className="flex flex-col gap-4">
                                {[0, 1].map((i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                        <Skeleton width={64} height={64} borderRadius={8} />
                                        <div className="flex flex-col gap-2 flex-1">
                                            <Skeleton height={14} borderRadius={4} className="w-3/4" />
                                            <Skeleton height={12} borderRadius={4} className="w-1/2" />
                                            <Skeleton height={12} borderRadius={4} className="w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-4">
                                {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="flex gap-5 items-start">
                                        <div className="flex flex-col items-center gap-1">
                                            <Skeleton width={24} height={24} borderRadius={12} />
                                            <Skeleton width={2} height={24} borderRadius={1} />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Skeleton height={14} borderRadius={4} className="w-36" />
                                            <Skeleton height={12} borderRadius={4} className="w-28" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 h-[200px] md:order-2 order-1">
                            <Skeleton height={200} borderRadius={8} className="w-full" />
                        </div>
                    </section>
                </>
            ) : (
                <>
                    <OrderTabs showFilterTabs={false} text="Returns Status" handleSearchInputChange={() => { }} />

                    {/* Summary bar */}
                    <div className="bg-white rounded-2xl px-5 py-4 md:px-8 flex flex-wrap items-center justify-between gap-4 font-poppins">
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                            <div>
                                <p className="text-xs text-brand_gray mb-0.5">Order ID</p>
                                <p className="font-semibold text-gray-800">#{data.order.order_id}</p>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-gray-100" />
                            <div>
                                <p className="text-xs text-brand_gray mb-0.5">Submitted</p>
                                <p className="font-medium text-gray-700">{fmtDate(data.createdAt)}</p>
                            </div>
                            <div className="hidden sm:block w-px h-8 bg-gray-100" />
                            <div>
                                <p className="text-xs text-brand_gray mb-0.5">Items</p>
                                <p className="font-medium text-gray-700">{data.product.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-gray-800">₦{totalStr}</p>
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${statusBadgeClass}`}>
                                {data.status}
                            </span>
                        </div>
                    </div>

                    {/* Rejection alert */}
                    {isRejected && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 font-poppins">
                            <p className="text-red-700 text-sm font-medium">
                                Your return request was not approved. Please contact support if you have any questions.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

                        {/* Left column */}
                        <div className="flex flex-col gap-4 order-2 md:order-1">

                            {/* Return details */}
                            <div className="bg-white rounded-2xl p-5 md:p-6 font-poppins">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4">Return Details</h2>
                                <div className="flex flex-col gap-3 text-sm">
                                    <div className="flex justify-between gap-2">
                                        <span className="text-brand_gray shrink-0">Reason</span>
                                        <span className="text-gray-800 text-right capitalize">{data.reason}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-brand_gray shrink-0">Item Used</span>
                                        <span className="text-gray-800">{data.itemUsed ? "Yes" : "No"}</span>
                                    </div>
                                    {data.phoneNumber && (
                                        <div className="flex justify-between gap-2">
                                            <span className="text-brand_gray shrink-0">Phone</span>
                                            <span className="text-gray-800">{data.phoneNumber}</span>
                                        </div>
                                    )}
                                    {data.additionalNotes && (
                                        <div className="flex flex-col gap-1">
                                            <span className="text-brand_gray">Notes</span>
                                            <span className="text-gray-700 text-xs leading-relaxed">{data.additionalNotes}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold">
                                        <span className="text-gray-600">
                                            Total ({data.product.length} {data.product.length > 1 ? "items" : "item"})
                                        </span>
                                        <span className="text-gray-900">₦{totalStr}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="bg-white rounded-2xl p-5 md:p-6">
                                <h2 className="text-sm font-semibold text-gray-800 mb-4 font-poppins">Items Returned</h2>
                                <div className="flex flex-col divide-y divide-gray-50">
                                    {data.product.map((item, index) => (
                                        <OrderCard
                                            key={index}
                                            image={item.image}
                                            title={item.name}
                                            variant={
                                                item?.variants && item.variants.options.length > 0
                                                    ? `${item.variants.options[0].name}: ${item.variants.options[0].value}`
                                                    : ""
                                            }
                                            price={item.price - item.discountedPrice}
                                            discount={ 0 }
                                            qty={item.qty}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right column */}
                        <div className="md:col-span-2 flex flex-col gap-4 order-1 md:order-2">

                            {/* Status tracker */}
                            <div className="bg-white rounded-2xl p-5 md:p-8 font-poppins">
                                <h2 className="text-base font-semibold text-gray-800 mb-1">Return Progress</h2>
                                {data.statusMessage && (
                                    <p className="text-xs text-[#000000B2] leading-relaxed mb-6">{data.statusMessage}</p>
                                )}
                                {!data.statusMessage && <div className="mb-6" />}
                                <div className="flex flex-col">
                                    {STATUS_STEPS.map((step, i) => {
                                        const stepDate = getStepDate(step.key);
                                        const isCompleted = !isRejected && stepDate !== null;
                                        const isLast = i === STATUS_STEPS.length - 1;
                                        return (
                                            <div key={step.key} className="flex gap-6">
                                                <div className="flex flex-col items-center w-max">
                                                    <step.Icon active={isCompleted} />
                                                    {!isLast && <StepDash />}
                                                </div>
                                                {isCompleted ? (
                                                    <div className="space-y-1 pb-1">
                                                        <h2 className={`text-sm font-medium ${step.activeColor}`}>{step.label}</h2>
                                                        <h3 className="text-xs font-medium">{stepDate}</h3>
                                                        <p className="text-xs text-black/50">{step.desc}</p>
                                                    </div>
                                                ) : (
                                                    <h2 className="text-sm text-black/45 pt-0.5">{step.label}</h2>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Evidence image */}
                            <div
                                className="relative h-[260px]  md:h-[300px] rounded-2xl overflow-hidden cursor-pointer group"
                                onClick={() => setImageOpen(true)}
                            >
                                <span className="absolute top-3 left-3 z-10 text-xs text-white font-medium bg-black/40 rounded-full px-3 py-1 font-poppins">
                                    Evidence Photo
                                </span>
                                <Image
                                    src={data.imageEvidence}
                                    alt="Return evidence"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 66vw"
                                    loading="eager"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/55 transition-all duration-200 flex items-center justify-center ">
                                    <div className="flex flex-col items-center gap-2 text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <span className="text-sm font-medium">View Full Image</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {imageOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
                    onClick={() => setImageOpen(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                        onClick={() => setImageOpen(false)}
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                    <div
                        className="relative w-full max-w-4xl mx-4"
                        style={{ height: "85vh" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image src={data.imageEvidence} alt="Return evidence" fill className="object-contain" sizes="100vw" />
                    </div>
                </div>
            )}
        </div>
    );
}
