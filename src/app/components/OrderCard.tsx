import React from "react";

export default function OrderCard() {
  return (
    <div className="flex gap-4 ">
      <div className="w-[8.5rem] h-[6rem] bg-gray-400 rounded-lg overflow-clip"></div>
      <div className="space-y-1 mt-2">
        <h2 className="text-sm">Nail Polish Set – Magenta Glow</h2>
        <h4 className="text-xs font-light">Brown, yellow, pink</h4>
        <div className="text-xs font-light flex gap-2">
          <p className="font-semibold">₦25,000</p>
          <p className="text-black/50 line-through">₦25,000</p>
          <p className="ml-6">x1</p>
        </div>
      </div>
    </div>
  );
}
