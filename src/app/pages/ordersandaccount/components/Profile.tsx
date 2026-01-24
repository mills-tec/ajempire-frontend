import ProfileName from "@/app/components/ui/ProfileName";
import { NotificationsIcon } from "@/components/svgs/NotificationsIcon";
import SettingsIcon from "@/components/svgs/SettingIcon";
import Link from "next/link";

export default function Profile() {
    return (
        <div>
            <div className="w-full flex justify-between">
                <Link href={"/pages/ordersandaccount/settings/profile"}>
                    <ProfileName />
                </Link>
                <div className="flex items-center gap-2">
                    <Link href={"/pages/ordersandaccount/notifications"}>
                        <NotificationsIcon className="text-black" />
                    </Link>
                    <Link href={"/pages/ordersandaccount/settings"}>
                        <SettingsIcon />
                    </Link>
                </div>
            </div>
        </div>
    )
}