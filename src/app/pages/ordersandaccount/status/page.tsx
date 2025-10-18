import OrderCard from "@/app/components/OrderCard";
import OrderStatus from "@/app/components/OrderStatus";
import OrderSummaryCard from "@/app/components/OrderSummaryCard";
import PaymentDetailsCard from "@/app/components/PaymentDetailsCard";
import ShippingAddressCard from "@/app/components/ShippingAddressCard";
import React from "react";

export default function Status() {
  return (
    <section className="flex gap-16 rounded-2xl p-8 bg-white">
      <div className="space-y-10 flex-1">
        <div className="pt-6 space-y-3">
          <OrderCard />
          <OrderCard />
        </div>

        <div className="space-y-4">
          <OrderSummaryCard />
          <ShippingAddressCard />
          <PaymentDetailsCard />
        </div>
      </div>

      <div className="flex-1">
        <OrderStatus />
      </div>
    </section>
  );
}
