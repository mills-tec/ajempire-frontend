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

export default function ExpiredCoupons() {
    const expiredDeals: Deal[] = [
        {
            id: 5,
            title: "40% off Fashion Items",
            description: "Expired on 01-09-2025",
            discountPercent: 40,
            validUntil: "01-09-2025",
            code: "STYLE40",
            ctaText: "Expired",
            status: "expired",
        },
        {
            id: 6,
            title: "10% off Groceries",
            description: "Expired on 15-08-2025",
            discountPercent: 10,
            validUntil: "15-08-2025",
            code: "FOOD10",
            ctaText: "Expired",
            status: "expired",
        },
    ];
    return (
        <div className="w-fulllg:block  font-poppins">
            <CouponsTab />
            <div className="mt-11 text-[15px] flex flex-col gap-4">
                <p>Special offers for you</p>
                <FlashDealCard deals={expiredDeals} />
            </div>
        </div>
    )
}