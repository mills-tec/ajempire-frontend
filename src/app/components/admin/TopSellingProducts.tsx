'use client'
import Image from "next/image";

interface TopSellingProductsProps {
    orders?: any[];
}

const TopSellingProducts = ({ orders = [] }: TopSellingProductsProps) => {
    // Calculate product sales from orders
    const productSales = orders?.reduce((acc: Record<string, { name: string; sales: number; price: number; image: string }>, order) => {
        order.items?.forEach((item: any) => {
            const productId = item.productId || item._id || 'unknown';
            const productName = item.name || item.productName || `Product ${productId.slice(-6)}`;
            const productPrice = item.price || 0;
            const productImage = item.image || item.cover_image || "https://via.placeholder.com/100";
            
            if (!acc[productId]) {
                acc[productId] = {
                    name: productName,
                    sales: 0,
                    price: productPrice,
                    image: productImage
                };
            }
            
            acc[productId].sales += (item.quantity || 1);
        });
        return acc;
    }, {}) || {};

    // Convert to array, sort by sales, and take top 5
    const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b.sales - a.sales)
        .slice(0, 5)
        .map(([productId, product]) => ({
            name: product.name,
            sales: `${product.sales} Sales`,
            price: `₦${product.price.toLocaleString()}`,
            image: product.image
        }));

    // Fallback data if no products provided
    const displayProducts = topProducts.length > 0 ? topProducts : [
        { name: "Product X", sales: "123 Sales", price: "₦20,000", image: "https://via.placeholder.com/100" },
        { name: "Product Y", sales: "98 Sales", price: "₦15,000", image: "https://via.placeholder.com/100" },
        { name: "Product Z", sales: "76 Sales", price: "₦25,000", image: "https://via.placeholder.com/100" },
        { name: "Product A", sales: "54 Sales", price: "₦18,000", image: "https://via.placeholder.com/100" },
        { name: "Product B", sales: "32 Sales", price: "₦22,000", image: "https://via.placeholder.com/100" },
    ];

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1">
            <div className="mb-6">
                <h4 className="font-medium text-brand_gray_dark text-sm">Top selling Products</h4>
                <p className="text-[10px] text-gray-400 mt-1">In the last 30days</p>
            </div>

            <div className="flex flex-col gap-5">
                {displayProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden relative">
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
                                <p className="text-[10px] text-gray-400">{product.sales}</p>
                            </div>
                        </div>
                        <span className="text-[13px] font-bold text-gray-800">{product.price}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopSellingProducts;
