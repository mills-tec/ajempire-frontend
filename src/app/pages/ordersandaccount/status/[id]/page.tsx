"use client";
import { useOrders } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import OrderStatus from "@/app/components/OrderStatus";
import OrderSummaryCard from "@/app/components/OrderSummaryCard";
import ShippingAddressCard from "@/app/components/ShippingAddressCard";
import LeaveReview from "@/components/LeaveReview";
import Modal from "@/components/Modal";
import { useCartStore } from "@/lib/stores/cart-store";
import { IItem } from "@/lib/types";
import { Wallet, WalletMinimal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { ImSpinner8 } from "react-icons/im";

export default function Status() {
  const router = useRouter();
  const { getOrder, isLoading } = useOrders();
  const [data, setData] = useState<{
    paymentMethod: string;
    orderStatus: "processed" | "shipped" | "delivered" | "cancelled" | "";
    paymentStatus: string;
    items: IItem[];
    totalPrice: number;
    amountPaid: number;
    discountedPrice: number;
    deliveryFee: number;
    shippingAddress: {
      fullName: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    createdAt: Date | null;
    processedAt: Date | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    order_id: string;
  }>({
    paymentMethod: "",
    paymentStatus: "",
    order_id: "",
    orderStatus: "",
    items: [],
    totalPrice: 0,
    discountedPrice: 0,
    amountPaid: 0,
    deliveryFee: 0,
    shippingAddress: {
      fullName: "",
      street: "",
      city: "",
      postalCode: "",
      country: "",
    },
    createdAt: null,
    processedAt: null,
    shippedAt: null,
    deliveredAt: null,
  });
  const params = useParams();
  const [postLoading, setPostLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IItem>();
  const [chooseProductModal, setChooseProductModal] = useState<boolean>(false);
  const [showReview, setShowReview] = useState(false);
  const [issueReturnModal, setissueReturnModal] = useState<boolean>(false);
  const toggleShowReview = () => {
    setShowReview(!showReview);
  };
  useEffect(() => {
    (async () => {
      const { message: order } = await getOrder(params?.id as string);
      setData(order);
    })();
  }, []);

  useEffect(() => {
    if (data.items.length > 0) setSelectedProduct(data.items[0]);
  }, [data]);

  const [returnReason, setReturnReason] = useState({
    list: [

    ],
    reason: ""
  });


  return (
    <section className="flex flex-col   md:gap-5 rounded-2xl p-5  md:p-8 bg-white">
      <div
        className="h-7 w-7 rounded-full outline outline-primaryhover flex items-center justify-center"
        onClick={() => {
          router.back();
        }}
      >
        <GoArrowLeft className="cursor-pointer text-primaryhover" size={20} />
      </div>
      <div className="font-poppins ">
        <h1 className="text-xl font-medium  mb-10">Order Tracking</h1>

        <div className="text-sm flex flex-col gap-2">
          <p>Order #{data.order_id}</p>
          <p className="text-[#000000B2]">
            Placed On:
            <span className="text-primaryhover">
              {" "}
              {new Date(data.processedAt!).toLocaleDateString("en-us", {
                dateStyle: "long",
              })}
            </span>
          </p>

          <p className="text-[#000000B2]">
            Delivery Date:
            <span className="text-primaryhover">
              {" "}
              {new Date(data.processedAt!).toLocaleDateString("en-us", {
                dateStyle: "long",
              })}
            </span>
          </p>

          <p className="text-[#000000B2]">No of Items: {data.items.length}</p>

          <p className="text-black text-sm mt-10 font-semibold">
            Total for {data.items.length}{" "}
            {data.items.length > 1 ? "Items" : "Item"}: ₦{data.totalPrice}
          </p>
        </div>
      </div>

      <div className=" flex-1">
        {data.items.map(
          (
            item: {
              image: string;
              name: string;
              variant: { name: string; value: string };
              price: number;
              discountedPrice: number;
              qty: number;
            },
            index
          ) => (
            <OrderCard
              key={index}
              image={item.image}
              title={item.name}
              variant={
                item?.variant
                  ? `${item.variant.name}: ${item.variant.value}`
                  : ""
              }
              price={item.price}
              discount={item.discountedPrice}
              qty={item.qty}
            />
          )
        )}

        <div className="flex-1">
          <OrderStatus
            deliveredAt={data.deliveredAt}
            createdAt={data.createdAt}
            processedAt={data.processedAt}
            shippedAt={data.shippedAt}
          />
        </div>

        <div className="my-10 flex items-center gap-5 font-poppins">
          <button className="rounded-full text-xs text-white py-1 px-3  md:px-6 w-max border bg-brand_pink  flex items-center justify-center h-10">
            {postLoading ? (
              <ImSpinner8 className="animate-spin" />
            ) : (
              "Buy Again"
            )}
          </button>

          <button
            disabled={data.orderStatus !== "delivered"}
            className="rounded-full text-xs text-black py-1 px-3  md:px-6 w-max border border-black  flex items-center justify-center h-10 "
            onClick={() =>
              data.items.length > 1
                ? setChooseProductModal(true)
                : toggleShowReview()
            }
          >
            Leave Review
          </button>

          <button className="rounded-full text-xs text-black py-1 px-3  md:px-6 w-max border border-black  flex items-center justify-center h-10" onClick={() => setissueReturnModal(true)}>
            Issue Return
          </button>
        </div>
        <div className="space-y-4">
          <OrderSummaryCard
            amountPaid={data.amountPaid}
            discount={data.discountedPrice}
            shipping={data.deliveryFee}
            totalPrice={data.totalPrice}
          />
          <ShippingAddressCard
            city={data.shippingAddress.city}
            country={data.shippingAddress.country}
            street={data.shippingAddress.street}
            name={data.shippingAddress.fullName}
            postalCode={data.shippingAddress.postalCode}
          />
        </div>
      </div>

      {/* Modal to choose product to review */}
      <div className={`bg-black/20 w-full h-full fixed left-0 top-0 z-50  flex items-center justify-center  ${chooseProductModal ? "scale-100" : "scale-0 delay-100"
        }`}>
        <div className="overflow-auto bg-white w-[60%] h-[400px] rounded-2xl font-poppins p-10">
          <h1 className="mb-10">Choose a product you want to review</h1>

          {data.items.map((item, key) => (
            <div
              key={key}
              className="border p-3 rounded-lg flex gap-4 justify-between items-center"
            >
              <div className="flex gap-4 md:w-[60%]">
                <div className="h-[100px]  md:w-[30%] relative">
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
              <button className="rounded-full text-xs text-white  py-3 px-6  border bg-brand_pink flex items-center justify-center disabled:opacity-40" onClick={() => {
                setChooseProductModal(false);
                setSelectedProduct(item);
                toggleShowReview();
              }}>
                Review
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal to Issue return  */}
      <Modal onClose={() => { setissueReturnModal(false) }} isOpen={issueReturnModal}>
        <div className="font-poppins">
          <h1 className="text-lg font-medium mb-10">Return Request</h1>
          <div className="flex gap-2">
            <WalletMinimal size={20} />
            <p>Return possible until (30-09-2025) <Link href="/return-policy" className=" text-[#0088FF]">Access our Return Policy</Link></p>
          </div>

          <h1>Why are you returning this item?</h1>
        </div>


      </Modal>

      {data.items.length > 0 && (
        <LeaveReview
          item={selectedProduct!}
          show={showReview}
          toggleShow={toggleShowReview}
        />
      )}


    </section>
  );
}
