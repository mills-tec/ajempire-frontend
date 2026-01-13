import { useState } from "react";

export default function ReturnRequestComp() {
    const listofReasons = [
        "Recieved Wrong Item",
        "Damaged/defective item",
        "Item not as described",
        "Wrong size/fit",
        "Changed my mind",
        "Other"
    ]
    const [selectedReason, setSelectedReason] = useState("");
    const [useitemcondition, setUseitemcondition] = useState("");
    const isitemused = [
        "yes", "No"
    ]
    return (

        <div className="text-[14px] font-poppins fixed bottom-0 flex items-end lg:items-center  pb-[5rem] lg:pb-0 z-50 lg:justify-around h-full !w-[1000px] bg-black/20 overflow-hidden">
            <div className="h-[550px] overflow-y-scroll">
                <div className="bg-white w-full lg:w-[600px]  rounded-t-lg lg:rounded-lg p-6 flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <p className="text-[20px] font-semibold">Return Request</p>
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.32031 18.6801L13.0002 13.0002L18.6801 18.6801M18.6801 7.32031L12.9991 13.0002L7.32031 7.32031" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </div>
                    <div className="flex items-center gap-3">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.7923 23.2913H11.3757C7.2904 23.2913 5.24723 23.2913 3.97865 22.0217C2.71007 20.752 2.70898 18.7099 2.70898 14.6247V7.04134M2.70898 7.04134H23.2923M2.70898 7.04134L3.35898 6.17467C4.63515 4.47384 5.27323 3.62342 6.18757 3.16517C7.10298 2.70801 8.16573 2.70801 10.2923 2.70801H15.709C17.8356 2.70801 18.8983 2.70801 19.8137 3.16517C20.7281 3.62342 21.3662 4.47384 22.6423 6.17467L23.2923 7.04134M23.2923 7.04134V14.6247" stroke="black" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M17.3333 14.624C17.3333 14.624 14.625 16.6184 14.625 17.3324C14.625 18.0463 17.3333 20.0407 17.3333 20.0407M15.1667 17.3324H20.3125C21.1028 17.3324 21.8607 17.6463 22.4195 18.2051C22.9783 18.7639 23.2922 19.5218 23.2922 20.3121C23.2922 21.1023 22.9783 21.8602 22.4195 22.419C21.8607 22.9778 21.1028 23.2918 20.3125 23.2918" stroke="black" stroke-opacity="0.8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p className="text-[16px] font-normal opacity-80">Return possible until (30-09-2025) <span className="text-[#1877F2]">Access our
                            <br /> Return Policy</span>
                        </p>
                    </div>

                    <div className=" flex flex-col gap-3 ">
                        <p className="text-[17px] font-medium">Why are you returning this item?</p>
                        <div>
                            {listofReasons.map((reason, index) => (
                                <div key={index} className="flex flex-col gap-1">
                                    <div className="flex flex-row gap-2 items-center">
                                        <input
                                            type="radio"
                                            id={`reason-${index}`}
                                            name="returnReason"
                                            value={reason}
                                            checked={selectedReason === reason}
                                            onChange={() => setSelectedReason(reason)}
                                            className=" accent-primaryhover"
                                        />
                                        <label htmlFor={`reason-${index}`}>{reason}</label>
                                    </div>

                                    {/* 👇 Show input ONLY if "Other" is selected */}
                                    {reason === "Other" && selectedReason === "Other" && (
                                        <div className=" border border-gray-200 w-[400px] h-[80px]">
                                            <textarea
                                                placeholder="Please specify"
                                                className="outline-brand_solid_gradient rounded w-full h-full px-2 py-2 resize-none placeholder:text-[14px] placeholder:text-[#888888] "
                                            />
                                        </div>

                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[17px] font-medium">Item condition</p>
                        <p>Is the item unused and in it’s original packaging?</p>
                        <div>
                            {isitemused.map((condition, index) => (
                                <div key={index} className="flex flex-row gap-2 items-center">
                                    <input
                                        type="radio"
                                        id={`condition-${index}`}
                                        name="itemCondition"
                                        value={condition}
                                        className=" accent-primaryhover"
                                        onChange={() => setUseitemcondition(condition)}
                                        checked={useitemcondition === condition}
                                    />
                                    <label htmlFor={`condition-${index}`}>{condition}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[17px] font-medium ">Upload Evidence</p>
                        <p>Helps us process faster</p>
                        <div className="flex items-center  gap-3 border border-gray-200 px-2 w-[167px] h-[40px] rounded-sm">
                            <div className="text-[#888888] text-[14px]">
                                upload image
                            </div>
                            <div className="flex items-center gap-2">
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.23758 0.000583361H6.30408C7.651 0.000583361 8.70625 0.000583395 9.52992 0.111417C10.3723 0.224583 11.0373 0.461417 11.5593 0.982917C12.0814 1.505 12.3177 2.17 12.4308 3.01292C12.5417 3.836 12.5417 4.89125 12.5417 6.23817V6.2895C12.5417 7.40308 12.5417 8.31425 12.481 9.05625C12.4203 9.80292 12.2961 10.4253 12.0173 10.9433C11.8951 11.1712 11.7425 11.3767 11.5593 11.5599C11.0373 12.082 10.3723 12.3183 9.52933 12.4314C8.70625 12.5423 7.651 12.5423 6.30408 12.5423H6.23758C4.89067 12.5423 3.83542 12.5423 3.01175 12.4314C2.16942 12.3183 1.50442 12.0814 0.982333 11.5599C0.51975 11.0973 0.280583 10.5216 0.154 9.80642C0.0285834 9.10467 0.00583332 8.23142 0.00116665 7.14758C0.000388874 6.87147 0 6.57942 0 6.27142V6.23758C0 4.89067 3.47694e-08 3.83542 0.110833 3.01175C0.224 2.16942 0.460833 1.50442 0.982333 0.982333C1.50442 0.46025 2.16942 0.224 3.01233 0.110833C3.83542 3.47694e-08 4.89067 0 6.23758 0M3.12842 0.977667C2.38292 1.078 1.93317 1.26933 1.60125 1.60125C1.26875 1.93375 1.078 2.38292 0.977667 3.129C0.876167 3.88733 0.875 4.88367 0.875 6.27083V6.76317L1.45892 6.25217C1.71504 6.02796 2.04681 5.90949 2.38702 5.92076C2.72723 5.93202 3.05043 6.07218 3.29117 6.31283L5.79367 8.81533C5.98786 9.00949 6.24432 9.12892 6.5179 9.15261C6.79149 9.1763 7.06466 9.10272 7.28933 8.94483L7.46317 8.82233C7.78732 8.59456 8.17916 8.48352 8.57461 8.50736C8.97007 8.5312 9.34573 8.68852 9.64017 8.95358L11.291 10.4393C11.4578 10.0905 11.5564 9.632 11.6089 8.98508C11.6661 8.28217 11.6667 7.406 11.6667 6.27083C11.6667 4.88367 11.6655 3.88733 11.564 3.129C11.4637 2.38292 11.2723 1.93317 10.9404 1.60067C10.6079 1.26875 10.1588 1.078 9.41267 0.977667C8.65433 0.876167 7.658 0.875 6.27083 0.875C4.88367 0.875 3.88675 0.876167 3.12842 0.977667Z" fill="#999999" />
                                </svg>
                                <svg width="29" height="26" viewBox="0 0 29 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="29" height="26" rx="10" fill="#FFB0DB" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.066 7.99133C12.244 7.118 13.0213 6.5 13.9113 6.5H16.09C16.98 6.5 17.7567 7.118 17.9353 7.99133C17.955 8.0875 18.0065 8.17425 18.0815 8.23761C18.1564 8.30098 18.2505 8.33728 18.3487 8.34067H18.3707C19.306 8.382 20.0247 8.49667 20.6247 8.89067C21.0027 9.13867 21.328 9.45733 21.5813 9.83C21.8967 10.2927 22.0353 10.8247 22.102 11.4673C22.1673 12.096 22.1673 12.8833 22.1673 13.8807V13.9373C22.1673 14.9347 22.1673 15.7227 22.102 16.3507C22.0353 16.9933 21.8967 17.5253 21.5813 17.9887C21.3266 18.361 21.0016 18.6801 20.6247 18.928C20.156 19.2353 19.618 19.3713 18.966 19.436C18.3273 19.5 17.5267 19.5 16.5093 19.5H13.492C12.4747 19.5 11.674 19.5 11.0353 19.436C10.3833 19.3713 9.84532 19.236 9.37665 18.928C8.99961 18.6799 8.67464 18.3606 8.41998 17.988C8.10465 17.5253 7.96598 16.9933 7.89932 16.3507C7.83398 15.7227 7.83398 14.9347 7.83398 13.9373V13.8807C7.83398 12.8833 7.83398 12.096 7.89932 11.4673C7.96598 10.8247 8.10465 10.2927 8.41998 9.83C8.67464 9.45738 8.99961 9.13807 9.37665 8.89C9.97665 8.49667 10.6953 8.382 11.6307 8.34133L11.642 8.34067H11.6527C11.7508 8.33728 11.8449 8.30098 11.9198 8.23761C11.9948 8.17425 12.0463 8.0875 12.066 7.99133ZM13.9113 7.5C13.4847 7.5 13.1267 7.79533 13.046 8.19067C12.916 8.83067 12.348 9.33467 11.6647 9.34067C10.766 9.38067 10.2847 9.49067 9.92465 9.72667C9.65762 9.90262 9.42734 10.1288 9.24665 10.3927C9.06265 10.6627 8.95198 11.0087 8.89332 11.5707C8.83465 12.1413 8.83398 12.8773 8.83398 13.9093C8.83398 14.9413 8.83398 15.6767 8.89398 16.2473C8.95198 16.8093 9.06265 17.1553 9.24732 17.426C9.42598 17.6887 9.65598 17.9153 9.92532 18.092C10.2033 18.274 10.5593 18.384 11.1347 18.4413C11.7173 18.4993 12.468 18.5 13.5193 18.5H16.482C17.5327 18.5 18.2833 18.5 18.8667 18.4413C19.442 18.384 19.798 18.2747 20.076 18.092C20.3453 17.9153 20.576 17.6887 20.7547 17.4253C20.9387 17.1553 21.0493 16.8093 21.108 16.2473C21.1667 15.6767 21.1673 14.9407 21.1673 13.9093C21.1673 12.878 21.1673 12.1413 21.1073 11.5707C21.0493 11.0087 20.9387 10.6627 20.754 10.3927C20.5734 10.1286 20.3431 9.90215 20.076 9.726C19.7173 9.49067 19.236 9.38067 18.336 9.34067C17.6533 9.334 17.0853 8.83133 16.9553 8.19067C16.9127 7.99351 16.8033 7.81713 16.6456 7.69129C16.4879 7.56546 16.2917 7.49789 16.09 7.5H13.9113ZM15.0007 12.1667C14.6028 12.1667 14.2213 12.3247 13.94 12.606C13.6587 12.8873 13.5007 13.2688 13.5007 13.6667C13.5007 14.0645 13.6587 14.446 13.94 14.7273C14.2213 15.0086 14.6028 15.1667 15.0007 15.1667C15.3985 15.1667 15.78 15.0086 16.0613 14.7273C16.3426 14.446 16.5007 14.0645 16.5007 13.6667C16.5007 13.2688 16.3426 12.8873 16.0613 12.606C15.78 12.3247 15.3985 12.1667 15.0007 12.1667ZM12.5007 13.6667C12.5007 13.0036 12.764 12.3677 13.2329 11.8989C13.7017 11.4301 14.3376 11.1667 15.0007 11.1667C15.6637 11.1667 16.2996 11.4301 16.7684 11.8989C17.2373 12.3677 17.5007 13.0036 17.5007 13.6667C17.5007 14.3297 17.2373 14.9656 16.7684 15.4344C16.2996 15.9033 15.6637 16.1667 15.0007 16.1667C14.3376 16.1667 13.7017 15.9033 13.2329 15.4344C12.764 14.9656 12.5007 14.3297 12.5007 13.6667ZM18.5007 11.6667C18.5007 11.5341 18.5533 11.4069 18.6471 11.3131C18.7409 11.2193 18.868 11.1667 19.0007 11.1667H19.6673C19.7999 11.1667 19.9271 11.2193 20.0209 11.3131C20.1146 11.4069 20.1673 11.5341 20.1673 11.6667C20.1673 11.7993 20.1146 11.9265 20.0209 12.0202C19.9271 12.114 19.7999 12.1667 19.6673 12.1667H19.0007C18.868 12.1667 18.7409 12.114 18.6471 12.0202C18.5533 11.9265 18.5007 11.7993 18.5007 11.6667Z" fill="white" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[17px] font-medium">Additional Notes</p>
                        <p>Any additional details?</p>
                        <div className="border border-gray-200 w-[400px] h-[130px]">
                            <textarea
                                placeholder="Please specify"
                                className="outline-brand_solid_gradient rounded w-full h-full px-2 py-2 resize-none placeholder:text-[14px] placeholder:text-[#888888] "
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <button className="bg-primaryhover w-[200px] h-[40px] text-[14px] text-white rounded-sm">Submit Request</button>
                        <button className="border border-gray-400 w-[200px] h-[40px] text-[14px] text-black rounded-sm ">
                            Go to Returns
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}