"use client";
import Image from "next/image";
import React from "react";
import ProductReview from "@/app/components/ProductReview";
import CommentCard from "@/app/components/CommentCard";
import ProductDescription from "@/app/components/ProductDescription";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/api";
import Spinner from "@/app/components/Spinner";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;
  console.log("Product ID from params:", id);

  const { data, isLoading } = useQuery(
    ["product", id],
    () => (id ? getProduct(id as string) : null),
    { enabled: !!id }
  );

  if (isLoading) <Spinner />;

  return (
    <section className="lg:flex px-4 lg:px-[3.5rem] pt-4 lg:pt-8 pb-[10rem] space-x-20">
      <div className="lg:w-1/2 h-full space-y-8">
        <div className="space-y-4">
          <div className="relative w-full h-[20rem] lg:h-[38rem] rounded-sm overflow-clip">
            <Image
              src={data?.message.product.cover_image || ""}
              alt="product image"
              fill
              className="absolute object-cover"
            />
          </div>
          <div className="flex gap-2 lg:gap-5">
            {data?.message.product.images.map((image) => (
              <div className="size-[3rem] lg:size-[6rem] overflow-clip relative bg-gray-400 rounded-xl">
                <Image
                  src={image}
                  alt="product image"
                  fill
                  className="absolute object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:hidden">
          {data?.message && <ProductDescription product_data={data} />}
        </div>

        <div className="lg:hidden">
          {data?.message && <ProductReview product={data?.message.product} />}
        </div>

        <div>
          <div className="hidden lg:block">
            {data?.message && <ProductReview product={data?.message.product} />}
          </div>
          {data?.message &&
            data.message.product.reviews.map((review) => (
              <CommentCard key={review._id} review={review} />
            ))}
        </div>
      </div>
      <div className="w-1/2 h-full hidden lg:block">
        {data?.message && <ProductDescription product_data={data} />}
      </div>
    </section>
  );
}
