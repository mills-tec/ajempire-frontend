"use client";
import { useIssueReturn } from "@/api/customHooks";
import { useEffect, useState } from "react";


export default function Returns() {
  const { getReturnRequests } = useIssueReturn();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const data = await getReturnRequests();
      setReturns(data);
    };
    fetchReturns();
  }, []);
  console.log(returns)

  return (
    <div className="rounded-2xl p-8 bg-white space-y-8">

    </div>
  );
}
