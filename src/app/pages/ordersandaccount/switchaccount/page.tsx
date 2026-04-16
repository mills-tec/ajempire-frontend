"use client";
import AuthWrapper from "@/app/components/auth-component/AuthWrapper";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getInitials } from "@/lib/utils";
import { Check, Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function SwitchAccount() {
  const savedAccounts =
    typeof window !== "undefined"
      ? localStorage.getItem("savedAccounts")
      : null;
  const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
  const [showIntro, setShowIntro] = useState(false);
  const { setUser, user } = useAuthStore();

  const handleSwitchAccount = (account: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ajempire_signin_user",
        JSON.stringify({ token: account.token, user: account.user }),
      );
      setUser({
        id: account.user.id, // 👈 make sure this exists
        email: account.email,
        name: account.user.fullname,
      });
    }
  };

  return (
    <div className="font-poppins lg:p-10 ">
      <div className="lg:hidden p-5  flex items-center  mb-[20px] shadow-md">
        <Link href={"/pages/ordersandaccount/settings"}>
          <svg
            width="9"
            height="17"
            viewBox="0 0 9 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.78122 15.2198C8.8509 15.2895 8.90617 15.3722 8.94388 15.4632C8.9816 15.5543 9.00101 15.6519 9.00101 15.7504C9.00101 15.849 8.9816 15.9465 8.94388 16.0376C8.90617 16.1286 8.8509 16.2114 8.78122 16.281C8.71153 16.3507 8.62881 16.406 8.53776 16.4437C8.44672 16.4814 8.34914 16.5008 8.25059 16.5008C8.15204 16.5008 8.05446 16.4814 7.96342 16.4437C7.87237 16.406 7.78965 16.3507 7.71996 16.281L0.219965 8.78104C0.150232 8.71139 0.0949136 8.62867 0.0571704 8.53762C0.0194272 8.44657 0 8.34898 0 8.25042C0 8.15186 0.0194272 8.05426 0.0571704 7.96321C0.0949136 7.87216 0.150232 7.78945 0.219965 7.71979L7.71996 0.219792C7.8607 0.0790615 8.05157 -3.92322e-09 8.25059 0C8.44961 3.92322e-09 8.64048 0.0790615 8.78122 0.219792C8.92195 0.360523 9.00101 0.551394 9.00101 0.750417C9.00101 0.94944 8.92195 1.14031 8.78122 1.28104L1.8109 8.25042L8.78122 15.2198Z"
              fill="black"
            />
          </svg>
        </Link>
        <div className=" w-full text-center font-semibold text-black/70">
          <p>Switch Account</p>
        </div>
      </div>
      <div className=" bg-white font-poppins lg:p-10 p-5">
        <div className=" hidden lg:flex items-center gap-4 mb-10">
          <p className="text-lg font-semibold">Switch Account</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {accounts.map((account: any, index: number) => (
            <div
              onClick={() => handleSwitchAccount(account)}
              key={index}
              className="md:col-span-2 p-4 bg-white border border-[#00000033] flex gap-5 items-center justify-between cursor-pointer"
            >
              <div className="flex gap-5 items-center">
                <div className="w-10 h-10 bg-[#D9D9D9]  rounded-full flex items-center justify-center">
                  <p className="text-lack text-sm font-semibold">
                    {getInitials(account.user.fullname)}
                  </p>
                </div>
                <div className="">
                  <p className="font-semibold">{account.user.fullname}</p>
                  <p className="text-sm opacity-80">{account.email}</p>
                </div>
              </div>
              {account.email === user?.email && <Check />}
            </div>
          ))}

          <div
            onClick={() => setShowIntro(true)}
            className="md:col-span-2 p-4 bg-white border border-[#00000033] flex gap-5 items-center justify-between cursor-pointer"
          >
            <div className="flex gap-5 items-center">
              <div className="w-10 h-10 bg-[#D9D9D9]  rounded-full flex items-center justify-center">
                <Plus />
              </div>
              <p className="text-sm opacity-80">Add Account</p>
            </div>
          </div>

          {showIntro && <AuthWrapper onClose={() => setShowIntro(false)} />}
        </div>
      </div>
    </div>
  );
}
