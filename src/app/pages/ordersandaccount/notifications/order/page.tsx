import NotificationTable from "../../components/NotificationTable";
import OrderNotificationCom from "../../components/OrderNotificatiCom";

export default function orders() {
    return (
        <div className="px-5 lg:px-0 lg:mt-4">
            <NotificationTable />
            <div className="mt-6 flex flex-col gap-4">
                <OrderNotificationCom />
            </div>
        </div>
    )
}
