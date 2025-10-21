import React from "react";

export default function OrderSummaryCard() {
  return (
    <div className="w-full border border-black/60 rounded-xl space-y-4 p-5">
      <h2 className="font-semibold">Order Summary</h2>
      <div className="text-sm space-y-1">
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Subtotal</h5>
          <p className="text-black/75">$44.97</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Shipping Charge</h5>
          <p className="text-black/75">$10.00</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Taxes</h5>
          <p className="text-black/75">$5.00</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Discount</h5>
          <p className="text-black/75">$0</p>
        </div>
      </div>
      <hr />
      <div>
        <div className="flex justify-between font-medium items-center">
          <h5>Total</h5>
          <p className="text-black/75">$70.00</p>
        </div>
      </div>
    </div>
  );
}
