"use client";
import { useIssueReturn } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import OrderTabs from "../components/OrderTabs";
import { IReturnRequest } from "@/lib/types";
import EmptyList from "@/components/EmptyList";
import Skeleton from "@/components/ui/Skeleton";

export default function Returns() {
  const pathname = usePathname();

  const { getReturnRequests } = useIssueReturn();
  const [loading, setLoading] = useState(true);
  const [returns, setReturns] = useState<IReturnRequest[]>([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const data = await getReturnRequests().finally(() => {
        setLoading(false);
      });
      if (data.status) {
        setReturns(data.message);

      }

    };
    fetchReturns();
  }, []);

  // return;

  return (
    <div className="font-poppins">
      {loading ? (
        <div className="space-y-4">
          <Skeleton height={44} borderRadius={8} className="w-full" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 md:p-6">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <Skeleton height={16} borderRadius={4} className="w-32" />
                <Skeleton height={14} borderRadius={4} className="w-28" />
              </div>
              {/* Card body */}
              <div className="flex gap-5 border-b pb-3 md:border-b-0">
                <Skeleton width={136} height={96} borderRadius={8} className="shrink-0" />
                <div className="flex flex-col gap-2 mt-2 flex-1">
                  <Skeleton height={14} borderRadius={4} className="w-2/5" />
                  <Skeleton height={12} borderRadius={4} className="w-1/4" />
                </div>
              </div>
              {/* Card footer */}
              <div className="flex justify-between items-end mt-5">
                <div />
                <div className="flex flex-col gap-3 w-full md:w-auto items-start md:items-end">
                  <Skeleton height={14} borderRadius={4} className="w-48" />
                  <Skeleton height={40} borderRadius={24} className="w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (returns.length > 0 ? <ul className="space-y-4 overflow-auto h-screen">
        <OrderTabs showFilterTabs={false} text="Returns" handleSearchInputChange={() => { }} />
        {returns.map((ret, key) => (
          <div key={key}>

            <div key={key} className="border-8  border-[#F9F9F9] md:border-none" >
              <div className="md:p-6  rounded-xl my-8  bg-white p-4 ">
                <div className="flex items-center justify-between">
                  <h1 className="font-semibold capitalize">
                    Order #{ret.order.order_id}
                  </h1>
                  <p className="text-black/60 text-sm">
                    {new Date(ret.createdAt).toLocaleString("en-us", { dateStyle: "long" })}
                  </p>
                </div>
                <div className="pt-6 space-y-3 grid">
                  <div className="flex gap-5 border-b pb-3 md:border-b-0 ">
                    <div>
                      <div className="w-[8.5rem] h-[6rem] bg-gray-400 rounded-lg overflow-hidden flex relative">
                        <Image src={ret.imageEvidence} alt={ret.reason} fill className="object-cover" sizes="(max-width: 768px) 100vw, 8.5rem" loading="eager" />
                      </div>
                    </div>
                    <div className="space-y-1 mt-2 md:col-span-2 ">
                      <h2 className="text-sm">Damaged Item </h2>
                      <h4 className="text-xs font-light">Item Used: Yes
                      </h4>
                      <div className="text-xs font-light grid md:grid-cols-3  gap-4 w-[200px]">
                        <div className="md:col-span-2 flex justify-between">
                          <p className="font-semibold">

                          </p>

                          {/* <p className="text-black/50 line-through">
                        1000
                        {discount ? `₦${price.toFixed(2)}` : ""}
                      </p> */}
                        </div>
                        {/* <p className="text-right text-sm">x{1}</p> */}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between my-5  items-end">




                  <div className="space-y-3  w-full md:w-auto">
                    <p className="text-sm w-full md:text-right">
                      Total for {`${ret.product.length}  Damaged ${ret.product.length > 1 ? "Items" : "item"}`}
                      :{" "}
                      <span className="font-medium">
                        ₦{Number(ret.total).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </p>
                    <Link
                      href={`${pathname}/${ret._id}`}
                      className="flex items-center justify-center rounded-full text-xs px-2 md:text-sm py-1  md:px-6  text-white bg-brand_pink h-10"

                    >
                      View Status
                    </Link>







                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      </ul> : <EmptyList message="Nothing to return" writeup="You haven't started any returns yet. Browse your recent orders to return or exchange an item." btnText="Browse Orders" href="/pages/ordersandaccount/orders/all" />)}


    </div>
  );
}
