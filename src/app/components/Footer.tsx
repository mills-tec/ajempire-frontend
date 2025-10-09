import whiteLogo from "@/assets/whitelogo.png"
import Image from "next/image";
import FooterRout from "./ui/FooterRout";

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
                        <h1 className="font-semibold mb-2 text-[#FFFFFF] font-poppins text-[14px]">Subscribe</h1>
                        <div className="text-[#FFFFFF]  transition-colors duration-300 text-[14px]">
                            <div className="flex flex-col  mb-4">
                                <p>Join our newsletter to stay updated on</p>
                                <p>new products, deals & beauty tips.</p>
                            </div>
                            <div className="">
                                <input type="email" placeholder="Enter your email" className="p-2 rounded-l-md border border-gray-300 focus:outline-none w-[300px] text-black text-[14px]" />
                                <button className="bg-[#FF008C] text-white p-2 rounded-r-md hover:bg-pink-600 transition-colors duration-300">Subscribe</button>
                            </div>
                            <div className="mt-4">
                                <p>By subscribing you agree to with our <span>Privacy Policy</span> and provide</p>
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
                        <span className="underline underline-offset-4 hover:opacity-80 transition-transform duration-300">Privacy Policy</span>
                        <span className="underline underline-offset-4  hover:opacity-80 transition-transform duration-300">Terms of Service</span>
                        <span className="underline underline-offset-4  hover:opacity-80 transition-transform duration-300">Cookies Settings</span>
                    </div>
                    <div className="flex items-center">
                        <p>f</p>
                        <p>f</p>
                        <p>f</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Footer;