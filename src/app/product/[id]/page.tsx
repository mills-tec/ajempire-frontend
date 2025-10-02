import Image from "next/image";
import React from "react";
import Product1 from "@/assets/product_det1.png";
import Product2 from "@/assets/product_det2.png";
import Product3 from "@/assets/product_det3.png";
import Product4 from "@/assets/product_det4.png";
import ProductReview from "@/app/components/ProductReview";
import CommentCard from "@/app/components/CommentCard";
import ProductDescription from "@/app/components/ProductDescription";

export default function ProductDetailPage() {
  return (
    <section className="flex px-[3.5rem] space-x-20">
      <div className="w-1/2 h-full space-y-8">
        <div className="space-y-4">
          <div className="relative w-full h-[38rem] rounded-sm overflow-clip">
            <Image
              src={Product1}
              alt="product image"
              fill
              className="absolute object-cover"
            />
          </div>
          <div className="grid grid-cols-5">
            <div className="size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product1}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product2}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product3}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product4}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
          </div>
        </div>

        <div>
          <ProductReview />
          <CommentCard />
        </div>
      </div>
      <div className="w-1/2 h-full">
        <ProductDescription />
      </div>
    </section>
  );
}
