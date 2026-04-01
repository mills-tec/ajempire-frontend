import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { calcDiscountPrice } from "@/lib/utils";

const RecentlyViewedMobile = ({ products }: { products: Product[] }) => {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex gap-4">
        {products.map((product) => (
          <Link
            key={product._id}
            href={`/product/${product._id}`}
            className="relative w-40 flex-shrink-0 rounded-lg bg-white shadow-md transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="absolute left-2 top-2 rounded-full bg-pink-500 px-2 py-1 text-xs text-white">
              Only {product.stock} left
            </div>

            <div className="relative h-32 w-full">
              <Image
                src={product.cover_image || "/placeholder.png"}
                alt={product.name}
                fill
                className="rounded-t-lg object-cover"
                sizes="160px"
              />
            </div>

            <div className="p-2 text-center text-sm font-semibold text-pink-600">
              {Number(
                calcDiscountPrice(
                  product.price,
                  product.flashSales?.discountValue || 0,
                  product.flashSales?.discountType || "percent",
                ),
              ).toLocaleString("en-NG", {
                style: "currency",
                currency: "NGN",
              })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedMobile;
