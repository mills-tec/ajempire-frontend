import { getBearerToken } from "@/lib/api";
import { bunnyLoader } from "@/lib/bunnyLoader";
import { useCartStore } from "@/lib/stores/cart-store";
import { Product } from "@/lib/types";
import { calcDiscountPrice } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";

interface RecentPurchase {
  recentPurchases?: RecentPurchaseItem[];
}
interface RecentPurchaseItem {
  price: number;
  product: Product;
  qty: number;
  discountedPrice: number;
  variants?: {
    combinedVariant: string;
    options: { name: string; value: string; }[]
  }
}
export default function RecentPurchases({ recentPurchases }: RecentPurchase) {
  // const _url = process.env.NEXT_PUBLIC_BACKEND_URL +  "/api/reorder/";
  console.log(recentPurchases);
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
      const basePrice = purchase.product.price + (purchase.variants
        ? (purchase.product.variantCombinations?.find(
          vc => vc._id === purchase.variants?.combinedVariant
        )?.additionalPrice ?? 0)
        : 0);
      const finalPrice = product.flashSales
        ? calcDiscountPrice(
          basePrice,
          product.flashSales.discountValue,
          product.flashSales.discountType,
        )
        : basePrice;

      // Item not in cart → add fresh
      // addItem({ quantity: purchase.qty, ...product! });

      const selectedVariant = purchase.product.variantCombinations?.find(
        vc => vc._id === purchase.variants?.combinedVariant
      );
      addItem([
        {
          ...product,
          basePrice,
          discount: product.flashSales
            ? calcDiscountPrice(
              basePrice,
              product.flashSales.discountValue,
              product.flashSales.discountType,
            )
            : 0,
          stock: purchase.variants ? selectedVariant?.stock : product.stock,
          quantity: purchase.qty,
          selected: true,
          selectedVariants: purchase.variants ? purchase.variants.options : [],
          finalPrice,
        },
      ]);
      toast.success("Item added to cart successfully");
    }
  };

  return (
    <div className="w-full">
      <p className="mb-5"> Recent Purchases </p>
      <div className="flex flex-col gap-5 lg:w-[45%]">
        {recentPurchases &&
          recentPurchases.length > 0 &&
          recentPurchases.map((purchase, index) => {


            return <div
              key={index}
              className="w-full flex items-center gap-2  border border-gray-300 rounded-md  p-3 text-[14px] font-extralight"
            >
              <div className="relative w-[30%] h-[100px]">
                <Image
                loader={bunnyLoader}
                  fill
                  src={purchase?.product.cover_image ?? "/placeholder.jpg"}
                  alt={purchase?.product.name ?? "Product image"}
                   sizes="(max-width: 640px) 50vw,
         (max-width: 1024px) 33vw,
         25vw"
                  className="object-cover"
                />
              </div>
              <div className="w-[70%] flex flex-col ">
                <p>{purchase.product.name}</p>
                {purchase.variants &&
                  purchase.variants.options.map((variant, idx) => (
                    <div key={idx} className="flex items-center gap-2 opacity-70 text-[13px]">
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
                        purchase.product.price + (purchase.variants
                          ? (purchase.product.variantCombinations?.find(
                            vc => vc._id === purchase.variants?.combinedVariant
                          )?.additionalPrice ?? 0)
                          : 0),
                        purchase.product.flashSales.discountValue!,
                        purchase.product.flashSales.discountType!,
                      )
                      : purchase.product.price + (purchase.variants
                        ? (purchase.product.variantCombinations?.find(
                          vc => vc._id === purchase.variants?.combinedVariant
                        )?.additionalPrice ?? 0)
                        : 0),
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
          })}
      </div>
    </div>
  );
}
