"use client";
import React, { useState } from "react";
import OrderCard from "./OrderCard";
import Link from "next/link";
import { useOrders } from "@/api/customHooks";
import { ImSpinner8 } from "react-icons/im";
import { usePathname } from "next/navigation";
import IssueReturn from "@/components/IssueReturn";
import LeaveReview from "@/components/LeaveReview";
import { IItem } from "@/lib/types";
import { Dot, Ellipsis } from "lucide-react";
import Modal from "@/components/Modal";
import Image from "next/image";
import { getUser } from "@/lib/api";

export default function OrdersContent({
  title,
  items,
  dateCreated,
  order_id,
  id,
  setUpdatedReviews,
}: {
  title: string;
  items: {
    product: string;
    name: string;
    variant: { name: string; value: string; _id: string };
    price: number;
    qty: number;
    image: string;
    discountedPrice: number;
  }[];
  dateCreated: string;
  order_id: string;
  id: string;
  setUpdatedReviews: (product: any) => void;
}) {
  const date = new Date(dateCreated);
  const { postLoading, addOrderToCart } = useOrders();
  const handleBuyAgain = async () => {
    if (!postLoading) {
      try {
        const data = items.map((item) => ({
          productId: item.product,
          qty: item.qty,
          variant: item.variant?._id ?? undefined,
        }));
        await addOrderToCart(data);
      } catch (err) {
        console.log(err);
      }
    }
  };
  const pathname = usePathname();
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [chooseProductModal, setChooseProductModal] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<IItem | null>(items[0]);

  return (
    <div className="border-8  border-[#F9F9F9] md:border-none" >
      <div className="md:p-6   rounded-xl my-8  bg-white p-4 ">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold capitalize">{title}</h1>
          <p className="text-black/60 text-sm">
            {date.toLocaleString("en-us", { dateStyle: "long" })}
          </p>
        </div>
        <div className="pt-6 space-y-3">
          {items.map((item, index) => (
            <OrderCard
              image={item.image}
              title={item.name}
              variant={
                item?.variant ? `${item.variant.name}: ${item.variant.value}` : ""
              }
              price={item.price}
              discount={item.discountedPrice}
              qty={item.qty}
              key={index}
            />
          ))}
        </div>
        <div className="flex justify-between my-5  items-end">
          {/* <div /> */}

          <div className="relative">
            {title.includes("delivered") && (
              <Ellipsis className="text-black/60 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
            )}
            <div onClick={() => { setShowIssueModal(true); setShowDropdown(false) }} className="absolute w-20 h-6 -top-[140%] cursor-pointer left-0" style={{ scale: showDropdown ? 1 : 0, transition: "all 0.1s ease-in-out" }}>

              <div className="left-0 w-28  h-8 border  border-black/10  bg-white  rounded-2xl z-10  flex items-center justify-center text-[12px] font-poppins overflow-hidden">
                <p className="text-black/60  bg-white text-center relative z-10">Issue Return</p>
              </div>

              <div className="rotate-[60deg]  absolute w-2 h-3 left-[20%] translate-x-[-50%]  border-b border-r border-black/10 top-[110%] bg-white "></div>


            </div>

          </div>
          <div className="space-y-3">
            <p className="text-sm w-full text-right">
              Total for {`${items.length} ${items.length > 1 ? "Items" : "item"}`}
              :{" "}
              <span className="font-medium">
                ₦
                {items
                  .reduce(
                    (prev, item: { price: number; discountedPrice: number }) =>
                      item.discountedPrice
                        ? item?.discountedPrice + prev
                        : item?.price + prev,
                    0
                  )
                  .toFixed(2)}
              </span>
            </p>
            <div className="flex md:gap-4 gap-2">



              {title.toLowerCase() === "delivered" && (
                <button
                  className="flex items-center justify-center rounded-full text-xs px-2 md:text-sm py-1    md:px-6  border-black border text-black h-10"
                  onClick={() => items.length > 1 ? setChooseProductModal(true) : setShowReviewModal(true)}
                >
                  Leave a review
                </button>
              )}

              <button
                onClick={handleBuyAgain}
                className="rounded-full text-xs px-2 md:text-sm text-brand_pink py-1   md:px-6  border border-brand_pink flex items-center justify-center h-10"
              >
                {postLoading ? (
                  <ImSpinner8 className="animate-spin" />
                ) : (
                  "Buy Again"
                )}
              </button>

              <Link
                className="flex items-center justify-center rounded-full text-xs px-2 md:text-sm py-1  md:px-6  text-white bg-brand_pink h-10"
                href={`${pathname}/${order_id}`}
              >
                View Status
              </Link>



            </div>

            <IssueReturn data={{ _id: id, items }} returnModal={showIssueModal} setReturnModal={(modal: boolean) => setShowIssueModal(modal)} />

            <LeaveReview showOverlay={showReviewModal} handleHideOverlay={() => setShowReviewModal(!showReviewModal)} selectedProduct={selectedProduct!} setUpdatedReviews={(review: any) => {



            }} />

            <Modal isOpen={chooseProductModal} onClose={() => { setChooseProductModal(false); }}>
              <h1 className="mb-10">Choose a product you want to review</h1>

              {items.map((item, key) => {
                const review = (item.product as any).reviews.find((review: any) => review.user == getUser()?._id);


                return <div
                  key={key}
                  className="border p-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 justify-between items-center mb-5"
                >
                  <div className="flex gap-4 md:col-span-2">
                    <div className="w-[100px] h-[60px] md:h-[100px]  md:w-[40%] relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div>
                      <h1 className="font-medium text-sm mb-2">{item.name}</h1>
                      <p>₦{item.price.toFixed(2)}</p>
                      <p className="text-xs mt-1">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <button
                    className="rounded-full text-xs text-white  py-3 px-6  border bg-brand_pink flex items-center justify-center disabled:opacity-40"
                    onClick={() => {
                      setChooseProductModal(false);
                      setSelectedProduct(item);
                      setShowReviewModal(true);
                    }}
                  >
                    {review ? "Edit Review" : "Review"}
                  </button>
                </div>
              })}
            </Modal>


          </div>
        </div>
      </div>
    </div>
  );
}
