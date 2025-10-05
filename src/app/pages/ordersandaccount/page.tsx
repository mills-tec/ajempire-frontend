import { redirect } from "next/navigation"

export default function OrdersAndAccountPage() {
    return (
        <div>
            <div className="hidden lg:block">
                {
                    redirect("/pages/ordersandaccount/orders/all")
                }
            </div>
        </div>
    )
}