"use client";
import { useOrders } from "@/api/customHooks";
import OrderTabs from "../../components/OrderTabs";
import OrdersContent from "@/app/components/OrdersContent";
import { useEffect, useState } from "react";
import Spinner from "@/app/components/Spinner";
import Reviews from "../Reviews";
import { IOrder } from "@/lib/types";
import { toast } from "react-toastify";

export default function Orders({
  params,
}: {
  params: Promise<{ status: string }>;
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
  useEffect(() => {
    (async () => {
      const orders = await getAllOrders();

      setData({ original: orders, filtered: orders });
      setOrderStatus((await params).status);
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
    <div className="lg:px-5 w-full mt-3  lg:block overflow-hidden ">
      <OrderTabs handleSearchInputChange={handleSearchInputChange} />
      {isLoading ? (
        <div className="h-[60vh]  flex items-center justify-center">
          <Spinner />
        </div>
      ) : data.filtered.length > 0 ? (
        <div className=" overflow-auto h-screen">
          {orderStatus == "all" || searchInput.length > 0 ? (
            <>
              {data.filtered
                .filter((order) => order.orderStatus == "processing")
                .map((order, index: number) => {
                  return (
                    <OrdersContent
                      order_id={order.order_id}
                      items={order.items}
                      key={index}
                      title={order?.orderStatus}
                      dateCreated={order?.createdAt}
                    />
                  );
                })}
              {data.filtered
                .filter((order) => order.orderStatus == "shipped")
                .map((order, index: number) => {
                  return (
                    <OrdersContent
                      order_id={order.order_id}
                      items={order.items}
                      key={index}
                      title={order?.orderStatus}
                      dateCreated={order?.createdAt}
                    />
                  );
                })}

              {data.filtered
                .filter((order) => order.orderStatus == "delivered")
                .map((order, index: number) => {
                  return (
                    <OrdersContent
                      order_id={order.order_id}
                      items={order.items}
                      key={index}
                      title={order?.orderStatus}
                      dateCreated={order?.createdAt}
                    />
                  );
                })}
            </>
          ) : (
            <>
              {orderStatus.includes("review") ? (
                <>
                  <Reviews
                    items={[
                      ...new Map(
                        data.original
                          .filter((order) => order.orderStatus === "delivered")
                          .flatMap((order) => order.items)
                          .map((item) => [item.product, item])
                      ).values(),
                    ]}
                  />
                </>
              ) : data.filtered.filter(
                  (order) => order.orderStatus == orderStatus
                ).length > 0 ? (
                <>
                  {data.filtered
                    .filter((order) => order.orderStatus == orderStatus)
                    .map((order, index: number) => {
                      return (
                        <OrdersContent
                          order_id={order.order_id}
                          items={order.items}
                          key={index}
                          title={order?.orderStatus}
                          dateCreated={order?.createdAt}
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
        <div className="h-[60vh] flex items-center justify-center">
          <h1>
            {searchInput.length > 0
              ? "Couldn't find any order with that Id"
              : "You do not have any order yet."}
          </h1>
        </div>
      )}
    </div>
  );
}
