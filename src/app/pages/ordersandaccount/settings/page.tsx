"use client";
import Link from "next/link";
import SettingsItem from "../components/SettingsItem";
import { toast } from "sonner";
import { useModalStore } from "@/lib/stores/modal-store";

export default function Settings() {
    const openModal = useModalStore(s => s.openModal);
    const handleShareApp = async () => {
        const url = window.location.origin;

        if (navigator.share) {
            await navigator.share({
                title: "Check out this app!",
                text: "Discover premium cosmetics and beauty essentials at AJ Empire ✨ Shop original products, great prices, and fast delivery. Try it now 👇",
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("copied app link", { position: "top-right" })
        }
    };
    const handleLogout = () => {
        openModal("signout-confirm");
    }

    return (
        <div className="font-poppins lg:px-5 w-full mt-3 lg:mt-0  lg:block overflow-hidden ">
            <div className="lg:hidden pb-6 px-5 flex items-center  mb-[10px] shadow-md">
                <Link href={"/pages/ordersandaccount"}>
                    <svg width="9" height="17" viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.78122 15.2198C8.8509 15.2895 8.90617 15.3722 8.94388 15.4632C8.9816 15.5543 9.00101 15.6519 9.00101 15.7504C9.00101 15.849 8.9816 15.9465 8.94388 16.0376C8.90617 16.1286 8.8509 16.2114 8.78122 16.281C8.71153 16.3507 8.62881 16.406 8.53776 16.4437C8.44672 16.4814 8.34914 16.5008 8.25059 16.5008C8.15204 16.5008 8.05446 16.4814 7.96342 16.4437C7.87237 16.406 7.78965 16.3507 7.71996 16.281L0.219965 8.78104C0.150232 8.71139 0.0949136 8.62867 0.0571704 8.53762C0.0194272 8.44657 0 8.34898 0 8.25042C0 8.15186 0.0194272 8.05426 0.0571704 7.96321C0.0949136 7.87216 0.150232 7.78945 0.219965 7.71979L7.71996 0.219792C7.8607 0.0790615 8.05157 -3.92322e-09 8.25059 0C8.44961 3.92322e-09 8.64048 0.0790615 8.78122 0.219792C8.92195 0.360523 9.00101 0.551394 9.00101 0.750417C9.00101 0.94944 8.92195 1.14031 8.78122 1.28104L1.8109 8.25042L8.78122 15.2198Z" fill="black" />
                    </svg>
                </Link>
                <div className=" w-full text-center font-semibold text-black/70">
                    <p>Switch Account</p>
                </div>
            </div>
            <div className="px-5">
                <SettingsItem label="Country & region" value="NG" />
                <SettingsItem label="Language" value="English" />
                <SettingsItem label="Currency" value="NG" />
                <SettingsItem label="Notifications" href="/pages/ordersandaccount/notifications/all" />
                <SettingsItem label="About" href="/pages/ordersandaccount/settings/firstabout" />
                <SettingsItem label="Contact Us" href="/pages/ordersandaccount/support/contact" />
                <SettingsItem label="Legal terms and policies" />
                <SettingsItem label="Share this app" onClick={handleShareApp} />
                <SettingsItem label="Switch accounts" href="/pages/ordersandaccount/switchaccount" />
                <SettingsItem label="Log-Out" onClick={handleLogout} />
            </div>
        </div>
    )
}