import React from "react";
interface IOrder {
  totalPrice: number;
  shipping: number;
  discount: number;
  amountPaid: number;
}
export default function OrderSummaryCard(order: IOrder) {
  return (
    <div className="w-full border border-black/60 rounded-xl space-y-4 p-5">
      <h2 className="font-semibold">Order Summary</h2>
      <div className="text-sm space-y-1">
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Subtotal</h5>
          <p className="text-black/75">₦{order.totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Shipping Charge</h5>
          <p className="text-black/75">₦{order.shipping.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Discount</h5>
          <p className="text-black/75">₦{order.discount.toFixed(2)}</p>
        </div>
      </div>
      <hr />
      <div>
        <div className="flex justify-between font-medium items-center">
          <h5>Total</h5>
          <p className="text-black/75"> ₦{order.amountPaid.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
