import FlashSaleNotificationCom from "../../components/FlashSaleNotificationCom";
import NotificationTable from "../../components/NotificationTable";

export default function flashsale() {
    return (
        <div className="px-5 lg:px-0 lg:mt-4">
            <NotificationTable />
            <div className="mt-6 flex flex-col gap-4">
                <FlashSaleNotificationCom />
                <FlashSaleNotificationCom />
                <FlashSaleNotificationCom />
            </div>
        </div>
    )
}
