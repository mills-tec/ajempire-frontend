import { Button } from "@/components/ui/button";
import Image from "next/image";

import GoogleLogo from "@/assets/google.png";

import { useGoogleOneTapLogin } from "@react-oauth/google";
import { toast } from "sonner";

export default function GoogleButton() {
  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      console.log("google auth: ", credentialResponse);
    },
    onError: () => {
      toast.error("Login Failed");
      console.log("Login Failed");
    },
  });
  return (
    <div>
      {/* <Link href={""}> */}

      <Button
        variant={"outline"}
        className="relative !rounded-full w-full text-sm flex items-center justify-center gap-4"
        onClick={() => {}}
      >
        <span className="relative w-6 h-6">
          <Image
            src={GoogleLogo}
            alt="Google logo"
            fill
            className="object-contain"
            sizes="24px"
            priority
          />
        </span>
        Continue with Google
      </Button>
      {/* </Link> */}
    </div>
  );
}
