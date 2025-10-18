import OrderTabs from "../../components/OrderTabs";
import OrdersContent from "@/app/components/OrdersContent";

export default function AllOders() {
  return (
    <div className="w-full mt-3  lg:block">
      <OrderTabs />
      <OrdersContent title="Processing" />
    </div>
  );
}
