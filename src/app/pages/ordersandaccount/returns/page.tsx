"use client";
import { useIssueReturn } from "@/api/customHooks";
import { useEffect, useState } from "react";
import OrderTabs from "../components/OrderTabs";


export default function Returns() {
  const { getReturnRequests } = useIssueReturn();
  const [returns, setReturns] = useState<any[]>([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const data = await getReturnRequests();
      setReturns(data);
    };
    fetchReturns();
  }, []);

  return (
    <div className="lg:px-5 w-full mt-3 lg:mt-0  lg:block overflow-hidden font-poppins">

      {returns.map((returnItem: any) => (
        <div className="bg-white rounded-2xl p-8 space-y-8">
          <div key={returnItem._id}>
            <p className="text-sm">Order #{returnItem.order.order_id}</p>
            {/* <p>{returnItem.dateCreated}</p>
            <p>{returnItem.status}</p> */}
          </div>
        </div>
      ))}
      {/* <OrderTabs handleSearchInputChange={() => { }} text="Your Orders" /> */}

    </div>
  );
}
