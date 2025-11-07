import Image from "next/image";
import React from "react";

export default function OrderCard({
  title,
  variant,
  price,
  discount,
  qty,
  image,
}: {
  title: string;
  variant: string;
  price: number;
  discount: number;
  qty: number;
  image: string;
}) {
  return (
    <div className="flex gap-5 border-b pb-3 md:border-b-0 ">
     <div>
       <div className="w-[8.5rem] h-[6rem] bg-gray-400 rounded-lg overflow-clip">
        <Image src={image} alt={title} width={200} height={200} />
      </div>
     </div>
      <div className="space-y-1 mt-2 col-span-2 ">
        <h2 className="text-sm">{title}</h2>
        <h4 className="text-xs font-light">{variant}</h4>
        <div className="text-xs font-light grid md:grid-cols-3  gap-4 w-[200px]">
          <div className="md:col-span-2 flex justify-between">
            <p className="font-semibold">
              ₦{(discount ? discount : price).toFixed(2)}
            </p>

            <p className="text-black/50 line-through">
              {discount ? `₦${price.toFixed(2)}` : ""}
            </p>
          </div>
          <p className="text-right text-sm">x{qty}</p>
        </div>
      </div>
    </div>
  );
}
