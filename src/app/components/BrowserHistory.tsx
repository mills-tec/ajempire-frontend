const mockRecentlyViewed = [
    { id: "1", name: "Makeup Kit", price: "₦7,000", image: "/img/product1.png", stock: 2 },
    { id: "2", name: "Skincare Set", price: "₦7,000", image: "/img/product2.png", stock: 2 },
    { id: "3", name: "Perfume Set", price: "₦7,000", image: "/img/product3.png", stock: 2 },
    { id: "4", name: "Lipstick Kit", price: "₦7,000", image: "/img/product4.png", stock: 2 },
    { id: "5", name: "Brush Set", price: "₦7,000", image: "/img/product5.png", stock: 2 },
];

const RecentlyViewedMobile = ({ products = mockRecentlyViewed }) => {
    return (
        <div className="overflow-x-auto py-2">
            <div className="flex gap-4">
                {products.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-40 relative bg-white rounded-lg shadow-md">
                        {/* Badge */}
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                            Only {product.stock} left
                        </div>

                        {/* Product Image */}
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-t-lg"
                        />

                        {/* Price */}
                        <div className="p-2 text-center font-semibold text-sm text-pink-600">
                            {product.price}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewedMobile;
