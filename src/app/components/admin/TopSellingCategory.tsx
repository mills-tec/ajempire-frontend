'use client'

interface TopSellingCategoryProps {
    orders?: any[];
}

const TopSellingCategory = ({ orders = [] }: TopSellingCategoryProps) => {
    // Calculate category sales from orders
    const categorySales = orders?.reduce((acc: Record<string, { name: string; sales: number; value: number }>, order) => {
        order.items?.forEach((item: any) => {
            const category = item.category || 'Unknown Category';
            
            if (!acc[category]) {
                acc[category] = {
                    name: category,
                    sales: 0,
                    value: 0
                };
            }
            
            const itemValue = (item.price || 0) * (item.quantity || 1);
            acc[category].sales += (item.quantity || 1);
            acc[category].value += itemValue;
        });
        return acc;
    }, {}) || {};

    // Convert to array, sort by value, and take top 7
    const topCategories = Object.values(categorySales)
        .sort((a, b) => b.value - a.value)
        .slice(0, 7)
        .map((category, index) => ({
            name: category.name,
            value: category.value.toLocaleString(),
            change: `${Math.floor(Math.random() * 40) - 20}%`, // Random change for demo
            negative: Math.random() > 0.5,
            neutral: Math.random() > 0.8
        }));

    // Fallback data if no categories provided
    const displayCategories = topCategories.length > 0 ? topCategories : [
        { name: "New Arrivals", value: "1,509", change: "+12%", negative: false },
        { name: "Gel Polishes", value: "1,460", change: "-12%", negative: true },
        { name: "Nail Decorations", value: "1,229", change: "0%", negative: false, neutral: true },
        { name: "Prep Solutions", value: "986", change: "+19%", negative: false },
        { name: "Artificial Nails", value: "791", change: "-25%", negative: true },
        { name: "Acrylic Powders", value: "679", change: "+11%", negative: false },
        { name: "Acrylic Powders", value: "679", change: "+11%", negative: false },
    ];

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1">
            <div className="mb-6">
                <h4 className="font-medium text-brand_gray_dark text-sm">Top selling Category</h4>
                <p className="text-[10px] text-gray-400 mt-1">In the last 30days</p>
            </div>

            <div className="flex flex-col gap-5">
                {displayCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand_pink/10" />
                            <span className="text-[13px] font-medium text-gray-700">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-bold text-gray-800">{category.value}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium ${category.neutral ? 'bg-gray-100 text-gray-400 border border-gray-200' :
                                    category.negative ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'
                                }`}>
                                {category.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopSellingCategory;
