"use client";
import { useOrders } from "@/api/customHooks";
import OrderTabs from "../../components/OrderTabs";
import OrdersContent from "@/app/components/OrdersContent";
import { useEffect, useState } from "react";
import Spinner from "@/app/components/Spinner";
import Reviews from "../Reviews";
import { IOrder } from "@/lib/types";
import { toast } from "react-toastify";
import EmptyList from "@/components/EmptyList";
import { getUser } from "@/lib/api";

export default function Orders({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { getAllOrders, isLoading } = useOrders();
  const [data, setData] = useState<{
    original: IOrder[];
    filtered: IOrder[];
  }>({
    original: [],
    filtered: [],
  });
  const [orderStatus, setOrderStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");



  const setUpdatedReviews = (review: any) => {
    const { product, ...rest } = review;
    let updated = data.original.map((order) => ({
      ...order,
      items: order.items.map((item) =>
        (item.product as any)._id === product
          ? {
            ...item,
            product: {
              ...(item.product as any),
              reviews: (item.product as any).reviews.map((rev: any) =>
                rev._id === review._id ? { product, ...rest } : rev
              ),
            },
          }
          : item
      ),
    }))

    setData({ original: updated, filtered: updated })

  }
  useEffect(() => {
    (async () => {
      const orders = await getAllOrders();

      setData({ original: orders, filtered: orders });
      setOrderStatus((await params).type);
    })();
  }, []);
  // handling users order id search

  const handleSearchInputChange = (value: string) => {
    // searching for Items by  item name
    let filteredData = [];
    if (isNaN(Number(value))) {
      // returning only orders with items that are same as search
      filteredData = data.original
        .map((order) => ({
          ...order,
          items: order.items.filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase())
          ),
        }))
        .filter((order) => order.items.length > 0);
    } else {
      filteredData = data.original.filter((item) => item?.order_id == value);
    }

    setData((prev) => ({
      ...prev,
      filtered: value.length > 0 ? filteredData : data.original,
    }));
    setSearchInput(value);
  };



  return (
    <div className="lg:px-5 w-full mt-3 lg:mt-0  lg:block overflow-hidden font-poppins">
      <OrderTabs handleSearchInputChange={handleSearchInputChange} text="Your Orders" />
      {isLoading ? (
        <div className="h-[60vh]  flex items-center justify-center">
          <Spinner />
        </div>
      ) : data.filtered.length > 0 ? (
        <div className="overflow-auto h-screen">
          {orderStatus == "all" || searchInput.length > 0 ? (
            <>
              {data.filtered
                .filter((order) => order.orderStatus.toLowerCase() == "processing")
                .map((order, index: number) => {
                  return (
                    <OrdersContent
                      id={order._id}
                      order_id={order.order_id}
                      items={order.items}
                      key={index}
                      title={order?.orderStatus}
                      dateCreated={order?.createdAt}
                      setUpdatedReviews={setUpdatedReviews}
                    />
                  );
                })}
              {data.filtered
                .filter((order) => order.orderStatus.toLowerCase() == "shipped")
                .map((order, index: number) => {
                  return (
                    <OrdersContent
                      id={order._id}
                      order_id={order.order_id}
                      items={order.items}
                      key={index}
                      title={order?.orderStatus}
                      dateCreated={order?.createdAt}
                      setUpdatedReviews={setUpdatedReviews}
                    />
                  );
                })}

              {data.filtered
                .filter((order) => order.orderStatus.toLowerCase() == "delivered")
                .map((order, index: number) => {
                  return (
                    <OrdersContent
                      id={order._id}
                      order_id={order.order_id}
                      items={order.items}
                      key={index}
                      title={order?.orderStatus}
                      dateCreated={order?.createdAt}
                      setUpdatedReviews={setUpdatedReviews}
                    />
                  );
                })}
            </>
          ) : (
            <>
              {orderStatus.includes("review") ? (
                <>
                  <Reviews
                    items={data.filtered.flatMap((order) => order.items).filter((item) => (item.product as any).reviews.length > 0 && (item.product as any).reviews.some((review: any) => review.user === getUser()._id))}
                    setUpdatedReviews={setUpdatedReviews}
                  />
                </>
              ) : data.filtered.filter(
                (order) => order.orderStatus.toLowerCase() == orderStatus
              ).length > 0 ? (
                <>
                  {data.filtered
                    .filter((order) => order.orderStatus.toLowerCase() == orderStatus)
                    .map((order, index: number) => {
                      return (
                        <OrdersContent
                          id={order._id}
                          order_id={order.order_id}
                          items={order.items}
                          key={index}
                          title={order?.orderStatus}
                          dateCreated={order?.createdAt}
                          setUpdatedReviews={setUpdatedReviews}
                        />
                      );
                    })}
                </>
              ) : (
                <div className="h-[60vh] flex items-center justify-center">
                  <h1>You do not have any {orderStatus} order yet.</h1>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <EmptyList message={searchInput.length > 0
          ? "Couldn't find any order with that Id"
          : "You do not have any order yet."} />
      )}
    </div>
  );
}
