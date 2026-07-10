"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImSpinner8 } from "react-icons/im";

import { useIssueReturn, useOrders } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import OrderStatus from "@/app/components/OrderStatus";
import OrderSummaryCard from "@/app/components/OrderSummaryCard";
import ShippingAddressCard from "@/app/components/ShippingAddressCard";
import IssueReturn from "@/components/IssueReturn";
import { useCartStore } from "@/lib/stores/cart-store";
import { IItem } from "@/lib/types";
import { toast } from "sonner";
import OrderTabs from "../../../components/OrderTabs";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  order_id: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  items: IItem[];
  totalPrice: number;
  amountPaid: number;
  discountedPrice: number;
  deliveryFee: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  processedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  logistics?: { trackingUrl: string }

}

interface ReturnInputs {
  products: string[];
  reason: string;
  itemUsed: string;
  phoneNumber: string;
  additionalNotes: string;
  imageEvidence: File | null;
  otherReason: string;
}

const INITIAL_RETURN_INPUTS: ReturnInputs = {
  products: [],
  reason: "",
  itemUsed: "",
  phoneNumber: "",
  additionalNotes: "",
  imageEvidence: null,
  otherReason: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (date: string | null | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", { dateStyle: "long" });
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Status() {
  const params = useParams();
  const orderId = params?.id as string | undefined;

  const { getOrder } = useOrders();
  const { postIssueReturn } = useIssueReturn();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [returnModal, setReturnModal] = useState(false);
  const [inputs, setInputs] = useState<ReturnInputs>(INITIAL_RETURN_INPUTS);
  console.log(orderId);
  const {
    addItem,

  } = useCartStore();

  // Fetch order data
  useEffect(() => {
    if (!orderId) {
      setError("Order ID is required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchOrder = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getOrder(orderId);
        setOrder(data.message as any)
   
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchOrder();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const _handleSubmit = useCallback(async () => {
    if (!order) return;

    const formData = new FormData();
    inputs.products.forEach((p) => formData.append("product[]", p));
    formData.append("order", order._id);
    formData.append("reason", inputs.reason);
    formData.append("itemUsed", JSON.stringify(inputs.itemUsed === "Yes"));
    formData.append("phoneNumber", inputs.phoneNumber);
    formData.append("additionalNotes", inputs.additionalNotes);
    if (inputs.imageEvidence) {
      formData.append("imageEvidence", inputs.imageEvidence);
    }
    formData.append("otherReason", inputs.otherReason);

    try {
      const success = await postIssueReturn(formData);
      if (success) {
        setReturnModal(false);
        setInputs(INITIAL_RETURN_INPUTS);
      }
    } catch (err) {
      // Handle error appropriately — toast, alert, etc.
      console.error("Return submission failed:", err);
    }
  }, [order, inputs, postIssueReturn]);

  const isDelivered = useMemo(
    () => order?.orderStatus.toLowerCase().includes("delivered") ?? false,
    [order?.orderStatus],
  );

  const itemCount = order?.items.length ?? 0;

  // ── Loading / Error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ImSpinner8 className="animate-spin text-2xl text-brand_pink" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error ?? "Order not found"}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-brand_pink px-6 py-2 text-sm text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  // return <></>;
  return (
    <div>
      <OrderTabs
        handleSearchInputChange={() => { }}
        text="Order Tracking"
        showFilterTabs={false}
      />

      <section className="flex flex-col rounded-2xl bg-white p-5 md:gap-5 md:p-8">
        <div className="font-poppins">
          <h1 className="mb-5 text-lg font-medium">Order Tracking</h1>

          <div className="flex flex-col gap-2 text-sm">
            <p>Order #{order.order_id}</p>
            <p className="text-black/70">
              Placed On:{" "}
              <span className="text-primaryhover">
                {formatDate(order.processedAt)}
              </span>
            </p>
            <p className="text-black/70">
              Delivery Date:{" "}
              <span className="text-primaryhover">
                {formatDate(order.processedAt)}
              </span>
            </p>
            <p className="text-black/70">No of Items: {itemCount}</p>

            <p className="mt-10 text-sm font-semibold text-black">
              Total for {itemCount} {itemCount === 1 ? "Item" : "Items"}: ₦
              {order.amountPaid.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex-1">
          {order.items.map((item, index) => (
            <OrderCard
              key={index}
              image={item.image}
              title={item.name}
              variant={
                item.variants.options.length > 0
                  ? item.variants.options.map(item => `${item.name}: ${item.value}`).join(", ")
                  : undefined
              }
              price={item.price}
              discount={item.discountedPrice}
              qty={item.qty}
            />
          ))}

          <div className="flex-1">
            <OrderStatus
              deliveredAt={order.deliveredAt}
              createdAt={order.createdAt}
              processedAt={order.processedAt}
              shippedAt={order.shippedAt}
              trackingUrl={order.logistics?.trackingUrl}
            />
          </div>

          <div className="my-10 grid grid-cols-3 gap-2 font-poppins md:w-1/2">
            <button
              type="button"
              className="flex h-10 items-center justify-center rounded-full border bg-brand_pink px-3 py-1 text-xs text-white md:px-6"
              onClick={() => {
                addItem(
                  order.items.map((item) => ({
                    ...item.product,
                    quantity: item.qty,
                    selectedVariants: item.variants.options,
                    selected: true,
                    basePrice: item.price,
                    discount: item.discountedPrice,
                    finalPrice: item.price - item.discountedPrice,
                  })),
                );

                toast.success("Items added to cart!");
              }}
            >
              Buy Again
            </button>

            {isDelivered && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: implement review flow
                    // itemCount > 1 ? setChooseProductModal(true) : toggleShowReview()
                  }}
                  className="flex h-10 items-center justify-center rounded-full border border-black px-3 py-1 text-xs text-black md:px-6"
                >
                  Leave Review
                </button>

                <button
                  type="button"
                  onClick={() => setReturnModal(true)}
                  className="flex h-10 items-center justify-center rounded-full border border-black px-3 py-1 text-xs text-black md:px-6"
                >
                  Issue return
                </button>
              </>
            )}
          </div>

          <div className="space-y-4">
            <OrderSummaryCard
              amountPaid={order.amountPaid}
              discount={order.discountedPrice}
              shipping={order.deliveryFee}
              totalPrice={order.totalPrice}
            />
            <ShippingAddressCard
              city={order.shippingAddress.city}
              country={order.shippingAddress.country}
              street={order.shippingAddress.street}
              name={order.shippingAddress.fullName}
              postalCode={order.shippingAddress.postalCode}
            />
          </div>
        </div>

        <IssueReturn
          data={{ _id: order._id, items: order.items }}
          returnModal={returnModal}
          setReturnModal={setReturnModal}
        />
      </section>
    </div>
  );
}
