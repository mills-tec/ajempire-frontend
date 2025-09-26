import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function PasswordResetCompletePage() {
  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white rounded-3xl flex flex-col justify-between size-full lg:h-[25rem] lg:w-[27rem]">
        <div className="flex justify-between items-center border-b px-4 border-b-black/10 pt-8 pb-3">
          <div></div>
          <h1></h1>
          <Link href={"signin"}>
            <X className="h-4 cursor-pointer" />
          </Link>
        </div>
        <div className="flex-1 pt-[4rem] space-y-8 py-8">
          <div className="w-[80%] mx-auto flex flex-col items-center space-y-8">
            <svg
              width="86"
              height="86"
              viewBox="0 0 86 86"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.9329 43.0005L40.1329 57.3339L63.0662 28.6672M42.9995 83.1339C37.7292 83.1339 32.5104 82.0958 27.6412 80.0789C22.772 78.062 18.3477 75.1058 14.621 71.3791C10.8943 67.6523 7.93807 63.2281 5.92118 58.3589C3.90429 53.4897 2.86621 48.2709 2.86621 43.0005C2.86621 37.7301 3.90429 32.5114 5.92118 27.6422C7.93807 22.773 10.8943 18.3487 14.621 14.622C18.3477 10.8952 22.772 7.93904 27.6412 5.92216C32.5104 3.90527 37.7292 2.86719 42.9995 2.86719C53.6436 2.86719 63.8516 7.09551 71.3781 14.622C78.9046 22.1484 83.1329 32.3565 83.1329 43.0005C83.1329 53.6445 78.9046 63.8526 71.3781 71.3791C63.8516 78.9055 53.6436 83.1339 42.9995 83.1339Z"
                stroke="url(#paint0_linear_1473_8354)"
                stroke-width="3.5"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1473_8354"
                  x1="2.86621"
                  y1="43.0005"
                  x2="83.1329"
                  y2="43.0005"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#FF008C" />
                  <stop offset="1" stop-color="#A600FF" />
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-sm">Your password has been reset</h1>
            <div className="bg-white w-full">
              <Button
                variant={"outline"}
                className="w-full !rounded-full text-white hover:!text-white !bg-brand_gradient_dark"
                type="submit"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
