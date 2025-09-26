import { Button } from "@/components/ui/button";
import React from "react";

export default function EmailNotFoundPage() {
  return (
    <section className="bg-brand_gray/20 h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="bg-white rounded-3xl flex flex-col justify-between size-full lg:h-[25rem] lg:w-[27rem]">
        <div className="flex-1 pt-[4rem] space-y-8 py-8">
          <div className="w-[80%] mx-auto flex flex-col items-center space-y-20">
            <div className="space-y-8">
              <h1 className="font-medium">Email Not Found</h1>
              <p className="text-sm">
                This email address is not registered. Would you like to sign up
                and create an account?
              </p>
            </div>
            <div className="bg-white flex gap-4 w-full">
              <Button
                variant={"outline"}
                className="w-full !rounded-full text-white hover:!text-white !bg-[#FF008C]"
                type="submit"
              >
                Sign Up
              </Button>
              <Button
                variant={"outline"}
                className="w-full !rounded-full text-white hover:!text-white !bg-[#999999]"
                type="submit"
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
