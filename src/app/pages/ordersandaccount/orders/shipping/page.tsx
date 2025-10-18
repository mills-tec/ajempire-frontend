import OrdersContent from "@/app/components/OrdersContent";
import OrderTabs from "../../components/OrderTabs";

export default function ShippingOder() {
  return (
    <div className="w-full mt-3">
      <OrderTabs />
      <OrdersContent title="Shipped" />
    </div>
  );
}
