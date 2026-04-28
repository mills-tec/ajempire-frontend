'use client'
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface InventoryAlertProps {
    products?: any[];
}

const InventoryAlert = ({ products = [] }: InventoryAlertProps) => {
    // Generate alerts based on actual product stock data
    const alerts = [
        // Low stock products (1-10 items)
        ...products
            .filter(product => product.stock > 0 && product.stock <= 10)
            .slice(0, 3)
            .map(product => ({
                name: product.name || `Product ${product._id?.slice(-6)}`,
                status: "Low Stock",
                color: "#fb8c00",
                statusColor: "text-orange-500",
                stock: product.stock
            })),
        
        // Out of stock products
        ...products
            .filter(product => product.stock === 0)
            .slice(0, 2)
            .map(product => ({
                name: product.name || `Product ${product._id?.slice(-6)}`,
                status: "Out of Stock",
                color: "#f44336",
                statusColor: "text-red-500",
                stock: 0
            })),
        
        // If no stock issues, show healthy inventory
        ...(products.filter(p => p.stock > 0 && p.stock <= 10).length === 0 && 
          products.filter(p => p.stock === 0).length === 0 && 
          products.length > 0 ? [{
            name: "All Products In Stock",
            status: "In Stock",
            color: "#4caf50",
            statusColor: "text-green-500",
            stock: null
          }] : [])
    ];

    // Fallback alerts if no products provided
    const displayAlerts = alerts.length > 0 ? alerts : [
        { name: "Gucci Bag", status: "Low Stock", color: "#fb8c00", statusColor: "text-orange-500", stock: 5 },
        { name: "Iphone 11", status: "Out of Stock", color: "#f44336", statusColor: "text-red-500", stock: 0 },
        { name: "Dell", status: "In Stock", color: "#4caf50", statusColor: "text-green-500", stock: 25 },
    ];

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1">
            <div className="mb-6">
                <h4 className="font-medium text-brand_gray_dark text-sm">Inventory Alert</h4>
            </div>

            <div className="flex flex-col gap-6">
                {displayAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: alert.color }} />
                            <div>
                                <p className="text-[13px] font-medium text-gray-800">{alert.name}</p>
                                <p className="text-[10px] text-gray-400">{alert.status}</p>
                            </div>
                        </div>
                        <Link href="#" className="flex items-center gap-1 text-[10px] text-brand_pink font-medium hover:underline">
                            View item <ArrowUpRight size={10} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InventoryAlert;
