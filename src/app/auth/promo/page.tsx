import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import React from "react";

export default function PromoPage() {
  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white rounded-3xl flex flex-col justify-between size-full lg:h-[30rem] lg:w-[27rem]">
        <div className="flex justify-between items-center border-b px-4 border-b-black/10 pt-8 pb-3">
          <div></div>
          <div>
            <h1>Unlock Your incredible deals</h1>
            <p className="text-xs text-black/60 text-center">
              Subscribe to emails to get all
            </p>
          </div>
          <X className="h-4 cursor-pointer" />
        </div>
        <div className="flex-1 pt-[3rem] space-y-5 py-8">
          <div className="w-[70%] mx-auto">
            <svg
              width="1"
              height="27"
              viewBox="0 0 1 27"
              className="ml-[0.6rem]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0.5"
                y1="0.644531"
                x2="0.499999"
                y2="26.9591"
                stroke="#24B147"
              />
            </svg>

            <div className="flex gap-6 items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_1476_8124)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10ZM9.42933 14.28L15.1867 7.08267L14.1467 6.25067L9.23733 12.3853L5.76 9.488L4.90667 10.512L9.42933 14.28Z"
                    fill="#24B147"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1476_8124">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <p className="text-sm">Incredible coupons</p>
            </div>

            <svg
              width="1"
              height="27"
              viewBox="0 0 1 27"
              className="ml-[0.6rem] mt-1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0.5"
                y1="0.644531"
                x2="0.499999"
                y2="26.9591"
                stroke="#24B147"
              />
            </svg>

            <div className="flex gap-6 items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_1476_8124)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10ZM9.42933 14.28L15.1867 7.08267L14.1467 6.25067L9.23733 12.3853L5.76 9.488L4.90667 10.512L9.42933 14.28Z"
                    fill="#24B147"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1476_8124">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <p className="text-sm">Amazing discounts</p>
            </div>

            <svg
              width="1"
              height="28"
              viewBox="0 0 1 28"
              fill="none"
              className="ml-[0.6rem]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                x1="0.5"
                y1="0.876953"
                x2="0.499999"
                y2="27.1915"
                stroke="#24B147"
                stroke-dasharray="2 2"
              />
            </svg>

            <div className="flex gap-6 mt-1 items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_1476_8124)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10ZM9.42933 14.28L15.1867 7.08267L14.1467 6.25067L9.23733 12.3853L5.76 9.488L4.90667 10.512L9.42933 14.28Z"
                    fill="#24B147"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1476_8124">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <p className="text-sm">Awesome promotions</p>
            </div>

            <div className="flex items-start mt-7 gap-6">
              <Checkbox
                className="!rounded-full data-[state=checked]:!bg-[#24B147] border-[#24B147] active:bg-[#24B147]"
                id="promo"
              />
              <Label htmlFor="promo">
                <span className="font-normal text-black/50">
                  Click Ok to receive AJ Empire marketing message via
                </span>{" "}
                <br />
                <p className="font-normal pt-1">nooblegold042@gmail.com</p>
              </Label>
            </div>
            <Button
              variant={"outline"}
              className="w-full mt-10 !rounded-full text-white hover:!text-white !bg-brand_gradient_dark"
              type="submit"
            >
              Ok
            </Button>
          </div>
        </div>

        <p className="text-xs mx-auto w-[70%] py-8 text-center">
          To opt out, follow instructions in any message or adjust your account
          settings.{" "}
          <span className="text-[#006ACC] underline cursor-pointer">
            Terms of Use
          </span>{" "}
          and{" "}
          <span className="text-[#006ACC] underline cursor-pointer">
            Privacy & Cookie Policy
          </span>
          . Network fees may apply
        </p>
      </div>
    </section>
  );
}
