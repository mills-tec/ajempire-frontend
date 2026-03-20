import ProfileName from "@/app/components/ui/ProfileName";
import { NotificationsIcon } from "@/components/svgs/NotificationsIcon";
import SettingsIcon from "@/components/svgs/SettingIcon";
import Link from "next/link";

export default function Profile() {
    return (
        <div>
            <div className="w-full flex justify-between">
                <Link href={"/pages/ordersandaccount/settings/profile"} className=" transition-transform duration-200 ease-out  active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1">
                    <ProfileName />
                </Link>
                <div className="flex items-center gap-2 ">
                    <Link href={"/pages/ordersandaccount/notifications/all"} className=" transition-transform duration-200 ease-out  active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1">
                        <NotificationsIcon className="text-black" />
                    </Link>
                    <Link href={"/pages/ordersandaccount/settings"} className=" transition-transform duration-200 ease-out  active:scale-90 focus:outline-nonefocus-visible:ring-2 focus-visible:ring-white/60rounded-fullp-1">
                        <SettingsIcon />
                    </Link>
                </div>
            </div>
        </div>
    )
}