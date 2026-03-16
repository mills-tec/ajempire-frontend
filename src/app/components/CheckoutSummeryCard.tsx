"use client";
import { applyCouponCode, getBearerToken, getCoupons } from "@/lib/api";
import { useCartStore } from "@/lib/stores/cart-store";
import axios from "axios";
import { useEffect, useState } from "react";
import SelectedpaymentMethod from "./ui/SelectedpaymentMethod";
import ListOfLogistics from "./ui/ListOfLogistics";
import { toast } from "sonner";
import { postData } from "@/api/api";

interface CheckoutSummeryCardProps {
  initiateCheckout: (couponCode: string) => void;
}
interface SelectedLogistic {
  courier_id: string;
  courier_name: string;
  total: number;
  delivery_eta: string;
}
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


  useEffect(() => {
    setMounted(true);
    // const fetchTotal = async () => {
    //   const token = getBearerToken();
    //   if (!token) return;
    //   try {
    //     const res = await axios.get(
    //       "https://ajempire-backend.vercel.app/api/cart/",
    //       {
    //         headers: { Authorization: `Bearer ${token}` },
    //       }
    //     );
    //     if (res?.data?.message) {
    //       setTotals({
    //         subtotal: res.data.message.total,
    //         discount: res.data.message.discountedPrice,
    //         total: res.data.message.totalPrice,
    //       });
    //     }
    //   } catch (err) {
    //     console.error("Error fetching totals:", err);
    //   }
    // };

    // fetchTotal();
  }, []);

  const handleApplyCoupon = async () => {
    const code = couponCode;

    if (code === "") {
      toast.error("Please enter a coupon code", { position: "top-right" });
      setLoadingCoupon(false);
      return;
    }
    setLoadingCoupon(true);

    try {
      const token = getBearerToken();
      const res = await postData(`/coupon/apply`, { code }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const coupon = res.data.coupon;

      applyCoupon({
        code: coupon.code,
        type: coupon.discountType,
        value: coupon.discountValue,
      });


      toast.success("Coupon applied successfully", { position: "top-right" });

      // setCouponCode("");


    }

    catch (err: any) {
      console.error(err.response.data);
      toast.error(err.response.data.error, { position: "top-right" });
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
        onClick={() => {
          initiateCheckout(couponCode)
        }}
      >
        Checkout
      </button>
    </div>
  );
}
