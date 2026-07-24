'use client'

import { IOrder } from "@/lib/types";
import Image from "next/image";
import { memo } from "react";

interface TopSellingCategoryProps {
    orders?: IOrder[];
    period?: string;
}

const TopSellingCategory = memo(function TopSellingCategory({ orders = [], period = 'This week' }: TopSellingCategoryProps) {
    // Calculate category sales from orders
    const categorySales = orders?.reduce((acc: Record<string, { name: string; sales: number; value: number; image: string; }>, order) => {
        order.items?.forEach((item) => {
            const category = item.product.category?.name || 'Unknown Category';
            if (!acc[category]) {
                acc[category] = {
                    name: category,
                    image: item.product.category?.image || '',
                    sales: 0,
                    value: 0
                };
            }

            const itemValue = item.price * item.qty;
            acc[category].sales += (item.qty || 1);
            acc[category].value += itemValue;
        });
        return acc;
    }, {}) || {};

    // Convert to array, sort by value, and take top 7
    const displayCategories = Object.values(categorySales)
        .sort((a, b) => b.value - a.value)
        .slice(0, 7)
        .map((category) => ({
            name: category.name,
            value: category.value.toLocaleString(),
            image: category.image
        }));
    const lowerPeriod = period.toLowerCase();
    const periodLabel = lowerPeriod === 'all time' ? 'all time' : lowerPeriod === 'this week' ? 'this week' : lowerPeriod === 'this month' ? 'this month' : 'this year';

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1">
            <div className="mb-6">
                <h4 className="font-medium text-brand_gray_dark text-sm">Top selling Category</h4>
                <p className="text-[10px] text-gray-400 mt-1">In {periodLabel}</p>
            </div>

            <div className="flex flex-col gap-5">
                {displayCategories.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No category sales for this period</p>
                ) : (
                    displayCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               {
                                category.image &&  <div className="w-9 h-9  bg-brand_pink/10 relative rounded-full" >
                                    <Image className="object-cover rounded-full" fill alt={category.name} src={category.image} />
                                </div>
                               }
                                <span className=" capitalize">{category.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-bold text-gray-800">₦{category.value}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

export default TopSellingCategory;
