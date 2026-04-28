"use client";
import { useIssueReturn } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import Check from "@/components/svgs/Check";
import DashedBorder from "@/components/svgs/DashedBorder";

import { IReturnRequest } from "@/lib/types";
import Image from "next/image";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Loading from "../../loading";
import OrderTabs from "../../components/OrderTabs";




export default function Status() {
    const { getReturnRequest, loading } = useIssueReturn();
    const [data, setData] = useState<IReturnRequest>({
        _id: "",
        reason: "",
        itemUsed: false,
        imageEvidence: "",
        additionalNotes: "",
        phoneNumber: "",

        order: {
            _id: "",
            order_id: "",
        },

        user: "",

        product: [
            {
                _id: "",
                product: "",
                name: "",
                qty: 0,
                price: 0,
                discountedPrice: 0,
                image: "",
                variants: {
                    options: [],
                },
            },
        ],

        status: "processing",
        total: 0,

        createdAt: "",
        updatedAt: "",
        __v: 0,
    });
    const params = useParams();
    const [postLoading] = useState(false);
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
            const req = await getReturnRequest(params?.id as string);
            // console.log(req)
            setData(req);
        })();
    }, []);


    return (
        <div>
            {loading ? <Loading /> : (
                <>
                    <OrderTabs showFilterTabs={false} text="Returns Status" handleSearchInputChange={() => { }} />
                    <section className="grid grid-cols-1 md:grid-cols-3   md:gap-5 rounded-2xl p-5  md:p-8 bg-white gap-10">

                        <div className=" flex flex-col gap-5 order-2 md:order-1">
                            <div className="font-poppins ">
                                <h1 className="text-lg font-medium  mb-5 hidden md:block">Return Status</h1>

                                <div className="text-sm flex flex-col gap-2">
                                    <p>Order #{data.order.order_id}</p>
                                    <p className="text-[#000000B2]">
                                        Created On :
                                        <span className="text-primaryhover">
                                            {new Date(data.createdAt).toLocaleDateString("en-us", {
                                                dateStyle: "long",
                                            })}
                                        </span>
                                    </p>


                                    <p className="text-[#000000B2]">No of Returned Items: {data.product.length}</p>

                                    <p className="text-black text-sm mt-10 font-semibold">
                                        Total for {data.product.length}{" "}
                                        {data.product.length > 1 ? "Items" : "Item"}: ₦{Number(data.total).toLocaleString("en-US", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className=" flex-1">
                                {data.product.map(
                                    (
                                        item,
                                        index,
                                    ) => (
                                        <OrderCard
                                            key={index}
                                            image={item.image}
                                            title={item.name}
                                            variant={
                                                item?.variants && item.variants.options.length > 0
                                                    ? `${item.variants.options[0].name}: ${item.variants.options[0].value}`
                                                    : ""
                                            }
                                            price={item.price}
                                            discount={item.discountedPrice}
                                            qty={item.qty}
                                        />
                                    ),
                                )}

                            </div>
                            <div>
                                <div className="flex items-start font-poppins justify-center w-fit gap-5">

                                    <div className="flex w-fit  items-center justify-center flex-col">
                                        <Check />
                                        <DashedBorder />
                                    </div>

                                    <div>
                                        <h1 className="text-sm font-medium">Return Processing</h1>
                                        <p className="text-[#000000B2] text-xs" >Fri, 05 Aug 2025, 3:07am</p>
                                    </div>
                                </div>

                                <div className="flex items-start font-poppins justify-center w-fit gap-5">

                                    <div className="flex w-fit  items-center justify-center flex-col">
                                        <Check />
                                        <DashedBorder />
                                    </div>

                                    <div>
                                        <h1 className="text-sm font-medium">Return Confirmed</h1>
                                        <p className="text-[#000000B2] text-xs" >Fri, 05 Aug 2025, 3:07am</p>
                                    </div>
                                </div>

                                <div className="flex items-start font-poppins justify-center w-fit gap-5 opacity-35">

                                    <div className="flex w-fit  items-center justify-center flex-col">
                                        <Check />
                                        <DashedBorder />
                                    </div>

                                    <div>
                                        <h1 className="text-sm font-medium">Return In Transit</h1>
                                        <p className="text-[#000000B2] text-xs" >Pending</p>
                                    </div>
                                </div>

                                <div className="flex items-start font-poppins justify-center w-fit gap-5 opacity-35">

                                    <div className="flex w-fit  items-center justify-center flex-col">
                                        <Check />
                                        <DashedBorder />
                                    </div>

                                    <div>
                                        <h1 className="text-sm font-medium">Return Delivered</h1>
                                        <p className="text-[#000000B2] text-xs" >Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 h-[200px] relative flex justify-end md:order-2 order-1">
                            <Image src={data.imageEvidence} alt="" fill className="object-cover bg-primaryhover/10" sizes="(max-width: 768px) 100vw, 50vw" loading="eager" />
                        </div>
                    </section>
                </>
            )}
        </div>

    );
}
