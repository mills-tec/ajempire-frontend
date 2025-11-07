"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { toast } from "sonner";
import { getBearerToken } from "@/lib/api";

interface ShippingAdressProps {
  setIsadress?: React.Dispatch<React.SetStateAction<boolean>>;
  existingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  onContinue?: () => void;
  onAddressUpdated?: () => void;
}

export default function ShippingAdressForm({
  setIsadress,
  existingAddress,
  onContinue,
  onAddressUpdated,
}: ShippingAdressProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("Delta");
  const [selectedCountry, setSelectedCountry] = useState("Nigeria");
  const [loading, setLoading] = useState(false);
  const [singin, setSingin] = useState(false);

  const [showInitialSpinner, setShowInitialSpinner] = useState(false);

  useEffect(() => {
    axios
      .get("https://nga-states-lga.onrender.com/fetch")
      .then((res) => {
        setStates(res.data);
        console.log("States fetched:", res.data);
      })
      .catch((err) => console.error("Error fetching states:", err));
  }, []);
  useEffect(() => {
    // If existingAddress is passed (from GetshippingAddress edit icon)
    setShowInitialSpinner(true); // show spinner
    setTimeout(() => setShowInitialSpinner(false), 700); // hide after 500ms
    if (existingAddress) {
      setFullName(existingAddress.fullName || "");
      setPhone(existingAddress.phone || "");
      setStreet(existingAddress.street || "");
      setCity(existingAddress.city || "");
      setPostalCode(existingAddress.postalCode || "");
      setSelectedState(existingAddress.state || "Delta");
      setSelectedCountry(existingAddress.country || "Nigeria");
    } else {
      // If no existingAddress passed, check backend
      const token = getBearerToken();
      if (!token) return;

      axios
        .get("https://ajempire-backend.vercel.app/api/shipping-address", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const data = res.data.message;
          if (data && Object.keys(data).length > 0) {
            // Prefill if address exists
            setFullName(data.fullName || "");
            setPhone(data.phone || "");
            setStreet(data.street || "");
            setCity(data.city || "");
            setPostalCode(data.postalCode || "");
            setSelectedState(data.state || "Delta");
            setSelectedCountry(data.country || "Nigeria");
          } else {
            // If backend returns empty, reset the form
            setFullName("");
            setPhone("");
            setStreet("");
            setCity("");
            setPostalCode("");
            setSelectedState("Delta");
            setSelectedCountry("Nigeria");
          }
        })
        .catch((err) => {
          console.error("❌ Error fetching address:", err);
          setFullName("");
          setPhone("");
          setStreet("");
          setCity("");
          setPostalCode("");
          setSelectedState("Delta");
          setSelectedCountry("Nigeria");
        });
    }
  }, [existingAddress]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = getBearerToken();
    if (!token) {
      toast.error("User not authenticated. Please login to continue", {
        position: "top-right",
      });
      setLoading(false);
    }
    const data = {
      shippingAdress: {
        fullName,
        phone,
        street,
        city,
        state: selectedState,
        country: selectedCountry,
        postalCode,
      },
    };
    try {
      const res = await axios.patch(
        "https://ajempire-backend.vercel.app/api/shipping-address",
        { shippingAddress: data.shippingAdress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        toast.success("Shipping address updated successfully", {
          position: "top-right",
        });
        if (onContinue) onContinue();
        if (onAddressUpdated) onAddressUpdated();
      }
    } catch (error: any) {
      console.error("❌ Error updating address:", error);

      if (error.response) {
        console.log("🧾 Server says:", error.response.data);
        toast.error(error.response.data?.message || "Something went wrong!", {
          position: "top-right",
        });
      } else {
        toast.error("Network or unexpected error", { position: "top-right" });
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
        if (!onContinue && setIsadress) {
          setIsadress(false);
        }
      });
    }
  };
  console.log("selected state:", selectedState);
  return (
    <div className="fixed inset-0  bg-[#FFFFFF] flex lg:items-center items-start   lg:justify-center  z-50">
      {loading && <Spinner />}
      {showInitialSpinner && <Spinner />}
      <div className="w-full relative lg:shadow-lg font-poppins text-[14px] lg:w-[50%] lg:h-[500px] h-[700px] lg:px-10 px-5 py-8 overflow-y-scroll">
        <p className="font-semibold text-[15px] opacity-80 text-center mb-5">
          Shipping Address
        </p>
        <div className="lg:hidden flex items-center justify-between gap-1 mb-5">
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM9.6 18L3.6 12L5.292 10.308L9.6 14.604L18.708 5.496L20.4 7.2L9.6 18Z"
                fill="#0085FF"
              />
            </svg>
            <p>Shipping</p>
          </div>
          <div>
            <svg
              width="22"
              height="1"
              viewBox="0 0 22 1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.5 0.5H21.5"
                stroke="#CFCFCF"
                stroke-linecap="square"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                fill="#AEAEAE"
              />
              <path
                d="M11 7V13.6667L14 17"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p className="text-[#A3A3A3]">Payment</p>
          </div>
          <div>
            <svg
              width="22"
              height="1"
              viewBox="0 0 22 1"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.5 0.5H21.5"
                stroke="#CFCFCF"
                stroke-linecap="square"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="24" height="24" rx="12" fill="#AEAEAE" />
              <path
                d="M11 7V13.6667L14 17"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <p className="text-[#A3A3A3]">Review</p>
          </div>
        </div>
        <form
          action=""
          className="text-[#292929] flex flex-col lg:gap-4 gap-3"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="">FullName</label>
            <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
              <input
                type="text"
                placeholder="Enter First Name"
                className="w-full placeholder:text-[14px] text-[13px] outline-none"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="phone">Phone</label>
            <div className="flex items-center border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] px-3 transition-all duration-300">
              <span className="text-gray-600 text-[14px] mr-2">+234</span>
              <input
                id="phone"
                type="number"
                placeholder="Enter phone number"
                className="w-full placeholder:text-[14px] text-[13px] outline-none h-auto [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                required
                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                  const input = e.currentTarget;
                  input.value = input.value.replace(/^0+/, "");
                }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="">Street</label>
            <div className="flex flex-col gap-2">
              <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Enter Street Address"
                  className="w-full placeholder:text-[14px] text-[13px] outline-none"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="">City/Town</label>
            <div className="flex flex-col gap-2">
              <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                <input
                  type="text"
                  placeholder="Enter Name of City"
                  className="w-full placeholder:text-[14px] text-[13px] outline-none"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            <label htmlFor="state">State</label>
            <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center px-3 pt-0 transition-all duration-300">
              <select
                id="state"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full h-auto text-[13px] outline-none bg-transparent"
                required
              >
                <option value="" className="text-[#292929]" disabled>
                  Select State
                </option>
                {/* {states.map((state) => (
                                    <option key={state} value={state} className="text-[#292929]">
                                        {state}
                                    </option>
                                ))} */}
                <option value="Delta">Delta</option>
                <option value="Enugu">Enugu</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="">Country/Region</label>
            <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full h-auto text-[13px] outline-none bg-transparent"
                required
              >
                <option value="" disabled>
                  Select Country
                </option>
                <option value="Nigeria">Nigeria</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="">postalCode</label>
            <div className="flex flex-col gap-2">
              <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                <input
                  type="number"
                  placeholder="Enter postalCode"
                  className="w-full placeholder:text-[14px] text-[13px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            className={`w-full bg-primaryhover text-white rounded-sm h-[40px] ${
              !fullName ||
              !phone ||
              !street ||
              !city ||
              !selectedState ||
              !selectedCountry ||
              !postalCode
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={
              !fullName ||
              !phone ||
              !street ||
              !city ||
              !selectedState ||
              !selectedCountry ||
              !postalCode
            }
          >
            Continue
          </button>
        </form>

        <div
          className="absolute top-9 right-6 cursor-pointer "
          onClick={() => {
            setIsadress && setIsadress(false);
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.75 13.8575L7.30375 7.30375L13.8575 13.8575M13.8575 0.75L7.3025 7.30375L0.75 0.75"
              stroke="black"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
