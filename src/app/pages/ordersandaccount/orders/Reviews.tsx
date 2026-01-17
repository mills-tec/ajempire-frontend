"use client";
import { useReviews } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import CheckCircle from "@/components/svgs/CheckCircle";
import { IItem, Review } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import { IoMdStar } from "react-icons/io";
import { RiCloseFill } from "react-icons/ri";

export default function Reviews({ items }: { items: IItem[] }) {
  const { postReview, getUserReviews, updateReview, deleteReview, loading } =
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
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<string>("");
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [products, setProducts] = useState<IItem[]>(items);
  const ratingValues = [1, 2, 3, 4, 5];
  const [inputs, setInputs] = useState<{
    selectedRating: number;
    comment?: string;
  }>({
    selectedRating: 0,
    comment: "",
  });

  const handleRateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      data: { rating: inputs.selectedRating, comment: inputs.comment },
      product: selectedProduct.product,
    };
    const req = !isEdit ? await postReview(data) : await updateReview(data);
    if (req) {
      setReviewSuccess(true);
      setProducts((prev) =>
        prev.map((item) => ({
          ...item,
          review:
            item.product == data.product
              ? { ...item.review, ...data.data }
              : item.review,
        }))
      );
      // makeRequest();
    }
  };

  const handleHideOverlay = () => {
    setShowOverlay(false);
    setReviewSuccess(false);
  };

  const resetInputs = () => {
    setInputs({
      selectedRating: 0,
      comment: "",
    });
    setIsEdit(false);
  };

 
  return (
    <div className="h-screen md:p-6 md:ml-8  rounded-xl my-8  bg-white p-4">
      {products.map((item, index: number) => {
        return (
          <div key={index} className="pr-5 grid md:grid-cols-2  mb-10">
            <OrderCard
              title={item.name}
              price={item.price}
              discount={item.discountedPrice}
              qty={item.qty}
              variant={item.variant ? `${item.variant.value}` : ""}
              image={item.image}
            />

            <div className="flex justify-end mt-5 gap-2 md:gap-5">
              {/* Delete Review */}
              {item.review && (
                <button
                  onClick={async () => {
                    setIsDelete(item.product);
                    const req = await deleteReview(item.product);
                    if (req) {
                      setProducts((prev) =>
                        prev.map((product) =>
                          product.product == item.product
                            ? { ...product, review: undefined }
                            : product
                        )
                      );
                    }
                  }}
                  className="rounded-full text-sm text-black/50 py-1 px-6 w-max border border-black/50 flex items-center justify-center h-8"
                >
                  {/* spinner should show on currently deleted  item */}
                  {isDelete == item.product && loading ? (
                    <ImSpinner8 className="animate-spin" size={20} />
                  ) : (
                    "Delete Review"
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  if (item.review) {
                    setInputs({
                      selectedRating: item.review?.rating || 0,
                      comment: item.review?.comment,
                    });
                    setIsEdit(true);
                  } else {
                    resetInputs();
                  }
                  setSelectedProduct(item);
                  setShowOverlay(true);
                }}
                className="rounded-full text-sm text-black/50 py-1 px-2 md:px-6 w-max border border-black/50 flex items-center justify-center h-8"
              >
                {item.review ? "Edit review" : "Write Review"}
              </button>
              <button className="rounded-full text-sm text-brand_pink py-1 md:px-6 px-2 w-max border border-brand_pink flex items-center justify-center h-8">
                Buy Again
              </button>
            </div>
          </div>
        );
      })}
      <div
        className={`fixed bg-black/20 w-full h-screen top-0 left-0 backdrop-blur-[2px] z-[1000] px-10 md:px-0 flex justify-center font-poppins items-center ${
          showOverlay ? "scale-100" : "scale-0 delay-100"
        }`}
      >
        <div
          className={` ${
            reviewSuccess
              ? "h-[400px] duration-200"
              : "h-screen overflow-auto duration-100"
          }  bg-white md:w-[60%] p-10   ${
            showOverlay ? "scale-100 delay-100" : "scale-0"
          }`}
        >
          {reviewSuccess ? (
            <>
              <div className="flex justify-end mb-5">
                <RiCloseFill
                  size={30}
                  className="cursor-pointer"
                  onClick={handleHideOverlay}
                />
              </div>

              <div className="flex justify-center items-center flex-col gap-6">
                <CheckCircle />

                <div className="text-center ">
                  <p className="text-xl">Your review has been submitted</p>
                  <p className="text-sm my-3">
                    Your review has been submitted successfully. We truly
                    appreciate your time and effort in helping us grow.
                  </p>
                </div>
                <Link
                  href={"/pages/ordersandaccount/orders/all"}
                  className="rounded-full text-sm text-white py-3 w-[90%] md:w-[50%]  border bg-brand_pink flex items-center justify-center"
                >
                  Return to order
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between mb-5">
                <h1 className="text-lg ">Write a review</h1>
                <RiCloseFill
                  size={30}
                  className="cursor-pointer"
                  onClick={handleHideOverlay}
                />
              </div>
              <div className=" grid md:grid-cols-3 grid-cols-1">
                <div className="md:col-span-2 ">
                  {selectedProduct.name && (
                    <div>
                      <div className="flex gap-7 items-center mb-10">
                        <div className="h-[100px]  md:w-[30%] relative">
                          <Image
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            fill
                            className="object-cover rounded-2xl"
                          />
                        </div>
                        <div>
                          <h1>{selectedProduct.name}</h1>
                          {selectedProduct.variant && (
                            <p>{selectedProduct.variant?.value}</p>
                          )}
                          <div className="text-xs font-light flex gap-2">
                            <p className="font-semibold">
                              ₦
                              {(selectedProduct.discountedPrice
                                ? selectedProduct.discountedPrice
                                : selectedProduct.price
                              ).toFixed(2)}
                            </p>

                            <p className="text-black/50 line-through">
                              {selectedProduct.discountedPrice
                                ? `₦${selectedProduct.price.toFixed(2)}`
                                : ""}
                            </p>
                            <p className="ml-6">x{selectedProduct.qty}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form className=" grid gap-6" onSubmit={handleRateItem}>
                <div>
                  <h1 className="font-medium  mb-1">Comments</h1>
                  <textarea
                    name=""
                    id=""
                    className="border border-black resize-none w-[100%] outline-none p-3 h-[200px] text-sm rounded-md"
                    placeholder="Write a review to let shoppers know what you think about this product"
                    value={inputs.comment}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                  ></textarea>
                </div>
                <div>
                  <h1 className="font-medium  mb-1">
                    Items Rating
                    <sup className="text-red-500 font-bold text-[16px]">*</sup>
                  </h1>
                  <div className="flex gap-4">
                    {ratingValues.map((item, index) => (
                      <IoMdStar
                        key={index}
                        size={40}
                        className={`duration-300 cursor-pointer ${
                          item <= inputs.selectedRating
                            ? "text-brand_pink"
                            : "text-[#EBEBEB]"
                        }`}
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            selectedRating: item,
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
                <button
                  className="rounded-full text-sm text-white h-12 py-3 px-6  border bg-brand_pink flex items-center justify-center disabled:opacity-40"
                  disabled={inputs.selectedRating == 0}
                >
                  {!loading ? (
                    isEdit ? (
                      "Edit Review"
                    ) : (
                      "Review Product"
                    )
                  ) : (
                    <ImSpinner8 className="animate-spin" size={20} />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
