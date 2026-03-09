import Image from "next/image"
type AdminAuthProps = {
    onProceed: () => void;
}

export default function AdminAuth({ onProceed }: AdminAuthProps) {
    return (
        <div className=" h-[50%] font-poppins bg-white text-center flex flex-col items-center gap-6 p-10 rounded-lg shadow-lg justify-between">
            <div className="flex flex-col items-center gap-6">
                <Image
                    src="/Asset 36 1.png"   // path from /public
                    alt="Company Logo"
                    width={67}
                    height={56}
                    priority
                    className="object-contain"
                />
                <div>
                    <p className="text-[20px] font-medium">Admin dashboard</p>
                    <p className="text-[14px] font-normal text-[#8B8D97]">Please click the button below to proceed.</p>
                </div>
            </div>
            <div className="bg-[#FF008C] text-[16px] text-white w-full py-3 px-6 rounded-lg flex  items-center justify-center gap-2 cursor-pointer"

                onClick={onProceed}>
                <button>
                    Senior Admin
                </button>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.33331 8.00016H12.6666M12.6666 8.00016L7.99998 3.3335M12.6666 8.00016L7.99998 12.6668" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    )
}