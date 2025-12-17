import ProfileName from "@/app/components/ui/ProfileName";
import { NotificationsIcon } from "@/components/svgs/NotificationsIcon";
import SettingsIcon from "@/components/svgs/SettingIcon";
import Link from "next/link";

export default function Profile() {
    return (
        <div>
            <Link href={"#"} className="w-full flex justify-between">
                <ProfileName />
                <div className="flex items-center gap-2">
                    <Link href={"#"}>
                        <NotificationsIcon className="text-black" />
                    </Link>
                    <Link href={"#"}>
                        <SettingsIcon />
                    </Link>
                </div>
            </Link>
        </div>
    )
}