export default function SwitchAccountPage() {
    return (
        <div className="font-poppins lg:px-5 lg:pt-5  w-full mt-3 lg:mt-0  lg:block overflow-hidden  bg-white rounded-sm flex flex-col gap-20 h-auto pb-10">
            <p className="font-semibold text-[26px]  mb-6">Switch Accounts</p>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-9">
                    <div className="border border-gray-500 rounded-sm w-[70%] h-[70px] flex items-center justify-between px-4 ">
                        <div className="flex items-center gap-3">
                            <div>
                                <svg width="57" height="54" viewBox="0 0 57 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="28.2652" cy="27" rx="28.2652" ry="27" fill="#D9D9D9" />
                                </svg>
                            </div>
                            <div className="text-[14px]">
                                <p className="font-medium">Chiekezie NobleGold</p>
                                <p className="opacity-70">nob***a04@gmail.com</p>
                            </div>
                        </div>
                        <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.625 6.80632L8.31953 12.973L18.5789 0.639648" stroke="black" stroke-width="2" />
                        </svg>
                    </div>
                </div>
                <div className="flex flex-col gap-9">
                    <div className="border border-gray-500 rounded-sm w-[70%] h-[70px] flex items-center justify-between px-4 ">
                        <div className="flex items-center gap-3">
                            <div>
                                <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="27" cy="27" r="27" fill="#E6E6E6" />
                                    <path d="M21 27H27M27 27H33M27 27V21M27 27V33" stroke="#595959" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                            </div>
                            <div className="text-[14px]">
                                <p className="font-medium">Add account</p>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}