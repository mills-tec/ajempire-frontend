import CouponsTab from "../../components/CouponsTab";
import FlashDealCard from "../../components/FlashDealCard";
type Deal = {
    id: string | number;
    title: string;
    description?: string;
    discountPercent: number;
    validUntil?: string;
    code: string;
    ctaText?: string;
    status: "unused" | "used" | "expired";
};

export default function UsedCouPon() {
    const usedDeals: Deal[] = [
        {
            id: 3,
            title: "25% off Beauty Products",
            description: "Already used on 10-10-2025",
            discountPercent: 25,
            validUntil: "01-08-2025",
            code: "BEAUTY25",
            ctaText: "Used",
            status: "used",
        },
        {
            id: 4,
            title: "15% off Electronics",
            description: "Already used on 09-09-2025",
            discountPercent: 15,
            validUntil: "01-07-2025",
            code: "TECH15",
            ctaText: "Used",
            status: "used",
        },
    ];
    return (
        <div className="w-full  lg:block  font-poppins">
            <CouponsTab />
            <div className="mt-8 flex items-center gap-4">
                <div className="w-[300px] h-[40px] border-2 border-gray-300 px-3 rounded-md focus-within:border-brand_solid_gradient transition-all duration-200">
                    <input
                        type="text"
                        placeholder="Enter Coupon Code"
                        className="w-full h-full bg-transparent text-[12px] border-none outline-none"
                    />
                </div>
                <button className="bg-[#D3D3D3] w-[100px] h-[40px] rounded-full hover:bg-brand_solid_gradient hover:text-white transition-all duration-200">
                    <p className="text-[14px]">Apply</p>
                </button>
            </div>

            <div className="mt-11 text-[15px] flex flex-col gap-4">
                <p>Special offers for you</p>
                <FlashDealCard deals={usedDeals} />
            </div>
        </div>
    )
}