import { NotificationsIcon } from "@/components/svgs/NotificationsIcon";
import SettingsIcon from "@/components/svgs/SettingIcon";
import Link from "next/link";

export default function Profile() {
    return (
        <div>
            <Link href={"#"} className="w-full flex justify-between">
                <div className="flex items-center gap-3 font-poppins">
                    <div className="bg-brand_gradient_dark rounded-full w-[50px] h-[50px] text-center flex items-center justify-center ">
                        JB
                    </div>
                    <h1>Prince Mills</h1>
                </div>
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