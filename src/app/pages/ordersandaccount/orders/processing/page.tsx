import OrdersContent from "@/app/components/OrdersContent";
import OrderTabs from "../../components/OrderTabs";

export default function ProcessingOrder() {
  return (
    <div className="w-full mt-3">
      <OrderTabs />
      <OrdersContent title="Processing" />
    </div>
  );
}
