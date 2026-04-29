import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { IItem } from '@/lib/types'
import Image from 'next/image'
import { useReviews } from '@/api/customHooks'
import { IoMdStar } from 'react-icons/io'
import { ImSpinner8 } from 'react-icons/im'
import { getUser } from '@/lib/api'
import MobilePage from './MobilePage'

const Children = ({ selectedProduct, handleHideOverlay, setUpdatedReviews, showOverlay }: { selectedProduct: IItem, handleHideOverlay: () => void, setUpdatedReviews: (review: any) => void, showOverlay: boolean }) => {
  const { postReview, loading } = useReviews();
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
      product: (selectedProduct.product as any)._id,
    };

    const req = await postReview(data);
    const updatedReview: { rating: number, comment: string; createdAt: string, updatedAt: string } = req.review;


    if (req) {
      handleHideOverlay();
      setUpdatedReviews({ ...updatedReview, product: (selectedProduct.product as any)._id });
      setInputs({
        selectedRating: 0,
        comment: "",
      });
    }
  };

  useEffect(() => {
    const reviews: [] = (selectedProduct.product as any).reviews;
    const user = getUser();
const userReview: any = reviews.find((review: any) => review.user == user?._id);
    setInputs({
      selectedRating: userReview?.rating || 0,
      comment: userReview?.comment || "",
    });
  }, [showOverlay]);

  return <>
    <div className="flex justify-between mb-5">
      <h1 className="text-lg hidden md:block">Write a review</h1>

    </div>
    <div className=" grid md:grid-cols-3 grid-cols-1">
      <div className="md:col-span-2 ">
        {selectedProduct.name && (
          <div>
            <div className="flex gap-7 items-center mb-10">
              <div className="h-[100px] w-[40%]  md:w-[30%] relative">
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
      </div>
      <button
        className="rounded-full text-sm text-white h-12 py-3 px-6  border bg-brand_pink flex items-center justify-center disabled:opacity-40"
        disabled={inputs.selectedRating == 0}
      >
        {!loading ? (
          "Review Product"
        ) : (
          <ImSpinner8 className="animate-spin" size={20} />
        )}
      </button>
    </form>
  </>

}

export default function LeaveReview({ showOverlay, handleHideOverlay, selectedProduct, setUpdatedReviews }: {
  showOverlay: boolean, handleHideOverlay: () => void, selectedProduct: IItem,
  setUpdatedReviews: (review: any) => void
}) {


  return (

    <>

      <div className='hidden md:block'>
        <Modal isOpen={showOverlay} onClose={handleHideOverlay}>
          <Children selectedProduct={selectedProduct} handleHideOverlay={handleHideOverlay} setUpdatedReviews={setUpdatedReviews} showOverlay={showOverlay} />
        </Modal>
      </div>

      <MobilePage isOpen={showOverlay} handleClose={handleHideOverlay} title='Write a review'>
        <Children selectedProduct={selectedProduct} handleHideOverlay={handleHideOverlay} setUpdatedReviews={setUpdatedReviews} showOverlay={showOverlay} />
      </MobilePage>
    </>
  )
}
