import whiteLogo from "@/assets/whitelogo.png";
import Image from "next/image";
import FooterRout from "./ui/FooterRout";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="w-full px-[30px] py-[30px]">
            <div className="w-full flex  justify-between gap-14 ">
                <div>
                    <Image src={whiteLogo} alt="logo" width={150} height={50} />
                </div>

                <div className="w-full flex items-center justify-between ">
                    {/* Shop Section */}
                    <div>
                        <FooterRout
                            title="Shop"
                            links={[
                                { name: "Nails & Accessories", href: "/shop/nails" },
                                { name: "Makeup", href: "/shop/makeup" },
                                { name: "Skincare", href: "/shop/skincare" },
                                { name: "Tools & Kits", href: "/shop/tools" },
                                { name: "New Arrivals", href: "/shop/new" },
                            ]}
                        />
                    </div>

                    {/* Company Section */}
                    <div>
                        <FooterRout
                            title="Company"
                            links={[
                                { name: "About Us", href: "/about" },
                                { name: "Careers", href: "/careers" },
                                { name: "Partnerships", href: "/partnerships" },
                                { name: "Vendor Opportunities", href: "/vendor" },
                                { name: "Contact", href: "/contact" },
                            ]}
                        />
                    </div>

                    {/* Support Section */}
                    <div>
                        <FooterRout
                            title="Support"
                            links={[
                                { name: "FAQs", href: "/support/faqs" },
                                { name: "Shipping & Returns", href: "/support/shipping" },
                                { name: "Track My Order", href: "/support/track-order" },
                                { name: "Privacy Policy", href: "/support/privacy" },
                                { name: "Terms & Conditions", href: "/support/terms" },
                            ]}
                        />
                    </div>

                    <div>
                        <h1 className="font-semibold mb-2 text-[#FFFFFF] font-poppins text-[14px]">
                            Subscribe
                        </h1>
                        <div className="text-[#FFFFFF]  transition-colors duration-300 text-[14px]">
                            <div className="flex flex-col  mb-4">
                                <p>Join our newsletter to stay updated on</p>
                                <p>new products, deals & beauty tips.</p>
                            </div>
                            <div className="">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="p-2 rounded-l-md border border-gray-300 focus:outline-none w-[300px] text-black text-[14px]"
                                />
                                <button className="bg-[#FF008C] text-white p-2 rounded-r-md hover:bg-pink-600 transition-colors duration-300">
                                    Subscribe
                                </button>
                            </div>
                            <div className="mt-4">
                                <p>
                                    By subscribing you agree to with our{" "}
                                    <span>Privacy Policy</span> and provide
                                </p>
                                <p>consent to receive updates from our company.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-20 flex flex-col justify-center">
                <hr className="w-full h-[30px] border-gray-50 opacity-50" />
                <div className="flex justify-between">
                    <div className=" text-[#FFFFFF] text-[14px] flex items-center gap-4">
                        &copy; {new Date().getFullYear()} AJ Empire. All rights reserved.
                        <span className="underline underline-offset-4 hover:opacity-80 transition-transform duration-300">
                            Privacy Policy
                        </span>
                        <span className="underline underline-offset-4  hover:opacity-80 transition-transform duration-300">
                            Terms of Service
                        </span>
                        <span className="underline underline-offset-4  hover:opacity-80 transition-transform duration-300">
                            Cookies Settings
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className=" flex items-center justify-center transition-transform duration-200 ease-out hover:scale-105 active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M22 12.3033C22 6.7467 17.5229 2.24219 12 2.24219C6.47715 2.24219 2 6.7467 2 12.3033C2 17.325 5.65684 21.4874 10.4375 22.2422V15.2116H7.89844V12.3033H10.4375V10.0867C10.4375 7.56515 11.9305 6.17231 14.2146 6.17231C15.3088 6.17231 16.4531 6.36882 16.4531 6.36882V8.8448H15.1922C13.95 8.8448 13.5625 9.62041 13.5625 10.4161V12.3033H16.3359L15.8926 15.2116H13.5625V22.2422C18.3432 21.4874 22 17.3252 22 12.3033Z"
                                    fill="white"
                                />
                            </svg>
                        </p>
                        <p>
                            <Link
                                href={
                                    "https://www.instagram.com/aj_empire_the_nail_boss?igsh=MXZtOWNlZXJ3Ymh6"
                                }
                                className=" flex items-center justify-center transition-transform duration-200 ease-out hover:scale-105 active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M16 3.24219H8C5.23858 3.24219 3 5.48077 3 8.24219V16.2422C3 19.0036 5.23858 21.2422 8 21.2422H16C18.7614 21.2422 21 19.0036 21 16.2422V8.24219C21 5.48077 18.7614 3.24219 16 3.24219ZM19.25 16.2422C19.2445 18.0348 17.7926 19.4867 16 19.4922H8C6.20735 19.4867 4.75549 18.0348 4.75 16.2422V8.24219C4.75549 6.44954 6.20735 4.99768 8 4.99219H16C17.7926 4.99768 19.2445 6.44954 19.25 8.24219V16.2422ZM16.75 8.49219C17.3023 8.49219 17.75 8.04447 17.75 7.49219C17.75 6.93991 17.3023 6.49219 16.75 6.49219C16.1977 6.49219 15.75 6.93991 15.75 7.49219C15.75 8.04447 16.1977 8.49219 16.75 8.49219ZM12 7.74219C9.51472 7.74219 7.5 9.75691 7.5 12.2422C7.5 14.7275 9.51472 16.7422 12 16.7422C14.4853 16.7422 16.5 14.7275 16.5 12.2422C16.5027 11.0479 16.0294 9.90176 15.1849 9.05727C14.3404 8.21278 13.1943 7.73953 12 7.74219ZM9.25 12.2422C9.25 13.761 10.4812 14.9922 12 14.9922C13.5188 14.9922 14.75 13.761 14.75 12.2422C14.75 10.7234 13.5188 9.49219 12 9.49219C10.4812 9.49219 9.25 10.7234 9.25 12.2422Z"
                                        fill="white"
                                    />
                                </svg>
                            </Link>
                        </p>
                        <p className=" flex items-center justify-center transition-transform duration-200 ease-out hover:scale-105 active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1">
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M17.1761 4.24219H19.9362L13.9061 11.0196L21 20.2422H15.4456L11.0951 14.6488L6.11723 20.2422H3.35544L9.80517 12.993L3 4.24219H8.69545L12.6279 9.35481L17.1761 4.24219ZM16.2073 18.6176H17.7368L7.86441 5.78147H6.2232L16.2073 18.6176Z"
                                    fill="white"
                                />
                            </svg>
                        </p>

                        <p>
                            <Link
                                href={
                                    "https://www.tiktok.com/@aj.empire?_r=1&_t=ZS-93Ta57EkrMP"
                                }
                                className=" flex items-center justify-center transition-transform duration-200 ease-out hover:scale-105 active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M16 21.75C17.525 21.75 18.9875 21.1442 20.0659 20.0659C21.1442 18.9875 21.75 17.525 21.75 16V8C21.75 6.47501 21.1442 5.01247 20.0659 3.93414C18.9875 2.8558 17.525 2.25 16 2.25H8C6.47501 2.25 5.01247 2.8558 3.93414 3.93414C2.8558 5.01247 2.25 6.47501 2.25 8V16C2.25 17.525 2.8558 18.9875 3.93414 20.0659C5.01247 21.1442 6.47501 21.75 8 21.75H16ZM13.711 5.763C13.6544 5.59444 13.5398 5.45147 13.3876 5.35959C13.2353 5.26771 13.0554 5.2329 12.8799 5.26137C12.7044 5.28985 12.5447 5.37974 12.4293 5.51503C12.314 5.65032 12.2504 5.8222 12.25 6V15C12.25 15.445 12.118 15.88 11.8708 16.25C11.6236 16.62 11.2722 16.9084 10.861 17.0787C10.4499 17.249 9.9975 17.2936 9.56105 17.2068C9.12459 17.1199 8.72368 16.9057 8.40901 16.591C8.09434 16.2763 7.88005 15.8754 7.79323 15.439C7.70642 15.0025 7.75097 14.5501 7.92127 14.139C8.09157 13.7278 8.37996 13.3764 8.74997 13.1292C9.11998 12.882 9.55499 12.75 10 12.75C10.1989 12.75 10.3897 12.671 10.5303 12.5303C10.671 12.3897 10.75 12.1989 10.75 12C10.75 11.8011 10.671 11.6103 10.5303 11.4697C10.3897 11.329 10.1989 11.25 10 11.25C9.25832 11.25 8.5333 11.4699 7.91661 11.882C7.29993 12.294 6.81928 12.8797 6.53545 13.5649C6.25162 14.2502 6.17736 15.0042 6.32206 15.7316C6.46675 16.459 6.8239 17.1272 7.34835 17.6517C7.8728 18.1761 8.54098 18.5332 9.26841 18.6779C9.99584 18.8226 10.7498 18.7484 11.4351 18.4645C12.1203 18.1807 12.706 17.7001 13.118 17.0834C13.5301 16.4667 13.75 15.7417 13.75 15V8.458C14.517 9.17 15.597 9.75 17 9.75C17.1989 9.75 17.3897 9.67098 17.5303 9.53033C17.671 9.38968 17.75 9.19891 17.75 9C17.75 8.80109 17.671 8.61032 17.5303 8.46967C17.3897 8.32902 17.1989 8.25 17 8.25C16.028 8.25 15.289 7.85 14.741 7.331C14.181 6.799 13.843 6.158 13.711 5.763Z"
                                        fill="white"
                                    />
                                </svg>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Footer;
