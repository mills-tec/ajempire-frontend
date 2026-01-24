"use client";
import { useIssueReturn } from "@/api/customHooks";
import OrderCard from "@/app/components/OrderCard";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function Returns() {
  const pathname = usePathname();

  const { getReturnRequests } = useIssueReturn();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    const fetchReturns = async () => {
      const data = await getReturnRequests();
      setReturns(data);
    };
    fetchReturns();
  }, []);

  return (
    <div className="font-poppins">


      <ul className="space-y-4">
        <div className="border-8  border-[#F9F9F9] md:border-none" >
          <div className="md:p-6 md:ml-8  rounded-xl my-8  bg-white p-4 ">
            <div className="flex items-center justify-between">
              <h1 className="font-semibold capitalize">
                Order #12342
              </h1>
              <p className="text-black/60 text-sm">
                12 August, 2023
                {/* {date.toLocaleString("en-us", { dateStyle: "long" })} */}
              </p>
            </div>
            <div className="pt-6 space-y-3">
              <div className="flex gap-5 border-b pb-3 md:border-b-0 ">
                <div>
                  <div className="w-[8.5rem] h-[6rem] bg-gray-400 rounded-lg overflow-hidden flex relative">
                    <Image src={""} alt={""} fill className="object-cover" />
                  </div>
                </div>
                <div className="space-y-1 mt-2 col-span-2 ">
                  <h2 className="text-sm">Damaged Item </h2>
                  <h4 className="text-xs font-light">Item Used: Yes
                  </h4>
                  <div className="text-xs font-light grid md:grid-cols-3  gap-4 w-[200px]">
                    <div className="md:col-span-2 flex justify-between">
                      <p className="font-semibold">
                        ₦10000
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


              <div className="relative">
                {/* {title.includes("delivered") && (
                      <Ellipsis className="text-black/60 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)} />
                    )}
                    <div onClick={() => { setShowIssueModal(true); setShowDropdown(false) }} className="absolute w-20 h-6 -top-[140%] cursor-pointer left-0" style={{ scale: showDropdown ? 1 : 0, transition: "all 0.1s ease-in-out" }}>
        
                      <div className="left-0 w-28  h-8 border  border-black/10  bg-white  rounded-2xl z-10  flex items-center justify-center text-[12px] font-poppins overflow-hidden">
                        <p className="text-black/60  bg-white text-center relative z-10">Issue Return</p>
                      </div>
        
                      <div className="rotate-[60deg]  absolute w-2 h-3 left-[20%] translate-x-[-50%]  border-b border-r border-black/10 top-[110%] bg-white "></div>
        
        
                    </div> */}

              </div>

              <div className="space-y-3">
                <p className="text-sm w-full text-right">
                  Total for {`${1}  Damaged ${1 > 1 ? "Items" : "item"}`}
                  :{" "}
                  <span className="font-medium">
                    ₦
                    100
                  </span>
                </p>
                <Link
                  href={`${pathname}/1`}
                  className="flex items-center justify-center rounded-full text-xs px-2 md:text-sm py-1  md:px-6  text-white bg-brand_pink h-10"

                >
                  View Status
                </Link>







              </div>
            </div>
          </div>
        </div>

      </ul>
    </div>
  );
}
