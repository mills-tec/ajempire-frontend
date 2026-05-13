"use client";

import { useOrders } from "@/api/customHooks";
import OrderTabs from "../../components/OrderTabs";
import OrdersContent from "@/app/components/OrdersContent";
import { useEffect, useMemo, useState } from "react";
import Spinner from "@/app/components/Spinner";
import Reviews from "../Reviews";
import { IOrder } from "@/lib/types";
import EmptyList from "@/components/EmptyList";
import { getUser } from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

// Defined outside component — stable reference, no recreation on render
const STATUS_ORDER = ["processing", "shipped", "delivered"] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrdersProps {
  params: Promise<{ type: string }>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Orders({ params }: OrdersProps) {
  const { getAllOrders, isLoading } = useOrders();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");

  // Fetch orders + resolve params once on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [fetchedOrders, resolvedParams] = await Promise.all([
        getAllOrders(),
        params,
      ]);
      if (!cancelled) {
        setOrders(fetchedOrders ?? []);
        setOrderStatus(resolvedParams.type);
      }
    })();

    return () => {
      cancelled = true;
    };
    // NOTE: getAllOrders should be wrapped in useCallback inside useOrders
    // to keep this dependency stable — otherwise add eslint-disable
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state via useMemo (replaces duplicated filter calls) ───────────

  const filteredOrders = useMemo(() => {
    if (!searchInput) return orders;

    // Numeric input → search by order_id
    if (!isNaN(Number(searchInput))) {
      return orders.filter((o) => String(o.order_id) === searchInput);
    }

    // Text input → search by item name, drop orders with no matching items
    return orders
      .map((order) => ({
        ...order,
        items: order.items.filter((item) =>
          item.name.toLowerCase().includes(searchInput.toLowerCase()),
        ),
      }))
      .filter((order) => order.items.length > 0);
  }, [orders, searchInput]);

  // ── Review update — stable reference via functional update ─────────────────

  const setUpdatedReviews = (review: any) => {
    const { product, ...rest } = review;

    setOrders((prev) =>
      prev.map((order) => ({
        ...order,
        items: order.items.map((item) =>
          (item.product as any)._id === product
            ? {
                ...item,
                product: {
                  ...(item.product as any),
                  reviews: (item.product as any).reviews.map((rev: any) =>
                    rev._id === review._id ? { product, ...rest } : rev,
                  ),
                },
              }
            : item,
        ),
      })),
    );
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const handleSearchInputChange = (value: string) => setSearchInput(value);

  // Render a list of orders — extracted to avoid repeating JSX
  const renderOrders = (list: IOrder[]) =>
    list.map((order, index) => (
      <OrdersContent
        key={order._id ?? index} // prefer stable _id over index
        id={order._id}
        order_id={order.order_id}
        items={order.items.map((item) => ({
          ...item,
          product: item.product,
        }))}
        title={order.orderStatus}
        dateCreated={order.createdAt}
        setUpdatedReviews={setUpdatedReviews}
      />
    ));

  // ── Render logic ───────────────────────────────────────────────────────────

  const isSearching = searchInput.length > 0;
  const isAllTab = orderStatus === "all";
  const isReviewTab = orderStatus.includes("review");
  const userId = getUser()?._id;

  const renderContent = () => {
    // "all" tab or active search — group by status in defined order
    if (isAllTab || isSearching) {
      return STATUS_ORDER.map((status) => {
        const matched = filteredOrders.filter(
          (o) => o.orderStatus.toLowerCase() === status,
        );
        return matched.length > 0 ? (
          <div key={status}>{renderOrders(matched)}</div>
        ) : null;
      });
    }

    // Reviews tab
    if (isReviewTab) {
      const reviewItems = filteredOrders
        .flatMap((order) => order.items)
        .filter(
          (item) =>
            Array.isArray((item.product as any).reviews) &&
            (item.product as any).reviews.length > 0 &&
            // NOTE: was comparing review.user === getUser()?._id — use string comparison for ObjectId safety
            (item.product as any).reviews.some(
              (review: any) => review.user?.toString() === userId?.toString(),
            ),
        );


      return (
        <Reviews items={reviewItems} setUpdatedReviews={setUpdatedReviews} />
      );
    }

    // Specific status tab
    const statusMatched = filteredOrders.filter(
      (o) => o.orderStatus.toLowerCase() === orderStatus,
    );

    if (statusMatched.length > 0) return renderOrders(statusMatched);

    return (
      <div className="flex h-[60vh] items-center justify-center">
        <h1>You do not have any {orderStatus} order yet.</h1>
      </div>
    );
  };

  // ── States ─────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <>
        <OrderTabs
          handleSearchInputChange={handleSearchInputChange}
          text="Your Orders"
        />
        <EmptyList
          writeup=""
          message={
            isSearching
              ? "Couldn't find any order with that Id"
              : "You do not have any order yet."
          }
        />
      </>
    );
  }

  return (
    <div className="mt-3 w-full overflow-hidden font-poppins lg:mt-0 lg:block lg:px-5">
      <OrderTabs
        handleSearchInputChange={handleSearchInputChange}
        text="Your Orders"
      />
      <div className="h-screen overflow-auto">{renderContent()}</div>
    </div>
  );
}
