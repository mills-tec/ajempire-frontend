import Image from "next/image";
import butterflyImage from "@/assets/butterfly.png";
import Logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/svgs/CloseIcon";


import { GoogleLogin, GoogleOAuthProvider, useGoogleOneTapLogin } from '@react-oauth/google';
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import Spinner from "../Spinner";
import { useAuthStore } from "@/lib/stores/auth-store";
type IntroCompProps = {
  onClose: () => void; // function prop to handle closing
  setScreen: (
    screen: "intro" | "signin" | "signup" | "phonenumber" | "forgotpassword"
  ) => void;
};

export default function IntroComp({ onClose, setScreen }: IntroCompProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { setIsLoggedIn, setUser } = useAuthStore();

  return (
    <section className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {
        isLoading && <Spinner />
      }
      <div className=" relative bg-brand_gradient lg:rounded-3xl flex flex-col w-full h-full lg:h-[35rem] lg:w-[27rem] text-3xl">
        <div className="relative w-[15rem] mx-auto h-[13rem] overflow-hidden">
          <Image
            src={butterflyImage}
            alt=""
            fill
            className="object-cover"
            sizes="290px"
            priority
          />
        </div>
        <div className="flex-1 object-contain bg-white rounded-t-3xl lg:rounded-3xl">
          <Image
            src={Logo}
            alt=""
            className="mx-auto py-8"
            width={103}
            height={48}
          />

          <div className="w-[80%] space-y-4 mx-auto">
            <GoogleOAuthProvider clientId="97080942381-seubabjh0nq15hdv2nhgj0ij4vjafoh5.apps.googleusercontent.com">
              <GoogleLogin
                theme="outline"
                shape="circle"
                logo_alignment="center"
                size="medium"
                onSuccess={(credentialResponse) => {
                  const token = credentialResponse.credential;
                  setIsLoading(true)
                  axios.post(
                    "https://ajempire-backend.vercel.app/api/auth/google/",
                    {
                      token: token
                    },
                  )
                    .then((res) => {
                      if (res.data?.message?.token) {
                        const token = res.data.message.token;
                        const user = res.data.message.user;
                        // localStorage.setItem("token", token)
                        // localStorage.setItem("user", token)
                        localStorage.setItem(
                          "ajempire_signin_user",
                          JSON.stringify({ token, user })
                        );
                        setIsLoggedIn(true);
                        setUser(user);

                        toast.success("Logged in successfully!", { position: "top-right" });
                        setTimeout(() => {
                          onClose();
                        }, 800);
                      }
                    }
                    )
                    .catch((err) => {
                      console.error("Auth error:", err.response?.data || err.message);
                    })
                    .finally(() => {
                      setIsLoading(false) // stop loading in both success & error
                    });
                }}
                onError={() => {
                  console.log('Login Failed');
                }}
                useOneTap
              />
            </GoogleOAuthProvider>
            <div>
              <Button
                variant={"outline"}
                className="relative !rounded-full w-full text-sm  flex items-center justify-center gap-[2px] font-extralight"
                onClick={() => setScreen("signin")}
              >
                <span className="relative flex items-center justify-center w-6 h-6">
                  <svg
                    width="22"
                    height="18"
                    viewBox="0 0 22 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.11111 1H19.8889C20.5 1 21 1.5 21 2.11111V15.4444C21 16.0556 20.5 16.5556 19.8889 16.5556H2.11111C1.5 16.5556 1 16.0556 1 15.4444V2.11111C1 1.5 1.5 1 2.11111 1Z"
                      stroke="black"
                      strokeOpacity="0.8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1 2.66602L11 8.77713L21 2.66602"
                      stroke="black"
                      strokeOpacity="0.8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Continue with Email
              </Button>
            </div>
            <div>
              <Button
                variant={"outline"}
                className="relative !rounded-full w-full text-sm flex items-center justify-center gap-[2px] font-extralight"
                onClick={() => setScreen("phonenumber")}
              >
                <span className="relative flex items-center justify-center w-6 h-6">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.6292 13.8905L17.0852 13.4375L16.0262 12.3735L15.5722 12.8265L16.6292 13.8905ZM18.6142 13.2475L20.5252 14.2865L21.2402 12.9685L19.3302 11.9305L18.6142 13.2475ZM20.8922 16.3505L19.4722 17.7635L20.5292 18.8265L21.9492 17.4145L20.8922 16.3505ZM18.6062 18.2175C17.1562 18.3535 13.4062 18.2325 9.34417 14.1945L8.28617 15.2575C12.7182 19.6645 16.9372 19.8805 18.7462 19.7115L18.6062 18.2175ZM9.34417 14.1945C5.47317 10.3445 4.83117 7.10747 4.75117 5.70247L3.25317 5.78747C3.35317 7.55547 4.14817 11.1435 8.28617 15.2575L9.34417 14.1945ZM10.7192 8.01447L11.0062 7.72847L9.95017 6.66547L9.66317 6.95047L10.7192 8.01447ZM11.2342 4.09347L9.97417 2.40947L8.77317 3.30947L10.0332 4.99247L11.2342 4.09347ZM5.73317 2.04247L4.16317 3.60247L5.22117 4.66647L6.79017 3.10647L5.73317 2.04247ZM10.1912 7.48247C9.66117 6.95047 9.66117 6.95047 9.66117 6.95247H9.65917L9.65617 6.95647C9.60865 7.00439 9.5661 7.05699 9.52917 7.11347C9.47517 7.19347 9.41617 7.29847 9.36617 7.43147C9.24445 7.7748 9.21412 8.14388 9.27817 8.50247C9.41217 9.36747 10.0082 10.5105 11.5342 12.0285L12.5922 10.9645C11.1632 9.54447 10.8232 8.68047 10.7602 8.27247C10.7302 8.07847 10.7612 7.98247 10.7702 7.96047C10.7762 7.94714 10.7762 7.94514 10.7702 7.95447C10.7613 7.96827 10.7512 7.98132 10.7402 7.99347L10.7302 8.00347L10.7202 8.01247L10.1912 7.48247ZM11.5342 12.0285C13.0612 13.5465 14.2102 14.1385 15.0762 14.2705C15.5192 14.3385 15.8762 14.2845 16.1472 14.1835C16.299 14.1279 16.4408 14.0483 16.5672 13.9475L16.6172 13.9025L16.6242 13.8965L16.6272 13.8935L16.6282 13.8915C16.6282 13.8915 16.6292 13.8905 16.1002 13.3585C15.5702 12.8265 15.5732 12.8255 15.5732 12.8255L15.5752 12.8235L15.5772 12.8215L15.5832 12.8165L15.5932 12.8065L15.6312 12.7765C15.6405 12.7705 15.6382 12.7711 15.6242 12.7785C15.5992 12.7875 15.5012 12.8185 15.3042 12.7885C14.8902 12.7245 14.0202 12.3845 12.5922 10.9645L11.5342 12.0285ZM9.97417 2.40847C8.95417 1.04847 6.95017 0.832472 5.73317 2.04247L6.79017 3.10647C7.32217 2.57747 8.26617 2.63247 8.77317 3.30947L9.97417 2.40847ZM4.75217 5.70347C4.73217 5.35747 4.89117 4.99547 5.22117 4.66747L4.16217 3.60347C3.62517 4.13747 3.20217 4.89347 3.25317 5.78747L4.75217 5.70347ZM19.4722 17.7635C19.1982 18.0375 18.9022 18.1915 18.6072 18.2185L18.7462 19.7115C19.4812 19.6425 20.0822 19.2725 20.5302 18.8275L19.4722 17.7635ZM11.0062 7.72847C11.9912 6.74947 12.0642 5.20247 11.2352 4.09447L10.0342 4.99347C10.4372 5.53247 10.3772 6.23947 9.94917 6.66647L11.0062 7.72847ZM20.5262 14.2875C21.3432 14.7315 21.4702 15.7775 20.8932 16.3515L21.9512 17.4145C23.2912 16.0815 22.8782 13.8585 21.2412 12.9695L20.5262 14.2875ZM17.0852 13.4385C17.4692 13.0565 18.0872 12.9625 18.6152 13.2485L19.3312 11.9315C18.2472 11.3415 16.9032 11.5045 16.0272 12.3745L17.0852 13.4385Z"
                      fill="black"
                    />
                  </svg>
                </span>
                Continue with Phone
              </Button>
            </div>
            <div className="flex mx-auto w-max text-xs gap-2 divide-x divide-black">
              <button onClick={() => setScreen("signup")}>Register</button>
              <button
                onClick={() => setScreen("forgotpassword")}
                className="pl-2"
              >
                Forgot Password
              </button>
            </div>
          </div>
          <p className="text-xs mx-auto w-[70%] py-8 text-center">
            By continuing you agree to our{" "}
            <span className="text-[#006ACC] underline cursor-pointer">
              Terms of use
            </span>{" "}
            and acknowledge that you have read our{" "}
            <span className="text-[#006ACC] underline cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>

        <div className="absolute top-4 right-4 cursor-pointer">
          <CloseIcon className="w-7 text-white" onClick={onClose} />
        </div>
      </div>
    </section>

  );
}
