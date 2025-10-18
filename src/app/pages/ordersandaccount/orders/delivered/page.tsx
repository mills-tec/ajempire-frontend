import OrdersContent from "@/app/components/OrdersContent";
import OrderTabs from "../../components/OrderTabs";

export default function DeliveredOder() {
  return (
    <div className="w-full mt-3">
      <OrderTabs />
      <OrdersContent title="Delivered" />
    </div>
  );
}
