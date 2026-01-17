export default function FlashSaleNotificationCom() {
    return (
        <div className="flex justify-between border border-gray-300 rounded-md p-4 font-poppins">
            <div className="flex items-center gap-4">
                <div>
                    <img src="/images/item1.png" alt="" />
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-[#2B2B2B] text-[16px]" >Nail and  Cosmetics kit</p>
                    <p className="text-[13px] text-primaryhover capitalize">Big sale</p>
                    <div className="flex items-center gap-2">
                        <p className="bg-[#FFD9EE] w-[38px] h-[20px] text-center flex items-center justify-center text-[11.11px] border border-primaryhover rounded-sm">-50%</p>
                        <p className="text-[#2B2B2B] text-[11.11px]">$2,621</p>
                        <p className="text-[#2B2B2B] text-[11.11px]">$2,621</p>
                    </div>
                    <button className="bg-brand_solid_gradient w-[92px] h-[20px] text-[13px] text-white rounded-sm">Shop Now</button>
                </div>
            </div>
            <div className="flex  items-end">
                <p className="w-[69px] h-[20px] text-primaryhover text-[13.33px] bg-[#FFD9EE] text-center rounded-sm">
                    02:15:00
                </p>
            </div>
        </div>
    )
}