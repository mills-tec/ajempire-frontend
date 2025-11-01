"use client"
import axios from "axios"
import { useEffect, useState, useRef } from "react"

interface ShippingAdressProps {
    setIsadress: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShippingAdress({ setIsadress }: ShippingAdressProps) {
    const [states, setStates] = useState<string[]>([]);
    const [selectedState, setSelectedState] = useState("Delta");
    const [selectedCountry, setSelectedCountry] = useState("Nigeria");


    useEffect(() => {
        axios.get("https://nga-states-lga.onrender.com/fetch")
            .then((res) => {
                setStates(res.data)
            })
            .catch((err) => console.error("Error fetching states:", err));
    })
    return (
        <div className="fixed inset-0 bg-[#FFFFFF] flex items-center  justify-center z-50">
            <div className="relative shadow-lg font-poppins text-[14px] w-[50%] h-[500px] px-10 py-8 overflow-y-scroll">
                <p className="font-semibold text-[15px] opacity-80 text-center mb-5">Shipping Address</p>

                <form action="" className="text-[#292929] flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="">First Name</label>
                        <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                            <input type="text" placeholder="Enter First Name" className="w-full placeholder:text-[14px] text-[13px] outline-none" required />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="">Last Name</label>
                        <div className="flex flex-col gap-2">
                            <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                                <input type="text" placeholder="Enter Last Name" className="w-full placeholder:text-[14px] text-[13px] outline-none" required />
                            </div>
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
                                    input.value = input.value.replace(/^0+/, '');
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="">Street</label>
                        <div className="flex flex-col gap-2">
                            <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                                <input type="text" placeholder="Enter Street Address" className="w-full placeholder:text-[14px] text-[13px] outline-none" required />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="">City/Town</label>
                        <div className="flex flex-col gap-2">
                            <div className="border border-gray-300 focus-within:border-primaryhover rounded-sm w-full h-[40px] flex items-center p-3 transition-all duration-300">
                                <input type="text" placeholder="Enter Name of City" className="w-full placeholder:text-[14px] text-[13px] outline-none" required />
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
                                <option value="" className="text-[#292929]" disabled>Select State</option>
                                {states.map((state) => (
                                    <option key={state} value={state} className="text-[#292929]">
                                        {state}
                                    </option>
                                ))}

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
                                <input type="number" placeholder="Enter postalCode" className="w-full placeholder:text-[14px] text-[13px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" required />
                            </div>
                        </div>
                    </div>
                    <button className="w-full bg-primaryhover text-white rounded-sm h-[40px]">Continue</button>
                </form>

                <div className="absolute top-6 right-6 cursor-pointer" onClick={() => setIsadress(false)}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.75 13.8575L7.30375 7.30375L13.8575 13.8575M13.8575 0.75L7.3025 7.30375L0.75 0.75" stroke="black" stroke-width="1.5" strokeLinecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    )
}