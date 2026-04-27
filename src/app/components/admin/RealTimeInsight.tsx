'use client'
import { Eye, MousePointer2, ShoppingCart, User } from "lucide-react";

interface RealTimeInsightProps {
    orders?: any[];
}

const RealTimeInsight = ({ orders = [] }: RealTimeInsightProps) => {
    // Calculate today's orders from the orders data
    const todayOrders = orders?.filter(order => {
        const orderDate = new Date(order.createdAt).toDateString();
        const today = new Date().toDateString();
        return orderDate === today;
    }).length || 0;

    const insights = [
        {
            label: "Live Visitors",
            value: "213",
            icon: User,
            iconColor: "#1e88e5",
            bgColor: "#e3f2fd"
        },
        {
            label: "Items in cart",
            value: "45",
            icon: ShoppingCart,
            iconColor: "#ff8f00",
            bgColor: "#fff8e1"
        },
        {
            label: "page view today",
            value: "732",
            icon: Eye,
            iconColor: "#ab47bc",
            bgColor: "#f3e5f5"
        },
        {
            label: "Orders Today",
            value: todayOrders.toString(),
            icon: MousePointer2,
            iconColor: "#00acc1",
            bgColor: "#e0f7fa"
        }
    ];

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <h4 className="font-medium text-brand_gray_dark text-sm">Real-Time Insight</h4>
                <select className="bg-transparent text-xs text-gray-400 outline-none">
                    <option>This Week</option>
                </select>
            </div>

            <div className="flex flex-col gap-6">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: insight.bgColor }}
                            >
                                <insight.icon size={20} color={insight.iconColor} />
                            </div>
                            <span className="text-[13px] text-gray-700 font-medium">{insight.label}</span>
                        </div>
                        <span className="text-[15px] font-bold text-gray-800">{insight.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RealTimeInsight;
