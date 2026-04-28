"use client";
import { useReviews } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import EmptyList from "@/components/EmptyList";
import LeaveReview from "@/components/LeaveReview";
import Modal from "@/components/Modal";
import CheckCircle from "@/components/svgs/CheckCircle";
import { IItem, Review } from "@/lib/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";


export default function Reviews({ items, setUpdatedReviews }: { items: IItem[]; setUpdatedReviews: (review: Review) => void }) {
  const filledStar = (
    <svg
      width="22"
      height="21"
      viewBox="0 0 22 21"
      className="size-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 0.226562L13.4697 7.82738H21.4616L14.996 12.5249L17.4656 20.1257L11 15.4282L4.53436 20.1257L7.00402 12.5249L0.538379 7.82738H8.53035L11 0.226562Z"
        fill="#FEBC2F"
      />
    </svg>
  );
  const unfilledStar = (
    <svg
      width="22"
      height="21"
      viewBox="0 0 22 21"
      className="size-4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.667 7.90918L13.7266 8.09277H21.0947L15.2891 12.3105L15.1338 12.4238L15.1934 12.6064L17.4102 19.4316L11.6055 15.2139L11.4492 15.1006L11.293 15.2139L5.4873 19.4316L7.70508 12.6064L7.76465 12.4238L7.60938 12.3105L1.80371 8.09277H9.17188L9.23145 7.90918L11.4492 1.08301L13.667 7.90918Z"
        stroke="#FEBC2F"
        strokeWidth="0.530208"
      />
    </svg>
  );

  const { deleteReview } =
    useReviews();
  const [selectedProduct, setSelectedProduct] = useState<IItem>({
    variant: {
      _id: "",
      name: "",
      value: "",
    },
    image: "",
    name: "",
    price: 0,
    discountedPrice: 0,
    qty: 0,
    product: "",
  });

  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const [products, setProducts] = useState<IItem[]>(items);

  useEffect(() => {
    setProducts(items);
  }, [items]);




  return (
    products?.length > 0 ? (
      <div className="min-h-fit md:p-6 rounded-xl my-8  bg-white">
        {products.map((item, index: number) => {


          const review = (item.product as any).reviews[0]
          const product = (item.product as any)._id;
          return (

            <div key={index} className="md:pr-5 grid md:grid-cols-2  mb-10">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="w-[8.5rem] h-[6rem] bg-gray-400 rounded-lg overflow-hidden flex relative">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 8.5rem" loading="eager" />
                </div>
                <div className="md:col-span-2">
                  <h1 className="text-sm">{review.comment.slice(0, 30).concat(review.comment.length > 30 ? "..." : "")}</h1>
                  {
                    <div className="flex text-brand_gray_dark">
                      {[...Array(5)].map((_, i) =>
                        i < review.rating! ? (
                          <span key={i}>{filledStar}</span>
                        ) : (
                          <span key={i}>{unfilledStar}</span>
                        )
                      )}
                    </div>
                  }

                  <h1 className="text-xs text-black/60 mt-4">{new Date(!review.updatedAt ? review.createdAt : review.updatedAt).toDateString()}</h1>



                </div>
              </div>

              <div className="flex justify-end mt-5 gap-2 md:gap-5">

                <button
                  onClick={() => {

                    setSelectedProduct(item);
                    setShowOverlay(true);
                  }}
                  className="rounded-full text-sm text-black/50 py-1 px-2 md:px-6 w-max border border-black/50 flex items-center justify-center h-8"
                >
                  Edit
                </button>
                <button onClick={async () => {


                  const req = await deleteReview(product);
                  if (req) {
                    setProducts((prev) =>
                      prev.filter((item: any) => item.product._id !== product)
                    );
                  }
                }} className="rounded-full text-sm text-brand_pink py-1 md:px-6 px-2 w-max border border-brand_pink flex items-center justify-center h-8">
                  Delete
                </button>
              </div>
            </div>
          );
        })}

        {
          showOverlay && (
            <LeaveReview showOverlay={showOverlay} handleHideOverlay={() => setShowOverlay(!showOverlay)} selectedProduct={selectedProduct!} setUpdatedReviews={(review) => {
              setProducts((prev) =>
                prev.map((item: any) => item.product._id === (selectedProduct.product as any)._id ? { ...item, product: { ...item.product, reviews: [review] } } : item)
              )
              setUpdatedReviews(review)
            }} />
          )
        }





      </div>
    ) : (
      <EmptyList message="No reviews found" />
    )
  );
}
