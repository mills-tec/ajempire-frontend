import React from "react";
interface IShippingAddress{
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}
export default function ShippingAddressCard(shippingAddress: IShippingAddress) {
  return (
    <div className="w-full border border-black/60 rounded-xl space-y-4 p-5">
      <h2 className="font-semibold">Shipping address</h2>
      <div className="text-sm space-y-1">
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Name</h5>
          <p className="text-black/75">{shippingAddress.name}</p>
        </div>
    
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Street</h5>
          <p className="text-black/75">{shippingAddress.street}</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">City/Town</h5>
          <p className="text-black/75">{shippingAddress.city}</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Postcode</h5>
          <p className="text-black/75">{shippingAddress.postalCode}</p>
        </div>
        <div className="flex justify-between items-center">
          <h5 className="text-black/50">Country/Region</h5>
          <p className="text-black/75">{shippingAddress.country}</p>
        </div>
      </div>
    </div>
  );
}
