import { getBearerToken } from "@/lib/api";
import { CartItem, useCartStore } from "@/lib/stores/cart-store";
import axios from "axios";
import { toast } from "sonner";

interface RecentPurchase {
    recentPurchases?: any[];
}
interface RecentPurchaseItem {
    _id: string;
    name: string;
    discountedPrice: number;
    qty: number;
    image?: string;
    variants?: string[];
}
export default function RecentPurchases({ recentPurchases }: RecentPurchase) {
    const url = "https://ajempire-backend.vercel.app/api/reorder/";
    const { addItem, getItem, setQuantity } = useCartStore();



    const handleReorder = async (purchase: RecentPurchaseItem) => {
        if (!purchase._id) {
            console.error("Purchase _id is missing!", purchase);
            return;
        }

        const token = getBearerToken();
        if (!token) return toast.error("Please log in to reorder");

        const cartItem = getItem(purchase._id);
        console.log(purchase)

        if (cartItem) {
            // Item already in cart → increment qty
            setQuantity(
                purchase._id,
                cartItem.quantity + purchase.qty
            );
        } else {
            // Item not in cart → add fresh
            addItem(purchase as any);
            // addItem({
            //     _id: purchase._id,
            //     name: purchase.name,
            //     price: purchase.discountedPrice,
            //     quantity: purchase.qty,
            //     cover_image: purchase.image!,
            //     selectedVariants: [],
            //     selected: true, // ✅ REQUIRED
            // });
        }

        try {
            const res = await axios.post(
                `https://ajempire-backend.vercel.app/api/reorder/${purchase._id}`,
                {
                    quantity: purchase.qty,
                    variants: purchase.variants ?? [],
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log("Reorder successful:", res.data.message);
            toast.success(res.data.message || "Item reordered successfully");
        } catch (err) {
            console.error("Error reordering item:", err);
            toast.error("Could not reorder item");
        }
    };


    return (
        <div className="w-full">
            <p className="mb-5"> Recent Purchases </p>
            <div className="flex flex-col gap-5 lg:w-[45%]">
                {recentPurchases &&
                    recentPurchases.length > 0 &&
                    recentPurchases.map((purchase, index) => (
                        <div
                            key={index}
                            className="w-full flex items-center gap-2  border border-gray-300 rounded-md  p-3 text-[14px] font-extralight"
                        >
                            <div className="w-[30%]">

                                <img
                                    src={purchase?.image}
                                    alt=""
                                    className="w-[100px] h-[100px] object-cover"
                                />
                            </div>
                            <div className="w-[70%] flex flex-col ">
                                <p>{purchase.name}</p>
                                {purchase.variants &&
                                    purchase.variants.map((variant: string) => (
                                        <div className="flex items-center gap-2 opacity-70 text-[13px]">
                                            <p>Property:</p>
                                            <p>{variant}</p>
                                        </div>
                                    ))}

                                <div className="flex items-center gap-2 opacity-70 text-[13px]">
                                    <p>Quntity:</p>
                                    <p>{purchase.qty}</p>
                                </div>
                                <p className="text-primaryhover">
                                    ₦ {purchase.discountedPrice}
                                </p>
                                <div className="text-end">
                                    <button
                                        className="bg-gray-300 py-[2px] rounded-md text-[12px] w-[70px] font-extralight hover:bg-primaryhover hover:text-white transition-all duration-200"
                                        onClick={() => handleReorder(purchase)}
                                    >
                                        Reorder
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
