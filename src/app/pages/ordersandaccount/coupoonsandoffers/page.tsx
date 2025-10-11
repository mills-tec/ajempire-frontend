import CouponsTab from "../components/CouponsTab";
import FlashDealCard from "../components/FlashDealCard";

export default function CouponsAndOffers() {
    return (
        <div className="w-full mt-5  lg:block lg:px-5 font-poppins">
            <CouponsTab />

            <div className="mt-8 flex items-center  gap-4">
                <div className="w-[300px] h-[40px] border-2 border-gray-300 px-3 rounded-md focus-within:border-brand_solid_gradient transition-all duration-200">
                    <input type="text" placeholder="Enter Coupon Code" className="w-full h-full bg-transparent text-[12px] border-none outline-none" />
                </div>
                <button className="bg-[#D3D3D3] w-[100px] h-[40px] rounded-full hover:bg-brand_solid_gradient hover:text-white transition-all duration-200">
                    <p className=" text-[14px]">Apply</p>
                </button>
            </div>
            <div className="mt-11 text-[15px] flex flex-col gap-4">
                <p>Special offers for you</p>
                <FlashDealCard />
            </div>
        </div>
    )
}