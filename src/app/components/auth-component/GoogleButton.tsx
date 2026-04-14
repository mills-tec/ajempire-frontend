"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

import GoogleLogo from "@/assets/google.png";

type GoogleButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
  onClick?: () => void;
};

export default function GoogleButton({
  disabled = false,
  isLoading = false,
  label,
  onClick,
}: GoogleButtonProps) {
  return (
    <div>
      <Button
        type="button"
        variant={"outline"}
        className="relative h-10 !rounded-full w-full bg-white text-sm flex items-center justify-center gap-[2px] font-extralight disabled:opacity-100 disabled:cursor-wait"
        disabled={disabled}
        aria-busy={isLoading}
        onClick={onClick}
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          <Image
            src={GoogleLogo}
            alt="Google logo"
            fill
            className="object-contain"
            sizes="24px"
            priority
          />
        </span>
        {label ?? (isLoading ? "Preparing Google..." : "Continue with Google")}
      </Button>
    </div>
  );
}
