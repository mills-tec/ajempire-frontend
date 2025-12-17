interface AboutUsComProp {
    topRef: React.RefObject<HTMLDivElement | null>;
}

export default function AboutUsComp({ topRef }: AboutUsComProp) {
    return (
        <div className="font-poppins lg:bg-white  lg:p-10 rounded-md flex flex-col gap-7">
            <p className="font-semibold hidden lg:flex">About Us</p>
            <div className="bg-gray-200 lg:w-[600px]  h-[200px] rounded-md">

            </div>
            <div>
                <p className="font-semibold opacity-50">About AJ Empire</p>
                <div className="lg:w-[600px] p-4 flex flex-col gap-2">
                    <p className=" font-normal">Who We Are:</p>
                    <div className="opacity-80 font-light text-[15px]">
                        <p>AJ Empire is Nigeria's go-to beauty brand, committed to delivering vibrant,</p>
                        <p>premium-quality nail and cosmetic products designed to empower </p>
                        <p>confidence and self-expression.</p>

                    </div>
                </div>
                <div className="lg:w-[600px] p-4 flex flex-col gap-2">
                    <p className=" font-normal">Mission:</p>
                    <div className="opacity-80 font-light text-[15px]">
                        <p>To provide beauty enthusiasts with affordable, high-quality products that</p>
                        <p>inspire self-care, style, and empowerment.</p>
                    </div>
                </div>
                <div className="lg:w-[600px] p-4 flex flex-col gap-2">
                    <p className="font-normal">Vision:</p>
                    <div className="opacity-80 font-light text-[15px]">
                        <p>To become Africa's leading beauty brand known for innovation, quality, </p>
                        <p>and inclusivity.</p>
                    </div>
                </div>
            </div>

            {/* <div className="flex flex-col gap-5">
                <div>
                    <div>
                        <p className="text-[18px]">Privacy & Policy: </p>
                        <div className="opacity-60 text-[14px]">
                            <p>We value your privacy. Your data is secure </p>
                            <p>and used only to enhance your shopping </p>
                            <p>experience.</p>
                        </div>
                    </div>

                    <div className="flex items-center  text-[12px] gap-2 mt-5 text-primaryhover">
                        <p>Learn More</p>
                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3536 4.03519C10.5488 3.83993 10.5488 3.52335 10.3536 3.32809L7.17157 0.146107C6.97631 -0.0491548 6.65973 -0.0491548 6.46447 0.146107C6.2692 0.341369 6.2692 0.657952 6.46447 0.853214L9.29289 3.68164L6.46447 6.51007C6.2692 6.70533 6.2692 7.02191 6.46447 7.21718C6.65973 7.41244 6.97631 7.41244 7.17157 7.21718L10.3536 4.03519ZM0 3.68164L-4.37114e-08 4.18164L10 4.18164L10 3.68164L10 3.18164L4.37114e-08 3.18164L0 3.68164Z" fill="#FF008C" />
                        </svg>
                    </div>
                </div>
                <div>
                    <div>
                        <p className="text-[18px]">Terms & Conditions:</p>
                        <div className="opacity-60 text-[14px]">
                            <p>By using AJ Empire, you agree to our usage </p>
                            <p>terms, return policies, and service guidelines</p>
                        </div>
                    </div>

                    <div className="flex items-center text-[12px] gap-2 mt-5 text-primaryhover">
                        <p>Learn More</p>
                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3536 4.03519C10.5488 3.83993 10.5488 3.52335 10.3536 3.32809L7.17157 0.146107C6.97631 -0.0491548 6.65973 -0.0491548 6.46447 0.146107C6.2692 0.341369 6.2692 0.657952 6.46447 0.853214L9.29289 3.68164L6.46447 6.51007C6.2692 6.70533 6.2692 7.02191 6.46447 7.21718C6.65973 7.41244 6.97631 7.41244 7.17157 7.21718L10.3536 4.03519ZM0 3.68164L-4.37114e-08 4.18164L10 4.18164L10 3.68164L10 3.18164L4.37114e-08 3.18164L0 3.68164Z" fill="#FF008C" />
                        </svg>
                    </div>
                </div>

                <div className=" flex items-center justify-center mt-10">
                    <button className="text-[13px] bg-[#999999] hover:bg-primaryhover transition-all duration-300 text-white w-[304px] h-[40px] rounded-md" onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        topRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>Return to Top</button>
                </div>
            </div> */}
        </div>
    )
}