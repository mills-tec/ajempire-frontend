import { P } from "framer-motion/dist/types.d-BJcRxCew";

interface RecentPurchase {
    recentPurchases?: any[];
}
export default function RecentPurchases({ recentPurchases }: RecentPurchase) {
    console.log("Recent Purchases Data:", recentPurchases);

    return (
        <div>
            <p className="mb-5"> Recent Purchases </p>
            <div className="flex flex-col gap-5 w-[45%]">
                {
                    recentPurchases && recentPurchases.length > 0 && (
                        recentPurchases.map((purchase, index) => (
                            <div key={index} className="w-full flex items-center  border border-gray-300 rounded-md  p-3 text-[14px] font-extralight">
                                <div className="w-[30%]">
                                    <img src={purchase?.image} alt="" className="w-[100px] h-[100px] object-cover" />
                                </div>
                                <div className="w-[70%] flex flex-col ">
                                    <p>{purchase.name}</p>
                                    {
                                        purchase.variants && purchase.variants.map((variant: string) => (
                                            <div className="flex items-center gap-2 opacity-70 text-[13px]">
                                                <p>Property:</p>
                                                <p>{variant}</p>
                                            </div>
                                        ))
                                    }

                                    <div className="flex items-center gap-2 opacity-70 text-[13px]">
                                        <p>Quntity:</p>
                                        <p>{purchase.qty}</p>
                                    </div>
                                    <p className="text-primaryhover">₦ {purchase.discountedPrice}</p>
                                    <div className="text-end">
                                        <button className="bg-gray-300  py-[2px] rounded-md text-[12px] w-[70px] font-extralight hover:bg-primaryhover hover:text-white transition-all duration-200">Reorder</button>
                                    </div>
                                </div>
                            </div>
                        )
                        ))
                }
            </div>
        </div>
    )
}