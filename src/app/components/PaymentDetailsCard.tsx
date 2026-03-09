import Image from "next/image";
import React from "react";
import MasterCard from "@/assets/mastercardlogo.png";

export default function PaymentDetailsCard() {
  return (
    <div className="w-full border border-black/60 rounded-xl space-y-4 p-5">
      <h2 className="font-semibold">Payment details</h2>
      <div className="text-sm space-y-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <Image src={MasterCard} alt="" height={36} width={52.8} />
            <p>....6714</p>
          </div>
          <p className="font-bold">01/24</p>
        </div>
      </div>
    </div>
  );
}
