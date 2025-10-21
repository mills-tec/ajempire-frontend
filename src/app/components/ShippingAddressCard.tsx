import React from "react";

export default function ShippingAddressCard() {
  return (
    <div className="w-full border border-black/60 rounded-xl space-y-4 p-5">
      <h2 className="font-semibold">Shipping address</h2>
      <div className="text-sm space-y-1">
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Name</h5>
          <p className="text-black/75">Emily Johnson</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Company</h5>
          <p className="text-black/75">Literati Publishing Co.</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Street</h5>
          <p className="text-black/75">Street: 123 Maple Avenue</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">City/Town</h5>
          <p className="text-black/75">New York</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Postcode</h5>
          <p className="text-black/75">10001</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Country/Region</h5>
          <p className="text-black/75">United States</p>
        </div>
      </div>
    </div>
  );
}
