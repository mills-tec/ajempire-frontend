"use client";
import { getBearerToken, getCoupons } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import axios from "axios";
import { useEffect, useState } from "react";
import SelectedpaymentMethod from "./ui/SelectedpaymentMethod";
import ListOfLogistics from "./ui/ListOfLogistics";
import { toast } from "sonner";

interface CheckoutSummeryCardProps {
  initiateCheckout: () => void;
}
interface SelectedLogistic {
  courier_id: string;
  courier_name: string;
  total: number;
  delivery_eta: string;
  delivery_eta_time: string;
};
export default function CheckoutSummeryCard({
  initiateCheckout,
}: CheckoutSummeryCardProps) {
  const styleadress = "font-semibold opacity-75";
  const [mounted, setMounted] = useState(false);
  // const { selectedLogistic } = useCartStore();
  // const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });
  const { orderSummary, applyCoupon, removeCoupon, appliedCoupon } =
    useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const { items, getSelectedItems, selectedLogistic, requestToken } = useCartStore();


  useEffect(() => {
    setMounted(true);

  }, []);

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();

    if (code === "") {
      toast.error("Please enter a coupon code", { position: "top-right" });
      setLoadingCoupon(false);
      return;
    }
    setLoadingCoupon(true);

    try {
      const res = await getCoupons();
      if (!res?.message) throw new Error("No coupons");

      const coupon = res.message.find(
        (c: any) => c.code.toUpperCase() === code
      );

      if (!coupon) {
        toast.error("Invalid coupon code", { position: "top-right" });
        removeCoupon();
        return;
      }

      // expiry check
      if (coupon.isExpired === true) {
        toast.error("Coupon has expired", { position: "top-right" });
        return;
      }

      // used check
      if (coupon.users?.length > 0) {
        toast.error("Coupon already used", { position: "top-right" });

        return;
      }

      console.log("Entered coupon code:", code);
      console.log("Coupon found:", coupon);

      applyCoupon({
        code: coupon.code,
        type: coupon.discountType,
        value: coupon.discountValue,
      });
      console.log("Coupon applied to store:", {
        code: coupon.code,
        type: coupon.discountType,
        value: coupon.discountValue,
        users: coupon.users,
      });
      toast.success("Coupon applied successfully", { position: "top-right" });

      setCouponCode("");
    }

    catch (err) {
      console.error(err);
      toast.error("Failed to apply coupon", { position: "top-right" });
    }
    finally {
      setLoadingCoupon(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };



  if (!mounted) {
    return (
      <div className="w-full h-screen bg-gray-100  animate-pulse  rounded-md"></div>
    );
  }
  return (
    <div className="w-full  font-poppins text-[14px] border border-gray-200 rounded-md flex flex-col justify-center items-start gap-4  p-4">
      <p className="font-medium text-[17px]">Your Order</p>
      <div className="w-full">
        <ListOfLogistics />
      </div>

      <div className="mt-4 lg:hidden w-full">
        <p className="text-lg font-semibold">Delivery details</p>
        <div className="mt-2 p-4 border w-full text-[14px] text-gray-600 border-gray-200 rounded-md">
          <p><span className="font-medium text-black">Delivery Arrives:</span> {selectedLogistic?.delivery_eta}</p>
          <p><span className="font-medium text-black">Delivery Arrives on:</span> {" "}
            <span className="text-brand_solid_gradient">
              {selectedLogistic?.delivery_eta_time &&
                new Date(selectedLogistic.delivery_eta_time).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )}
            </span>
          </p>
        </div>
      </div>
      <div className="w-full">
        <SelectedpaymentMethod />
      </div>
      <div className="w-full shadow-sm rounded-md   px-4  py-4">
        <p className="text-[17px] font-semibold opacity-75 mb-4">
          Order Summary
        </p>
        {/* Coupon Code Input and Apply Button */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-[250px] h-[35px] border-2 border-gray-300 px-3 rounded-md focus-within:border-brand_solid_gradient transition-all duration-200">
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full h-full bg-transparent text-[12px] border-none outline-none"
            />

          </div>
          {/* <button className="bg-[#D3D3D3] w-[100px] h-[35px] rounded-full hover:bg-brand_solid_gradient hover:text-white transition-all duration-200">
            <p className="text-[14px]">Apply</p>
          </button> */}
          <button
            onClick={handleApplyCoupon}
            disabled={loadingCoupon}
            className="bg-[#D3D3D3] w-[100px] h-[35px] rounded-full hover:bg-brand_solid_gradient hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            <p className="text-[14px]">
              {loadingCoupon ? "Applying..." : "Apply"}
            </p>
          </button>
        </div>
        <div className="flex flex-col gap-2 text-[14px]">
          <div className="flex items-center justify-between">
            <p className="text-[#999999]">Subtotal</p>
            <p className={`${styleadress}`}>₦{formatPrice(orderSummary().total)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#999999]">Shipping Charge</p>
            <p className={`${styleadress}`}> ₦{formatPrice(orderSummary().deliveryFee)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[#999999]">Discount</p>
            <p className={`${styleadress}`}>₦{formatPrice(orderSummary().discount)}</p>
          </div>
          {orderSummary().coupon > 0 && (
            <div className="flex items-center justify-between text-[#999999]">
              <p>Coupon</p>
              <p>-₦{formatPrice(orderSummary().coupon)}</p>
            </div>
          )}

          <hr />
          <div className="flex items-center justify-between">
            <p className={`${styleadress}`}>Total</p>
            <p className={`${styleadress}`}>₦{formatPrice(orderSummary().finalTotal)}</p>
          </div>
        </div>
      </div>

      <button
        className="w-full text-center mt-4 bg-primaryhover text-white h-[35px] rounded-full"
        onClick={initiateCheckout}
      >
        Checkout
      </button>
    </div>
  );
}
