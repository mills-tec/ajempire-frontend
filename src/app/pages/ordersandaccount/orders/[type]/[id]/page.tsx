"use client";
import { useIssueReturn, useOrders } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import OrderStatus from "@/app/components/OrderStatus";
import OrderSummaryCard from "@/app/components/OrderSummaryCard";
import ShippingAddressCard from "@/app/components/ShippingAddressCard";
import LeaveReview from "@/components/LeaveReview";
import Modal from "@/components/Modal";
import { IItem } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { ImSpinner8 } from "react-icons/im";
import OrderTabs from "../../../components/OrderTabs";
import IssueReturn from "@/components/IssueReturn";
import Reviews from "../../Reviews";


export default function Status() {
    const params = useParams();
    return;
    const { getOrder } = useOrders();
    const [data, setData] = useState<{
        _id: string;
        paymentMethod: string;
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
        orderStatus: string;
    }>({
        _id: "",
        orderStatus: "",
        paymentMethod: "",
        paymentStatus: "",
        order_id: "",
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
    const [postLoading] = useState(false);
    const [chooseProductModal, setChooseProductModal] = useState<boolean>(false);
    const [showReview, setShowReview] = useState(false);
    const [returnModal, setReturnModal] = useState(false);
    const { postIssueReturn } = useIssueReturn();
    const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

    const [inputs, setInputs] = useState<{
        products: string[];
        reason: string;
        itemUsed: string;
        phoneNumber: string;
        additionalNotes: string;
        imageEvidence: File | null;
        otherReason: string;
    }>({
        products: [],
        reason: "",
        itemUsed: "",
        phoneNumber: "",
        additionalNotes: "",
        imageEvidence: null,
        otherReason: ""
    })
    const toggleShowReview = () => {
        setShowReview(!showReview);
    };

    const handleSubmit = async () => {
        const formData = new FormData();

        for (let i = 0; i < inputs.products.length; i++) {
            formData.append("product[]", inputs.products[i]);
        }
        formData.append("order", data._id);
        formData.append("reason", inputs.reason);
        formData.append("itemUsed", JSON.stringify(inputs.itemUsed === "Yes" ? true : false));
        formData.append("phoneNumber", inputs.phoneNumber);
        formData.append("additionalNotes", inputs.additionalNotes);
        formData.append("imageEvidence", inputs.imageEvidence as File);
        formData.append("otherReason", inputs.otherReason);
        const req = await postIssueReturn(formData)


        if (req) {
            setReturnModal(false);
            setInputs({
                products: [],
                reason: "",
                itemUsed: "",
                phoneNumber: "",
                additionalNotes: "",
                imageEvidence: null,
                otherReason: ""
            })
        }

    }

    useEffect(() => {
        (async () => {
            const { message: order } = await getOrder(params?.id as string);
            setData(order);
        })();
    }, []);


    return (
        <div>
            <OrderTabs handleSearchInputChange={() => { }} text="Order Tracking" showFilterTabs={false} />
            <section className="flex flex-col   md:gap-5 rounded-2xl p-5  md:p-8 bg-white">

                <div className="font-poppins ">
                    <h1 className="text-lg font-medium  mb-5">Order Tracking</h1>

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
                            index,
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
                        ),
                    )}

                    <div className="flex-1">
                        <OrderStatus
                            deliveredAt={data.deliveredAt}
                            createdAt={data.createdAt}
                            processedAt={data.processedAt}
                            shippedAt={data.shippedAt}
                        />
                    </div>

                    <div className="my-10 md:w-[50%]  grid grid-cols-3 gap-2 font-poppins">
                        <button className="rounded-full text-xs text-white py-1 px-3  md:px-6  border bg-brand_pink  flex items-center justify-center h-10">
                            {postLoading ? (
                                <ImSpinner8 className="animate-spin" />
                            ) : (
                                "Buy Again"
                            )}
                        </button>

                        {data.orderStatus.toLowerCase().includes("delivered") && <>
                            <button
                                className="rounded-full text-xs text-black py-1 px-3  md:px-6  border border-black  flex items-center justify-center h-10 "
                                onClick={() =>
                                    data.items.length > 1
                                        ? setChooseProductModal(true)
                                        : toggleShowReview()
                                }
                            >
                                Leave Review
                            </button>

                            <button
                                onClick={() => setReturnModal(true)}
                                className="rounded-full text-xs text-black py-1 px-3  md:px-6  border border-black  flex items-center justify-center h-10"
                            >
                                Issue return
                            </button>
                        </>}
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



                <IssueReturn data={{ _id: data._id, items: data.items }} returnModal={returnModal} setReturnModal={(modal: boolean) => setReturnModal(modal)} />

                {/* <LeaveReview  selectedProduct={}/> */}
                {/* <LeaveReview items={data.items} show={showReviewModal} toggleShow={() => setShowReviewModal(!showReviewModal)} chooseProductModal={chooseProductModal} toggleChooseProductModal={() => setChooseProductModal(!chooseProductModal)} /> */}


            </section>
        </div>

    );
}
