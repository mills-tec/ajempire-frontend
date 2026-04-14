"use client";
import React, { useEffect, useState } from "react";
import { useBrowsingHistory } from "@/api/customHooks";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { Product } from "@/lib/types";
import { TrashIcon } from "lucide-react";
import EmptyNotification from "@/components/EmptyNotification";
import EmptyList from "@/components/EmptyList";
import { Elipsis } from "@/components/svgs/Icons";
type BrowsingHistory = {
  latestDate: string;
  products: {
    product: Product;
    historyId: string;
  }[];
  _id: string;
};
export default function page() {
  const {
    getBrowsingHistory,
    uiLoading,
    deleteBrowsingHistory,
    clearBrowsingHistory,
  } = useBrowsingHistory();
  const [data, setData] = useState<{
    nextCursor: string;
    items: BrowsingHistory[];
    hasPage: boolean;
  }>({
    nextCursor: "",
    items: [],
    hasPage: true,
  });

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [showCheckBox, setShowCheckbox] = useState<boolean>(false);
  const [infiniteRef] = useInfiniteScroll({
    loading: uiLoading,
    hasNextPage: data.hasPage,
    onLoadMore: async () => {
      const cursor = data.nextCursor || "";
      if (!cursor) return;

      try {
        const newData = await getBrowsingHistory(cursor, 10); // fetch next page
        // Update the cached query to append new products
        if (!newData) return; // 🚨 prevents crash on 401
        setData((prev) => ({
          ...prev,
          //   hasPage: newData.hasPage,
          hasPage: newData.hasPage ?? false,
          items: [...prev.items, ...(newData.browsingHistory ?? [])],
          //   nextCursor: newData.nextCursor,
          nextCursor: newData.nextCursor ?? "",
        }));
      } catch (err) {
        console.error("Error loading more products:", err);
      }
    },
    // disabled: Boolean(false),
    disabled: uiLoading,
  });

  const handleDelete = () => {
    const updatedItems = data.items.map((item) => ({
      ...item,
      products: item.products.filter(
        (product) => !checkedItems.includes(product.historyId),
      ),
    }));
    //    deleting items
    setData((prev) => ({
      ...prev,
      items: updatedItems.filter(
        (item: { products: { historyId: string }[] }) =>
          item.products.length > 0,
      ),
    }));
    setCheckedItems([]);
    setShowCheckbox(false);

    // making api request
    // checking if number of checked items is ame as number of items on user's history, so that we can clear history
    if (
      data.items.flatMap((item) => item.products.map((item) => item.historyId))
        .length === checkedItems.length
    ) {
      // clear all
      clearBrowsingHistory();
    } else {
      // clear selected items
      deleteBrowsingHistory(checkedItems);
    }
  };

  useEffect(() => {
    const getData = async () => {
      // const res = await getBrowsingHistory("", 10);

      // setData(({ hasPage: res.hasPage, items: res.browsingHistory, nextCursor: res.nextCursor }))
      const res = await getBrowsingHistory("", 10);

      if (!res) return; // 🚨 prevents crash on 401

      setData({
        hasPage: res.hasPage ?? false,
        items: res.browsingHistory ?? [],
        nextCursor: res.nextCursor ?? "",
      });
    };
    getData();
  }, []);

  return (
    <div className="pt-10">
      {!uiLoading && data.items.length === 0 ? (
        <EmptyList
          message="Looks like you haven’t viewed anything yet!"
          writeup="Start shopping to discover amazing products!"
          href="/"
          btnText="Start Shopping"
        />
      ) : (
        data.items.map(
          (
            items: {
              latestDate: string;
              products: { product: Product; historyId: string }[];
              _id: string;
            },
            itemIndex: number,
          ) => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const groupDate = new Date(items._id);
            return (
              <div
                // key={itemIndex}
                key={items._id}
                className="space-y-1"
              >
                <div className="flex items-center gap-3 justify-between p-2">
                  <div className="flex items-center gap-3">
                    {showCheckBox && (
                      <input
                        checked={items.products.every(
                          (product: { product: Product; historyId: string }) =>
                            checkedItems.includes(product.historyId),
                        )}
                        type="checkbox"
                        className="rounded-full accent-primaryhover cursor-pointer"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCheckedItems([
                              ...checkedItems,
                              ...items.products.map(
                                (product: {
                                  product: Product;
                                  historyId: string;
                                }) => product.historyId,
                              ),
                            ]);
                          } else {
                            setCheckedItems(
                              checkedItems.filter(
                                (id) =>
                                  !items.products
                                    .map(
                                      (product: {
                                        product: Product;
                                        historyId: string;
                                      }) => product.historyId,
                                    )
                                    .includes(id),
                              ),
                            );
                          }
                        }}
                      />
                    )}
                    <p className="font-poppins ">
                      {groupDate.toDateString() === today.toDateString()
                        ? "Today"
                        : groupDate.toDateString() === yesterday.toDateString()
                          ? "Yesterday"
                          : groupDate.toLocaleDateString("en-us", {
                              dateStyle: "long",
                            })}
                    </p>
                  </div>

                  {itemIndex === 0 && (
                    <p
                      className="font-poppins cursor-pointer text-xs"
                      onClick={() => setShowCheckbox(!showCheckBox)}
                    >
                      Manage
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5  gap-6 ">
                  {items.products.map(
                    (
                      product: { product: Product; historyId: string },
                      index: number,
                    ) => (
                      <div
                        //   key={index}
                        key={product.historyId}
                        className="relative"
                      >
                        {showCheckBox ? (
                          <input
                            type="checkbox"
                            className="absolute top-7 right-0 z-10 rounded-full accent-primaryhover cursor-pointer"
                            checked={checkedItems.includes(product.historyId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCheckedItems([
                                  ...checkedItems,
                                  product.historyId,
                                ]);
                              } else {
                                setCheckedItems(
                                  checkedItems.filter(
                                    (id) => id !== product.historyId,
                                  ),
                                );
                              }
                            }}
                          />
                        ) : (
                          <span className="absolute top-8 left-7 z-10 flex items-center justify-center cursor-pointer hover:bg-white h-5 w-5 duration-300 rounded-full">
                            <Elipsis color="black" scale={0.9} />
                          </span>
                        )}
                        <ProductItem
                          key={product.product._id}
                          product={product.product}
                          index={index}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            );
          },
        )
      )}

      <div>
        <p className="font-poppins p-2"></p>
        <EndlessScrollLoading
          infiniteRef={infiniteRef}
          hasNextPage={data.hasPage}
        />
      </div>

      <div
        className={`fixed w-fit min-h-20 bg-white shadow-2xl right-0 bottom-10 border border-transparent duration-300 cursor-pointer flex flex-col items-center justify-center rounded-l-3xl px-5 py-5 space-y-3 ${showCheckBox ? "translate-x-0" : "translate-x-full"}`}
      >
        <div
          onClick={handleDelete}
          className="flex items-center h-10 justify-between gap-3 py-2 px-6 bg-primaryhover text-white w-full rounded-full"
        >
          <TrashIcon size={20} />
          <p className="font-poppins text-xs">Delete ({checkedItems.length})</p>
        </div>

        <div className="flex items-center h-10 justify-between gap-3 py-2 px-6  text-black rounded-full ">
          <label
            htmlFor="select-all"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              id="select-all"
              className="rounded-full accent-primaryhover cursor-pointer"
              onChange={(e) => {
                if (e.target.checked) {
                  setCheckedItems(
                    data.items
                      .map(
                        (item: {
                          products: { product: Product; historyId: string }[];
                        }) =>
                          item.products.map(
                            (product: {
                              product: Product;
                              historyId: string;
                            }) => product.historyId,
                          ),
                      )
                      .flat(),
                  );
                } else {
                  setCheckedItems([]);
                }
              }}
            />
            <p className="font-poppins text-xs">Select All</p>
          </label>
        </div>
      </div>
    </div>
  );
}
