import axios from "axios";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Spinner from "../Spinner";

export default function AdminLogin() {
  const [emailinput, setEmailinput] = useState("");
  const [passwordinput, setPasswordinput] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const route = useRouter();

  // Regex for password validation:
  // min 6 chars, at least 1 capital, 1 number, and 1 special (# or @)
  const passwordRegex = /^.{6,}$/;

  useEffect(() => {
    setIsValidPassword(passwordRegex.test(passwordinput));
  }, [passwordinput]);

  // Validate email whenever it changes
  useEffect(() => {
    setIsValidEmail(emailRegex.test(emailinput));
  }, [emailinput]);

  // Validate password whenever it changes
  useEffect(() => {
    setIsValidPassword(passwordRegex.test(passwordinput));
  }, [passwordinput]);

  // Only enable login if both are valid
  const isFormValid = isValidEmail && isValidPassword;

  const handleLogin = async () => {
    if (!isFormValid) return; // extra safety
    setLoading(true);
    try {
      const response = await axios.post(
        "https://ajempire-backend-production.up.railway.app/api/admin/login",
        {
          email: emailinput,
          password: passwordinput,
        },
      );

      // Handle success
      if (response.data) {
        localStorage.setItem("adminToken", response.data);
        route.push("/admin");
      }
      toast.success("Login successful!");
      // maybe redirect to /admin/dashboard here
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(
        "Login failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-poppins  bg-white text-center flex flex-col items-center gap-6 p-10 rounded-lg shadow-lg justify-between">
      {loading && <Spinner />}
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/Asset 36 1.png"
          alt="Company Logo"
          width={67}
          height={56}
          priority
          className="object-contain"
        />
        <div>
          <p className="text-[20px] font-medium">Welcome back!</p>
          <p className="text-[14px] font-normal text-[#8B8D97]">
            Login to your account
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="bg-[#EFF1F9] flex items-center w-full rounded-lg px-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17.9026 8.85107L13.4593 12.4641C12.6198 13.1301 11.4387 13.1301 10.5992 12.4641L6.11841 8.85107"
                  stroke="#6E7079"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.9089 21C19.9502 21.0084 22 18.5095 22 15.4384V8.57001C22 5.49883 19.9502 3 16.9089 3H7.09114C4.04979 3 2 5.49883 2 8.57001V15.4384C2 18.5095 4.04979 21.0084 7.09114 21H16.9089Z"
                  stroke="#6E7079"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <input
                type="text"
                placeholder="Email"
                className="bg-transparent outline-none border-none w-full px-2 py-3"
                onChange={(e) => setEmailinput(e.target.value)}
                value={emailinput}
              />
            </div>
            {!isValidEmail && emailinput && (
              <p className="text-red-500 text-xs text-left pl-3 ">
                Enter a valid email
              </p>
            )}
          </div>

          <div className="flex relative flex-col gap-1">
            <div className="bg-[#EFF1F9] flex items-center gap-1 w-full rounded-lg px-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.4234 9.44756V7.30056C16.4234 4.78756 14.3854 2.74956 11.8724 2.74956C9.35937 2.73856 7.31337 4.76656 7.30237 7.28056V7.30056V9.44756"
                  stroke="#6E7079"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.6832 21.2495H8.04218C5.94818 21.2495 4.25018 19.5525 4.25018 17.4575V13.1685C4.25018 11.0735 5.94818 9.37646 8.04218 9.37646H15.6832C17.7772 9.37646 19.4752 11.0735 19.4752 13.1685V17.4575C19.4752 19.5525 17.7772 21.2495 15.6832 21.2495Z"
                  stroke="#6E7079"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.8629 14.2026V16.4236"
                  stroke="#6E7079"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="bg-transparent outline-none border-none  px-2 py-3 "
                onChange={(e) => setPasswordinput(e.target.value)}
                value={passwordinput}
              />
              {/* this is the close eye icon i want you to work on it to make it visiale and closing */}
              <button
                type="button"
                className="ml-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Open eye
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 8.25C11.0054 8.25 10.0516 8.64509 9.34835 9.34835C8.64509 10.0516 8.25 11.0054 8.25 12C8.25 12.9946 8.64509 13.9484 9.34835 14.6517C10.0516 15.3549 11.0054 15.75 12 15.75C12.9946 15.75 13.9484 15.3549 14.6517 14.6517C15.3549 13.9484 15.75 12.9946 15.75 12C15.75 11.0054 15.3549 10.0516 14.6517 9.34835C13.9484 8.64509 12.9946 8.25 12 8.25ZM9.75 12C9.75 11.4033 9.98705 10.831 10.409 10.409C10.831 9.98705 11.4033 9.75 12 9.75C12.5967 9.75 13.169 9.98705 13.591 10.409C14.0129 10.831 14.25 11.4033 14.25 12C14.25 12.5967 14.0129 13.169 13.591 13.591C13.169 14.0129 12.5967 14.25 12 14.25C11.4033 14.25 10.831 14.0129 10.409 13.591C9.98705 13.169 9.75 12.5967 9.75 12Z"
                      fill="black"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 3.25C7.486 3.25 4.445 5.954 2.68 8.247L2.649 8.288C2.249 8.807 1.882 9.284 1.633 9.848C1.366 10.453 1.25 11.112 1.25 12C1.25 12.888 1.366 13.547 1.633 14.152C1.883 14.716 2.25 15.194 2.649 15.712L2.681 15.753C4.445 18.046 7.486 20.75 12 20.75C16.514 20.75 19.555 18.046 21.32 15.753L21.351 15.712C21.751 15.194 22.118 14.716 22.367 14.152C22.634 13.547 22.75 12.888 22.75 12C22.75 11.112 22.634 10.453 22.367 9.848C22.117 9.284 21.75 8.807 21.351 8.288L21.319 8.247C19.555 5.954 16.514 3.25 12 3.25ZM3.87 9.162C5.498 7.045 8.15 4.75 12 4.75C15.85 4.75 18.501 7.045 20.13 9.162C20.57 9.732 20.826 10.072 20.995 10.454C21.153 10.812 21.25 11.249 21.25 12C21.25 12.751 21.153 13.188 20.995 13.546C20.826 13.928 20.569 14.268 20.131 14.838C18.5 16.955 15.85 19.25 12 19.25C8.15 19.25 5.499 16.955 3.87 14.838C3.43 14.268 3.174 13.928 3.005 13.546C2.847 13.188 2.75 12.751 2.75 12C2.75 11.249 2.847 10.812 3.005 10.454C3.174 10.072 3.432 9.732 3.87 9.162Z"
                      fill="black"
                    />
                  </svg>
                ) : (
                  // Closed eye (eye with slash)
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_4379_20244)">
                      <path
                        d="M6.60002 2.82652C7.05891 2.71911 7.52873 2.66541 8.00002 2.66652C12.6667 2.66652 15.3334 7.99985 15.3334 7.99985C14.9287 8.75693 14.4461 9.46968 13.8934 10.1265M9.41335 9.41319C9.23025 9.60969 9.00945 9.76729 8.76412 9.8766C8.51879 9.98591 8.25395 10.0447 7.98541 10.0494C7.71687 10.0542 7.45013 10.0048 7.20109 9.90418C6.95206 9.80359 6.72583 9.65387 6.53592 9.46396C6.346 9.27404 6.19628 9.04782 6.09569 8.79878C5.9951 8.54975 5.9457 8.283 5.95044 8.01446C5.95518 7.74592 6.01396 7.48108 6.12327 7.23575C6.23258 6.99042 6.39019 6.76962 6.58669 6.58652M11.96 11.9599C10.8204 12.8285 9.43276 13.3098 8.00002 13.3332C3.33335 13.3332 0.666687 7.99985 0.666687 7.99985C1.49595 6.45445 2.64611 5.10426 4.04002 4.03985L11.96 11.9599Z"
                        stroke="black"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M0.666687 0.666504L15.3334 15.3332"
                        stroke="black"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_4379_20244">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              </button>
            </div>
            {!isValidPassword && passwordinput && (
              <p className="text-red-500 text-xs absolute bottom-[-35px] text-left pl-3">
                Password must be ≥6 chars, with 1 uppercase, 1 number, and # or
                @
              </p>
            )}
          </div>
          <div className="flex  justify-end">
            <p className="text-[#FF008C] font-light text-[13px]">
              Recover Password
            </p>
          </div>
        </div>
      </div>
      <div className="w-full">
        <button
          className={`bg-gradient-to-b from-primaryhover to-brand_solid_gradient w-full px-6 py-3 rounded-lg text-white text-[16px] font-medium ${!isFormValid || loading ? "opacity-50 cursor-not-allowed" : "hover:from-brand_solid_gradient hover:to-primaryhover transition-all duration-200"}`}
          disabled={!isFormValid || loading}
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
