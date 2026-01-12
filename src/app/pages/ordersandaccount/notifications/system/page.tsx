import EmptyNotification from "@/components/EmptyNotification";
import NotificationTable from "../../components/NotificationTable";

export default function system() {
    return (
        <div className="px-5 lg:px-0 lg:mt-4">
            <NotificationTable />
            <div className="mt-20">
                <EmptyNotification />
            </div>
        </div>
    )
}
