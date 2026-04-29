"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal, Eye, Edit2, Trash2, LayoutGrid, Boxes, AlertCircle, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { getAllCategories, getProducts, deleteProduct, updateProduct } from '@/lib/adminapi';
import { useToast, ToastContainer } from '@/app/components/ui/Toast';
import Link from 'next/link';

const InventoryPage = () => {
    const toast = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchInventoryData();
        }
    }, [mounted]);

    const fetchInventoryData = async (cursor?: string, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
                setProducts([]); // Reset for fresh load
            }
            
            const productsResponse = await getProducts(cursor);
            const categoriesResponse = await getAllCategories();

            console.log('Products Response:', productsResponse);
            console.log('Categories Response:', categoriesResponse);

            // Transform products data from new response structure
            if ((productsResponse as any)?.message?.products && Array.isArray((productsResponse as any).message.products)) {
                console.log('Products array length:', (productsResponse as any).message.products.length);
                const transformedProducts = (productsResponse as any).message.products.map((product: any) => ({
                    id: product._id || 'Unknown',
                    name: product.name || 'Unknown Product',
                    category: product.category?.name || 'Unknown Category',
                    stock: product.stock || 0,
                    rating: product.averageRating || 0,
                    price: `₦${(product.price || 0).toLocaleString()}`,
                    discount: `₦${(product.discountedPrice || 0).toLocaleString()}`,
                    status: product.productStatus === 'in stock' 
                        ? (product.stock > 10 ? 'In-stock' : 'Low in stock') 
                        : 'Out of stock',
                    image: product.cover_image || '',
                    itemsSold: product.itemsSold || 0,
                    isFeatured: product.isFeatured || false,
                    fullProduct: product
                }));
                console.log('Transformed Products:', transformedProducts);
                
                if (isLoadMore) {
                    setProducts(prev => [...prev, ...transformedProducts]);
                } else {
                    setProducts(transformedProducts);
                }
                
                // Update pagination state
                setNextCursor((productsResponse as any).nextCursor || null);
                setHasMore((productsResponse as any).hasMore || false);
            } else {
                console.log('No products found or invalid format');
                console.log('Response structure:', productsResponse);
                setProducts([]);
                setNextCursor(null);
                setHasMore(false);
            }

            // Transform categories data
            if ((categoriesResponse as any)?.message && Array.isArray((categoriesResponse as any).message)) {
                console.log('Categories array length:', (categoriesResponse as any).message.length);
                setCategories((categoriesResponse as any).message);
            } else {
                console.log('No categories found or invalid format');
                console.log('Categories response structure:', categoriesResponse);
            }
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Calculate stats dynamically
    const totalProducts = products?.length || 0;
    const totalCategories = categories?.length || 0;
    const lowStockProducts = products?.filter(p => p.stock > 0 && p.stock <= 10).length || 0;
    const outOfStockProducts = products?.filter(p => p.stock === 0).length || 0;
    const averageRating = products?.length > 0 
        ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
        : '0.0';
    const totalItemsSold = products?.reduce((sum, p) => sum + (p.itemsSold || 0), 0) || 0;
    const featuredProducts = products?.filter(p => p.isFeatured).length || 0;

    // Filter products based on search
    const filteredProducts = products?.filter(product => {
        const id = product?.id?.toString() || '';
        const name = product?.name?.toString() || '';
        const category = product?.category?.toString() || '';
        const status = product?.status?.toString() || '';
        const searchLower = searchTerm?.toLowerCase() || '';
        
        return id.toLowerCase().includes(searchLower) ||
               name.toLowerCase().includes(searchLower) ||
               category.toLowerCase().includes(searchLower) ||
               status.toLowerCase().includes(searchLower);
    }) || [];

    // Debug logging
    console.log('Current products state:', products);
    console.log('Filtered products:', filteredProducts);
    console.log('Search term:', searchTerm);

    const handleDeleteClick = (product: any) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    const handleEditClick = (product: any) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleViewClick = (product: any) => {
        setSelectedProduct(product);
        setShowViewModal(true);
    };

    const handleLoadMore = async () => {
        if (hasMore && nextCursor && !loadingMore) {
            await fetchInventoryData(nextCursor, true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedProduct) {
            try {
                setIsDeleting(true);
                // Call delete product API
                console.log('Deleting product:', selectedProduct.id);
                await deleteProduct(selectedProduct.id);
                
                // Remove from local state immediately
                setProducts(prev => {
                    const updatedProducts = prev.filter(p => p.id !== selectedProduct.id);
                    console.log('Products after deletion:', updatedProducts);
                    return updatedProducts;
                });
                
                // Show success toast
                toast.success('Product deleted successfully');
                
                // Reset pagination and fetch fresh data to ensure consistency
                setNextCursor(null);
                setHasMore(true);
                fetchInventoryData();
            } catch (error) {
                console.error('Error deleting product:', error);
                // Show error toast
                toast.error('Failed to delete product');
                // If API fails, refresh data to restore correct state
                fetchInventoryData();
            } finally {
                setIsDeleting(false);
                // Close modal and clear selection
                setShowDeleteModal(false);
                setSelectedProduct(null);
            }
        }
    };

    const handleEditSave = async () => {
        try {
            // Collect form data
            const form = document.querySelector('#edit-product-form') as HTMLFormElement;
            const formData = new FormData(form);
            
            // Map status values to match API enum
            const statusMap: { [key: string]: 'active' | 'inactive' | 'draft' } = {
                'in stock': 'active',
                'out of stock': 'inactive',
                'discontinued': 'draft'
            };
            
            const statusValue = formData.get('status') as string;
            
            const updatedProduct = {
                name: formData.get('name') as string,
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                weight: parseFloat(formData.get('weight') as string),
                status: statusMap[statusValue] || 'active',
            };

            // Validate required fields
            if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.stock || !updatedProduct.weight) {
                toast.error('Please fill in all required fields including weight');
                return;
            }

            // Call update product API
            console.log('Updating product:', updatedProduct);
            await updateProduct(selectedProduct.id, updatedProduct);
            
            // Update local state immediately to reflect changes
            setProducts(prev => {
                const updatedProducts = prev.map(p => 
                    p.id === selectedProduct.id 
                        ? { ...p, ...updatedProduct }
                        : p
                );
                console.log('Products after update:', updatedProducts);
                return updatedProducts;
            });
            
            // Close modal and clear selection
            setShowEditModal(false);
            setSelectedProduct(null);
            
            // Show success toast
            toast.success('Product updated successfully');
            
            // Reset pagination and fetch fresh data to ensure consistency
            setNextCursor(null);
            setHasMore(true);
            fetchInventoryData();
        } catch (error) {
            console.error('Error updating product:', error);
            // Show error toast
            toast.error('Failed to update product');
            // If API fails, refresh data to restore correct state
            fetchInventoryData();
        }
    };

    const confirmDelete = async () => {
        if (selectedProduct) {
            try {
                // Call delete product API
                console.log('Deleting product:', selectedProduct.id);
                await deleteProduct(selectedProduct.id);
                
                // Remove from local state
                setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
                setShowDeleteModal(false);
                setSelectedProduct(null);
                
                // Refresh data to ensure consistency
                fetchInventoryData();
            } catch (error) {
                console.error('Error deleting product:', error);
                // You could add error handling here (e.g., show error message)
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedProduct(null);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'In-stock': return 'bg-green-50 text-green-500 border-green-100';
            case 'Low in stock': return 'bg-orange-50 text-orange-500 border-orange-100';
            case 'Out of stock': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/30 font-poppins pr-5 pb-10">
            {!mounted ? (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                </div>
            ) : (
                <>
                    <div className="mx-auto">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {/* Total Products Card */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center">
                                        <Boxes size={20} className="text-blue-500" />
                                    </div>
                                    <select className="bg-transparent text-[10px] text-gray-500 border-none outline-none cursor-pointer">
                                        <option>This Week</option>
                                        <option>This Month</option>
                                    </select>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
                                <p className="text-sm text-gray-500 mt-1">Total Products</p>
                            </div>

                            {/* Categories Card */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center">
                                        <LayoutGrid size={20} className="text-green-500" />
                                    </div>
                                    <select className="bg-transparent text-[10px] text-gray-500 border-none outline-none cursor-pointer">
                                        <option>This Week</option>
                                        <option>This Month</option>
                                    </select>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{totalCategories}</h3>
                                <p className="text-sm text-gray-500 mt-1">Categories</p>
                            </div>

                            {/* Out of Stock Card */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-red-50 w-10 h-10 rounded-xl flex items-center justify-center">
                                        <AlertCircle size={20} className="text-red-500" />
                                    </div>
                                    <select className="bg-transparent text-[10px] text-gray-500 border-none outline-none cursor-pointer">
                                        <option>This Week</option>
                                        <option>This Month</option>
                                    </select>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{outOfStockProducts}</h3>
                                <p className="text-sm text-gray-500 mt-1">Out of Stock</p>
                            </div>

                            {/* Average Rating Card */}
                            <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                                        <Star size={20} className="text-brand_pink" />
                                    </div>
                                    <select className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer">
                                        <option>This Week</option>
                                        <option>This Month</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-brand_gray_dark/60 text-xs font-medium mb-1 whitespace-nowrap">Low Stock Alert</p>
                                        <h3 className="text-2xl font-bold text-brand_gray_dark">{lowStockProducts}</h3>
                                    </div>
                                    <div>
                                        <p className="text-brand_gray_dark/60 text-xs font-medium mb-1 whitespace-nowrap">Items Sold</p>
                                        <h3 className="text-2xl font-bold text-brand_gray_dark">{totalItemsSold}</h3>
                                    </div>
                                    <div>
                                        <p className="text-brand_gray_dark/60 text-xs font-medium mb-1 whitespace-nowrap">Featured</p>
                                        <h3 className="text-2xl font-bold text-brand_gray_dark">{featuredProducts}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <button 
                                onClick={() => fetchInventoryData()}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all"
                            >
                                <AlertCircle size={18} />
                                Refresh Stats
                            </button>
                            <Link href="/admin/add-product" className="bg-brand_pink hover:bg-brand_pink/90 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-md active:scale-95">
                                <Plus size={18} />
                                Add New Product
                            </Link>
                        </div>

                        {/* Table Container */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-10">
                            {/* Search and Filters */}
                            <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50">
                                <div className="relative w-full md:w-96 group">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search Product Name, ID, Category, Status"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                                        <LayoutGrid size={16} />
                                        Filter
                                    </button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
                                        <Filter size={16} />
                                        Filter
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="p-4 w-12 text-center">
                                                <input type="checkbox" className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer" />
                                            </th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Product Name</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Product ID</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Category</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Stock Level</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Star Rating</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Price</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Discount</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                                            <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredProducts.map((product, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-4 text-center">
                                                <input type="checkbox" className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand_pink/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                                                        <ShoppingCart size={16} className="text-brand_pink/20" />
                                                    </div>
                                                    <span className="font-semibold text-sm text-brand_gray_dark">{product.name.slice(0, 20)}...</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-brand_gray_dark/80">{product.id.slice(0, 5)}...</td>
                                            <td className="p-4 text-sm text-brand_gray_dark/80">{product.category}</td>
                                            <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">{product.stock}</td>
                                            <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">{product.rating}</td>
                                            <td className="p-4 text-sm font-bold text-brand_gray_dark">{product.price}</td>
                                            <td className="p-4 text-sm font-medium text-brand_gray_dark/60">{product.discount}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(product.status)}`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => handleDeleteClick(product)}
                                                        className="text-brand_gray hover:text-red-500 transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditClick(product)}
                                                        className="text-brand_gray hover:text-brand_pink transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleViewClick(product)}
                                                        className="text-brand_gray hover:text-blue-500 transition-colors"
                                                        title="View Product"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-6 py-3 bg-brand_pink hover:bg-brand_pink/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading more...
                                    </>
                                ) : (
                                    <>
                                        Load More
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Modals */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                                    <button 
                                        onClick={() => setShowDeleteModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-gray-600">Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.</p>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        disabled={isDeleting}
                                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {showEditModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
                                    <button 
                                        onClick={() => setShowEditModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <form id="edit-product-form" className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            defaultValue={selectedProduct?.name}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                            <input
                                                type="text"
                                                name="price"
                                                defaultValue={selectedProduct?.price}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                defaultValue={selectedProduct?.stock}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                step="0.01"
                                                min="0"
                                                defaultValue={selectedProduct?.weight}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink"
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            name="status"
                                            defaultValue={selectedProduct?.status}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink"
                                        >
                                            <option value="in stock">In Stock</option>
                                            <option value="out of stock">Out of Stock</option>
                                            <option value="discontinued">Discontinued</option>
                                        </select>
                                    </div>
                                </form>
                                
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSave}
                                        className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/80"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {showViewModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                                    <button 
                                        onClick={() => setShowViewModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Product Name</p>
                                            <p className="font-medium">{selectedProduct?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Product ID</p>
                                            <p className="font-medium">{selectedProduct?.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-medium">{selectedProduct?.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Stock Level</p>
                                            <p className="font-medium">{selectedProduct?.stock}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="font-medium">{selectedProduct?.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Discount</p>
                                            <p className="font-medium">{selectedProduct?.discount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(selectedProduct?.status)}`}>
                                                {selectedProduct?.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Rating</p>
                                            <p className="font-medium">{selectedProduct?.rating} ⭐</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowViewModal(false)}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </>
            )}

            {/* Toast Container */}
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        </div>
    );
};

export default InventoryPage;