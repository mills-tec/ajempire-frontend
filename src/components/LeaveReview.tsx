"use client";
import { useReviews } from "@/api/customHooks";
import { IItem } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import { IoMdStar } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import CheckCircle from "./svgs/CheckCircle";
import { RiCloseFill } from "react-icons/ri";

export default function LeaveReview({
  item,
  show,
  toggleShow,
}: {
  item: IItem;
  show: boolean;
  toggleShow: () => void;
}) {
  const { postReview, updateReview, loading } = useReviews();
  const [selectedProduct, setSelectedProduct] = useState<IItem>(item);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const ratingValues = [1, 2, 3, 4, 5];
  const [inputs, setInputs] = useState<{
    selectedRating: number;
    comment?: string;
    shippingDelviery: number;
  }>({
    selectedRating: 0,
    comment: "",
    shippingDelviery: 0,
  });

  const handleRateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      data: { rating: inputs.selectedRating, comment: inputs.comment },
      product: selectedProduct!.product,
    };
    const req = !isEdit ? await postReview(data) : await updateReview(data);

    if (req) {
      setReviewSuccess(true);
    }
    // setReviewSuccess(true);
  };

  const handleCloseModal = () => {
    setReviewSuccess(false);
    setInputs({
      selectedRating: 0,
      comment: "",
      shippingDelviery: 0,
    });
    toggleShow();
  };

  useEffect(() => {
    setSelectedProduct(item);
  }, [item]);

  return (
    <div
      className={`bg-black/20 w-full h-full fixed left-0 top-0 z-50  flex items-center justify-center  ${show ? "scale-100" : "scale-0 delay-100"
        }`}
    >
      <div
        className={`flex flex-col p-10 duration-300 ${reviewSuccess ? "" : " h-[400px]"
          }  bg-white md:w-[60%]   rounded-3xl  overflow-auto    ${show ? "scale-100 delay-100" : "scale-0"
          }`}
      >
        {reviewSuccess ? (
          <div>
            <div className="flex justify-end mb-5">
              <RiCloseFill
                size={30}
                className="cursor-pointer"
                onClick={handleCloseModal}
              />
            </div>

            <div className="flex justify-center items-center flex-col gap-6">
              <CheckCircle />

              <div className="text-center font-poppins">
                <p className="text-xl">Your review has been submitted</p>
                <p className=" my-3">
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
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h1 className="font-medium">Write A Review</h1>
              <IoClose size={30} onClick={handleCloseModal} />
            </div>

            {selectedProduct?.name && (
              <div className=" grid md:grid-cols-3 grid-cols-1 pt-6">
                <div className="md:col-span-2 ">
                  <div>
                    <div className="flex gap-7 items-center mb-10">
                      <div className="h-[70px]  md:w-[20%] relative">
                        <Image
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          fill
                          sizes="100px"
                          className="object-cover rounded-lg"
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
                </div>
              </div>
            )}

            <form className=" grid gap-6" onSubmit={handleRateItem}>
              <div>
                <h1 className="font-medium  text-sm mt-10 mb-3">Comments</h1>
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
                <h1 className="font-medium  text-sm mb-1">
                  Items Rating
                  <sup className="text-red-500 font-bold text-[16px]">*</sup>
                </h1>
                <div className="flex gap-2 mb-3">
                  {ratingValues.map((item, index) => (
                    <IoMdStar
                      key={index}
                      size={30}
                      className={`duration-300 cursor-pointer ${item <= inputs.selectedRating
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

                <h1 className="font-medium  text-sm mb-1">
                  Shipping and Delivery
                </h1>
                <div className="flex gap-2">
                  {ratingValues.map((item, index) => (
                    <IoMdStar
                      key={index}
                      size={30}
                      className={`duration-300 cursor-pointer ${item <= inputs.shippingDelviery
                        ? "text-brand_pink"
                        : "text-[#EBEBEB]"
                        }`}
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          shippingDelviery: item,
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
  );
}
