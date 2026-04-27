import { getBearerToken } from "@/lib/api";
import { CartItem, useCartStore } from "@/lib/stores/cart-store";
import { Product } from "@/lib/types";
import { calcDiscountPrice } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

interface RecentPurchase {
  recentPurchases?: RecentPurchaseItem[];
}
interface RecentPurchaseItem {
  product: Product;
  qty: number;
}
export default function RecentPurchases({ recentPurchases }: RecentPurchase) {
  const url = "https://ajempire-backend-production.up.railway.app/api/reorder/";
  const { addItem, getItem, setQuantity } = useCartStore();

  const handleReorder = async (purchase: RecentPurchaseItem) => {
    if (!purchase.product._id) {
      console.error("Purchase _id is missing!", purchase);
      return;
    }
    const product = purchase.product;
    const token = getBearerToken();
    if (!token) return toast.error("Please log in to reorder");

    const cartItem = getItem(purchase.product._id);
    if (cartItem) {
      // Item already in cart → increment qty
      setQuantity(product._id, cartItem.quantity + purchase.qty);
      toast.success("Item quantity incremented");
    } else {
      console.log(product);
      // Item not in cart → add fresh
      // addItem({ quantity: purchase.qty, ...product! });
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        flashSales: product.flashSales,
        cover_image: product.cover_image,
        description: product.description,
        quantity: purchase.qty,
        selectedVariants: [],
        selected: true, // IMPORTANT
      });
      toast.success("Item added to cart successfully");
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
                  src={purchase?.product.cover_image}
                  alt=""
                  className="w-[100px] h-[100px] object-cover"
                />
              </div>
              <div className="w-[70%] flex flex-col ">
                <p>{purchase.product.name}</p>
                {purchase.product.variants &&
                  purchase.product.variants.map((variant) => (
                    <div className="flex items-center gap-2 opacity-70 text-[13px]">
                      <p>{variant.name}:</p>
                      <p>{variant.value}</p>
                    </div>
                  ))}

                <div className="flex items-center gap-2 opacity-70 text-[13px]">
                  <p>Quantity:</p>
                  <p>{purchase.qty}</p>
                </div>
                <p className="text-primaryhover">
                  {Number(
                    purchase.product.flashSales
                      ? calcDiscountPrice(
                          purchase.product.price,
                          purchase.product.flashSales.discountValue!,
                          purchase.product.flashSales.discountType!,
                        )
                      : purchase.product.price,
                  ).toLocaleString("en-ng", {
                    style: "currency",
                    currency: "NGN",
                  })}
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
