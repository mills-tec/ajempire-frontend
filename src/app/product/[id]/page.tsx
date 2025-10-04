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
    <section className="lg:flex px-4 lg:px-[3.5rem] pb-[10rem] space-x-20">
      <div className="lg:w-1/2 h-full space-y-8">
        <div className="space-y-4">
          <div className="relative w-full h-[20rem] lg:h-[38rem] rounded-sm overflow-clip">
            <Image
              src={Product1}
              alt="product image"
              fill
              className="absolute object-cover"
            />
          </div>
          <div className="flex gap-2 lg:gap-5">
            <div className="size-[3rem] lg:size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product1}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="size-[3rem] lg:size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product2}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="size-[3rem] lg:size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product3}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="size-[3rem] lg:size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
              <Image
                src={Product4}
                alt="product image"
                fill
                className="absolute object-cover"
              />
            </div>
          </div>
        </div>
        <div className="lg:hidden">
          <ProductDescription />
        </div>

        <div className="lg:hidden">
          <ProductReview />
        </div>

        <div>
          <div className="hidden lg:block">
            <ProductReview />
          </div>
          <CommentCard />
        </div>
      </div>
      <div className="w-1/2 h-full hidden lg:block">
        <ProductDescription />
      </div>
    </section>
  );
}
