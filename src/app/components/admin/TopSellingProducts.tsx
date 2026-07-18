'use client'
import { filterByPeriod } from '@/lib/dashboard-utils';
import { IOrder } from '@/lib/types';
import Image from "next/image";
import Link from "next/link";

interface TopSellingProductsProps {
    orders?: IOrder[];
    period?: string;
}

const TopSellingProducts = ({ orders = [], period = 'This week' }: TopSellingProductsProps) => {
    const filteredOrders = filterByPeriod(orders, period, (o) => o.createdAt);

    const productSales = filteredOrders.reduce((acc: Record<string, { id: string; name: string; sales: number; price: number; image: string }>, order) => {
        order.items?.forEach((item) => {
            const productId = item.product._id;
            if (!productId || productId === 'unknown') return;

            const productName = item.product.name || (typeof productId === 'string' ? `Product ${productId.slice(-6)}` : 'Unknown Product');
            const productPrice = item.price;
            const productImage = item.image || "https://via.placeholder.com/100";

            if (!acc[productId]) {
                acc[productId] = {
                    id: productId,
                    name: productName,
                    sales: 0,
                    price: productPrice,
                    image: productImage
                };
            }

            acc[productId].sales += (item.qty || 1);
        });
        return acc;
    }, {});

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    const lowerPeriod = period.toLowerCase();
    const periodLabel = lowerPeriod === 'all time' ? 'all time' : lowerPeriod === 'this week' ? 'this week' : lowerPeriod === 'this month' ? 'this month' : 'this year';

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1">
            <div className="mb-6">
                <h4 className="font-medium text-brand_gray_dark text-sm">Top selling Products</h4>
                <p className="text-[10px] text-gray-400 mt-1">In {periodLabel}</p>
            </div>

            <div className="flex flex-col gap-5">
                {topProducts.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No sales data for this period</p>
                ) : (
                    topProducts.map((product) => (
                        <Link
                            key={product.id}
                            href={`/admin/inventory?productId=${product.id}`}
                            className="flex items-center justify-between hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gray-50 rounded-full overflow-hidden relative">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-[13px] font-medium text-gray-800">{product.name}</p>
                                    <p className="text-[10px] text-gray-400">{product.sales} Sales</p>
                                </div>
                            </div>
                            <span className="text-[13px] font-bold text-gray-800">₦{product.price.toLocaleString()}</span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default TopSellingProducts;
