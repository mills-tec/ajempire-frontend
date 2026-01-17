"use client";
import { useOrders } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import OrderStatus from "@/app/components/OrderStatus";
import OrderSummaryCard from "@/app/components/OrderSummaryCard";
import PaymentDetailsCard from "@/app/components/PaymentDetailsCard";
import ShippingAddressCard from "@/app/components/ShippingAddressCard";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Status() {
  const { getOrder, isLoading } = useOrders();
  const [data, setData] = useState<{
    paymentMethod: string;
    paymentStatus: string;
    items: [];
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
  }>({
    paymentMethod: "",
    paymentStatus: "",
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
    deliveredAt: null
  });
  const params = useParams();

  useEffect(() => {
    (async () => {
      const { message: order } = await getOrder(params?.id as string);
      setData(order);
    })();
  }, []);

  return (
    <section className="flex gap-16 rounded-2xl p-8 bg-white">
      <div className="space-y-10 flex-1">
        <div className="pt-6 space-y-3"></div>
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
          {/* <PaymentDetailsCard /> */}
        </div>
      </div>

      <div className="flex-1">
        <OrderStatus deliveredAt={data.deliveredAt} createdAt={data.createdAt} processedAt={data.processedAt} shippedAt={data.shippedAt} />
      </div>
    </section>
  );
}
