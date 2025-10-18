import OrderCard from "@/app/components/OrderCard";
import ReturnStatus from "@/app/components/ReturnStatus";

export default function Returns() {
  return (
    <div className="rounded-2xl p-8 bg-white space-y-8">
      <div className="text-sm space-y-6">
        <h1 className="font-semibold">Return Status</h1>
        <div>
          <p className="font-medium">Order #123456759</p>
          <p className="text-black/70">
            Placed on: <span className="text-brand_pink">March 10, 2024</span>
          </p>
          <p className="text-black/70">
            Delivery Date:{" "}
            <span className="text-brand_pink">March 10, 2024</span>
          </p>
          <p className="text-black/70">No of items: 2</p>
        </div>
        <p className="text-black/70">Total for 2 items: ₦25,000</p>
        <p className="text-brand_pink lg:w-1/3">
          <span className="font-semibold text-black">Hi David,</span> Your
          return request is being processed. It will be accepted once it meets
          our return policy criteria, including item condition, return period,
          and proof of purchase.
        </p>
      </div>

      <div className="space-y-3">
        <OrderCard />
        <OrderCard />
      </div>

      <ReturnStatus />
    </div>
  );
}
