"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Plus, Trash2, Save, Eye, EyeOff, UploadCloud, PlusIcon, Link, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createProduct, getAllCategories, createCategory } from '@/lib/adminapi';

// Toast component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        info: 'bg-blue-50 border-blue-200'
    };

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border ${bgColors[type]} shadow-lg max-w-md`}>
            {icons[type]}
            <span className="text-sm text-gray-800">{message}</span>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const AddProductPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showVariants, setShowVariants] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
    const [newCategoryImagePreview, setNewCategoryImagePreview] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [creatingCategory, setCreatingCategory] = useState(false);

    // Check authentication on component mount
    React.useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            showToast('Please login to access this page', 'error');
            router.push('/admin/login');
            return;
        }
        
        // Fetch categories from database
        fetchCategories();
    }, [router]);

    // Fetch categories from database
    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            
            // Check if categories are in response.message (array) or response.data
            const categoriesData = Array.isArray(response.message) ? response.message : response.data;
            
            if (response.message && categoriesData) {
                setCategories(categoriesData);
            } else {
                console.error('Failed to fetch categories:', response.error);
                showToast('Failed to load categories', 'error');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Error loading categories', 'error');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Create new category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            showToast('Please enter a category name', 'error');
            return;
        }

        setCreatingCategory(true);
        try {
            const formData = new FormData();
            formData.append('name', newCategoryName.trim());
            
            if (newCategoryImage) {
                formData.append('image', newCategoryImage);
            } else {
                // If no image provided, use a default
                formData.append('image', 'default-category.jpg');
            }

            console.log('Creating category with FormData:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await createCategory(formData);
            
            console.log('Category creation response:', response);
            console.log('Response success:', response.success);
            console.log('Response data:', response.data);
            console.log('Response message:', response.message);
            console.log('Response error:', response.error);

            // Check multiple possible success indicators
            if (response.success || response.data || response.message) {
                showToast('Category created successfully!', 'success');
                
                // Refresh categories list
                fetchCategories();
                
                // Reset form
                setNewCategoryName('');
                setNewCategoryImage(null);
                setNewCategoryImagePreview('');
                setShowCategoryModal(false);
            } else {
                console.log('Category creation considered failed - no success indicators');
                showToast(response.error || 'Failed to create category', 'error');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            showToast('Error creating category', 'error');
        } finally {
            setCreatingCategory(false);
        }
    };

    // Handle category image change
    const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewCategoryImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewCategoryImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Toast helper function
    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Basic product information
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [stock, setStock] = useState('');
    const [weight, setWeight] = useState('');
    const [productStatus, setProductStatus] = useState('in stock');
    const [isFeatured, setIsFeatured] = useState(false);
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');

    // Special Offer states
    const [isSpecialOffer, setIsSpecialOffer] = useState(false);
    const [isTimedSpecialOffer, setIsTimedSpecialOffer] = useState(false);
    const [specialOfferDate, setSpecialOfferDate] = useState<string>('');
    const [specialOfferTime, setSpecialOfferTime] = useState<string>('');

    // Variations states
    const [showVariations, setShowVariations] = useState(false);
    const [variations, setVariations] = useState([
        { type: '', values: [''], images: [null as File | null] }
    ]);

    // Media
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [additionalImages, setAdditionalImages] = useState<File[]>([]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
    const [productVideo, setProductVideo] = useState<File | null>(null);

    // Variants
    const [variants, setVariants] = useState([
        { name: 'color', values: [''] },
        { name: 'size', values: [''] }
    ]);

    // Selected combination for editing
    const [selectedCombinationIndex, setSelectedCombinationIndex] = useState<number>(0);
    const [variantCombinations, setVariantCombinations] = useState([
        {
            options: [{ name: 'color', value: '' }, { name: 'size', value: '' }],
            stock: 0,
            additionalPrice: 0
        }
    ]);

    const addVariantCombination = () => {
        // This function is no longer needed as combinations are auto-generated
        // Keeping it to prevent errors, but it won't be used
    };

    const removeVariantCombination = (index: number) => {
        // This function is no longer needed as combinations are auto-generated
        // Keeping it to prevent errors, but it won't be used
    };

    const updateCombinationOption = (comboIndex: number, variantName: string, value: string) => {
        const newCombinations = [...variantCombinations];
        const optionIndex = newCombinations[comboIndex].options.findIndex(opt => opt.name === variantName);
        if (optionIndex !== -1) {
            newCombinations[comboIndex].options[optionIndex].value = value;
        }
        setVariantCombinations(newCombinations);
    };

    // What's Inside
    const [whatsInside, setWhatsInside] = useState(['']);

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAdditionalImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProductVideo(file);
        }
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
        setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const updateVariant = (variantIndex: number, field: 'name' | 'values', value: string | string[]) => {
        const newVariants = [...variants];
        if (field === 'name') {
            newVariants[variantIndex].name = value as string;
        } else {
            newVariants[variantIndex].values = value as string[];
        }
        setVariants(newVariants);
        updateVariantCombinationsStructure(newVariants);
    };

    const addVariantValue = (variantIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values.push('');
        setVariants(newVariants);
        updateVariantCombinationsStructure(newVariants);
    };

    const removeVariantValue = (variantIndex: number, valueIndex: number) => {
        const newVariants = [...variants];
        newVariants[variantIndex].values = newVariants[variantIndex].values.filter((_, i) => i !== valueIndex);
        setVariants(newVariants);
        updateVariantCombinationsStructure(newVariants);
    };

    const updateVariantCombinationsStructure = (currentVariants: typeof variants) => {
        const validVariants = currentVariants.filter(v => v.name && v.values.some(val => val));
        
        if (validVariants.length === 0) {
            setVariantCombinations([]);
            return;
        }

        // Generate combinations based on all variant values
        const combinations: typeof variantCombinations = [];
        
        // For single variant, create combinations for each value
        if (validVariants.length === 1) {
            const variant = validVariants[0];
            variant.values.filter(val => val).forEach(value => {
                combinations.push({
                    options: [{ name: variant.name, value }],
                    stock: 0,
                    additionalPrice: 0
                });
            });
        } else {
            // For multiple variants, create all possible combinations
            const generateCombinations = (variantIndex: number, currentCombo: { name: string; value: string }[]) => {
                if (variantIndex >= validVariants.length) {
                    combinations.push({
                        options: [...currentCombo],
                        stock: 0,
                        additionalPrice: 0
                    });
                    return;
                }

                const variant = validVariants[variantIndex];
                variant.values.filter(value => value).forEach(value => {
                    generateCombinations(variantIndex + 1, [...currentCombo, { name: variant.name, value }]);
                });
            };

            generateCombinations(0, []);
        }
        
        // Preserve existing stock and price data if combinations already exist
        const updatedCombinations = combinations.map(newCombo => {
            const existingCombo = variantCombinations.find(existing => 
                JSON.stringify(existing.options.sort((a, b) => a.name.localeCompare(b.name))) === 
                JSON.stringify(newCombo.options.sort((a, b) => a.name.localeCompare(b.name)))
            );
            
            return existingCombo || newCombo;
        });
        
        setVariantCombinations(updatedCombinations);
    };

    const updateVariantCombination = (comboIndex: number, field: 'stock' | 'additionalPrice', value: number) => {
        const newCombinations = [...variantCombinations];
        newCombinations[comboIndex][field] = value;
        setVariantCombinations(newCombinations);
    };

    const addVariant = () => {
        const newVariants = [...variants, { name: '', values: [''] }];
        setVariants(newVariants);
    };

    const removeVariant = (variantIndex: number) => {
        const newVariants = variants.filter((_, i) => i !== variantIndex);
        setVariants(newVariants);
        updateVariantCombinationsStructure(newVariants);
    };

    const updateWhatsInside = (index: number, value: string) => {
        const newWhatsInside = [...whatsInside];
        newWhatsInside[index] = value;
        setWhatsInside(newWhatsInside);
    };

    const addWhatsInside = () => {
        setWhatsInside(prev => [...prev, '']);
    };

    const removeWhatsInside = (index: number) => {
        setWhatsInside(prev => prev.filter((_, i) => i !== index));
    };

    // Variation handlers
    const updateVariation = (variationIndex: number, field: 'type' | 'values' | 'images', value: any) => {
        const newVariations = [...variations];
        if (field === 'type') {
            newVariations[variationIndex].type = value;
        } else if (field === 'values') {
            newVariations[variationIndex].values = value;
        } else if (field === 'images') {
            newVariations[variationIndex].images = value;
        }
        setVariations(newVariations);
    };

    const addVariationValue = (variationIndex: number) => {
        const newVariations = [...variations];
        newVariations[variationIndex].values.push('');
        newVariations[variationIndex].images.push(null as File | null);
        setVariations(newVariations);
    };

    const removeVariationValue = (variationIndex: number, valueIndex: number) => {
        const newVariations = [...variations];
        newVariations[variationIndex].values = newVariations[variationIndex].values.filter((_, i) => i !== valueIndex);
        newVariations[variationIndex].images = newVariations[variationIndex].images.filter((_, i) => i !== valueIndex);
        setVariations(newVariations);
    };

    const handleVariationImageUpload = (variationIndex: number, valueIndex: number, file: File) => {
        const newVariations = [...variations];
        newVariations[variationIndex].images[valueIndex] = file;
        setVariations(newVariations);
    };

    const addNewVariation = () => {
        setVariations(prev => [...prev, { type: '', values: [''], images: [null as File | null] }]);
    };

    const removeVariation = (variationIndex: number) => {
        setVariations(prev => prev.filter((_, i) => i !== variationIndex));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!productName || !productDescription || !productCategory || !productPrice || !stock || !weight || !coverImage) {
                const missingFields = [];
                if (!productName) missingFields.push('Product Name');
                if (!productDescription) missingFields.push('Product Description');
                if (!productCategory) missingFields.push('Category');
                if (!productPrice) missingFields.push('Price');
                if (!stock) missingFields.push('Stock');
                if (!weight) missingFields.push('Weight');
                if (!coverImage) missingFields.push('Cover Image');
                
                showToast(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
                setLoading(false);
                return;
            }

            const formData = new FormData();

            // Basic info
            formData.append('name', productName);
            formData.append('description', productDescription);
            formData.append('category', productCategory);
            formData.append('price', productPrice);
            formData.append('stock', stock);
            formData.append('weight', weight);
            
            // Optional fields
            if (sku) formData.append('sku', sku);
            if (barcode) formData.append('barcode', barcode);

            // Media
            if (coverImage) formData.append('cover_image', coverImage);
            additionalImages.forEach((image, index) => {
                formData.append(`images`, image);
            });
            if (productVideo) formData.append('video', productVideo);

            // What's Inside (only include non-empty items)
            const validWhatsInside = whatsInside.filter(item => item.trim() !== '');
            if (validWhatsInside.length > 0) {
                formData.append('whatsInside', JSON.stringify(validWhatsInside));
            }

            // Variants (only include if variants have data)
            const validVariants = variants.filter(v => v.name && v.values.some(val => val));
            if (validVariants.length > 0) {
                formData.append('variants', JSON.stringify(validVariants));
                
                // Variant combinations
                const validCombinations = variantCombinations.filter(combo => 
                    combo.options.length > 0 && combo.options.every(opt => opt.value)
                );
                if (validCombinations.length > 0) {
                    formData.append('variantCombinations', JSON.stringify(validCombinations));
                }
            }

            console.log('Submitting product with FormData:');
            
            // Check authentication token
            const token = localStorage.getItem('adminToken');
            console.log('Auth token exists:', !!token);
            console.log('Auth token length:', token?.length || 0);
            console.log('Auth token value:', token ? `${token.substring(0, 20)}...` : 'null');
            
            if (!token) {
                showToast('Please login to add products', 'error');
                setLoading(false);
                router.push('/admin/login');
                return;
            }
            
            // Log all FormData entries for debugging
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            const response = await createProduct(formData);

            console.log('API Response:', response);
            console.log('Response success:', response.success);
            console.log('Response data:', response.data);
            console.log('Response message:', response.message);
            console.log('Response error:', response.error);

            // Check multiple possible success indicators
            if (response.success || response.data || response.message) {
                showToast('Product created successfully!', 'success');
                
                // Clear form after successful creation
                setProductName('');
                setProductDescription('');
                setProductCategory('');
                setProductPrice('');
                setDiscountedPrice('');
                setStock('');
                setWeight('');
                setSku('');
                setBarcode('');
                setCoverImage(null);
                setCoverImagePreview('');
                setAdditionalImages([]);
                setAdditionalImagePreviews([]);
                setProductVideo(null);
                setProductStatus('in stock');
                setIsFeatured(false);
                setIsSpecialOffer(false);
                setIsTimedSpecialOffer(false);
                setSpecialOfferDate('');
                setSpecialOfferTime('');
                setWhatsInside(['']);
                setVariants([
                    { name: 'Color', values: [''] },
                    { name: 'Size', values: [''] }
                ]);
                setVariantCombinations([]);
                setSelectedCombinationIndex(0);
            } else {
                console.log('Product creation considered failed - no success indicators');
                showToast(response.error || 'Failed to create product', 'error');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            showToast(`Error creating product: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/30 font-poppins pr-5 pb-10">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-end mb-8">
                    {/* <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1> */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2 bg-brand_pink text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Adding...
                                </>
                            ) : (
                                'Publish Inventory'
                            )}
                        </button>
                    </div>
                </div>

                <form className='grid grid-cols-1 md:grid-cols-2 gap-6' onSubmit={handleSubmit}>
                <div className="space-y-8 bg-white rounded-xl border border-gray-200 p-6">
                    {/* Upload image */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Product Image
                        </label>
                        <div className="flex items-center gap-6">
                            {coverImagePreview ? (
                                <div className="relative w-32 h-32">
                                    <Image
                                        src={coverImagePreview}
                                        alt="Cover preview"
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCoverImage(null);
                                            setCoverImagePreview('');
                                        }}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-100 p-6 py-10 w-max gap-2">
                                    <Image src="/images/image.svg" alt="Upload" width={30} height={30} />
                                    <div className='flex items-center gap-1 text-brand_pink'>
                                        <UploadCloud size={18} />
                                        <span className="text-[10px] text-brand_pink">Upload Image (1 -5)</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className='col-span-2'>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter product description"
                                    required
                                />
                            </div>

                            <div className=''>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={productCategory}
                                        onChange={(e) => setProductCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {!loadingCategories && categories.map(category => (
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        ))}
                                        <option value="CREATE_NEW">+ Create New Category</option>
                                        {loadingCategories && (
                                            <option disabled>Loading categories...</option>
                                        )}
                                    </select>
                                </div>
                                
                                {/* Show category creation modal when "Create New Category" is selected */}
                                {productCategory === 'CREATE_NEW' && (
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800 mb-2">
                                            Click "Add new category" below to create a new category
                                        </p>
                                        <button 
                                            type='button' 
                                            className='flex items-center text-sm text-brand_pink bg-white px-3 py-2 rounded border border-brand_pink hover:bg-brand_pink hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed' 
                                            onClick={() => {
                                                setShowCategoryModal(true);
                                                setProductCategory(''); // Reset selection
                                            }}
                                            disabled={creatingCategory}
                                        >
                                            {creatingCategory ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-brand_pink border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="ml-1">Creating...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <PlusIcon size={16} />
                                                    <p className="ml-1">Create Category</p>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                
                                {/* Regular add category button */}
                                {productCategory !== 'CREATE_NEW' && (
                                    <button type='button' className='flex items-center mt-2 text-sm text-brand_pink' onClick={() => setShowCategoryModal(true)}>
                                        <PlusIcon size={20} />
                                        <p>Add new category</p>
                                    </button>
                                )}
                            </div>

                                {/* Category Creation Modal */}
                                {showCategoryModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">Create New Category</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCategoryModal(false)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Category Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Enter category name"
                                                        autoFocus
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Category Image (optional)
                                                    </label>
                                                    <div className="flex items-center gap-4">
                                                        {newCategoryImagePreview ? (
                                                            <div className="relative">
                                                                <Image
                                                                    src={newCategoryImagePreview}
                                                                    alt="Category preview"
                                                                    width={80}
                                                                    height={80}
                                                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setNewCategoryImage(null);
                                                                        setNewCategoryImagePreview('');
                                                                    }}
                                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                                <Upload className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex-1">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleCategoryImageChange}
                                                                className="hidden"
                                                                id="category-image-upload"
                                                            />
                                                            <label
                                                                htmlFor="category-image-upload"
                                                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                                            >
                                                                <Upload className="w-4 h-4" />
                                                                Choose Image
                                                            </label>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                JPG, PNG, GIF up to 10MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-3 pt-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowCategoryModal(false);
                                                            setNewCategoryName('');
                                                            setNewCategoryImage(null);
                                                            setNewCategoryImagePreview('');
                                                        }}
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCreateCategory}
                                                        disabled={creatingCategory}
                                                        className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {creatingCategory ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            'Create Category'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className=''>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        SKU (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={sku}
                                        onChange={(e) => setSku(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter SKU"
                                    />
                                </div>

                                <div className=''>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Barcode (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={barcode}
                                        onChange={(e) => setBarcode(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter barcode"
                                    />
                                </div>

                                <div className=''>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Tags / Label
                                    </label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add tags"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Base Price (₦)
                                    </label>
                                    <input
                                        type="number"
                                        value={productPrice}
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Discount Price (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={discountedPrice}
                                        onChange={(e) => setDiscountedPrice(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className='col-span-2'>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Product Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className='col-span-2'>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Weight (kg) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-sm text-gray-900 mb-6">Special Offer</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className='col-span-2 flex items-center gap-2'>
                                    <div className="flex items-center justify-between mb-2 gap-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isTimedSpecialOffer}
                                                onChange={(e) => setIsTimedSpecialOffer(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                                        </label>

                                        <label className="text-xs font-medium text-gray-700">
                                            Timed Special Offer
                                        </label>
                                    </div>
                                </div>

                                <div className='col-span-2'>
                                    <input type="date" name="date" id="date" />
                                </div>

                                <div className='col-span-2 flex items-center gap-2'>
                                    <div className="flex items-center justify-between mb-2 gap-6">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={showVariants}
                                                onChange={(e) => setShowVariants(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-pink-600"></div>
                                        </label>

                                        <label className="text-xs font-medium text-gray-700">
                                            Does this product have variations (Color, Size, etc.)?
                                        </label>
                                    </div>
                                </div>

                                {showVariants && (
                                    <>
                                        {variants.map((variant, variantIndex) => (
                                            <div key={variantIndex} className="col-span-2 space-y-4 p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <input
                                                        type="text"
                                                        value={variant.name}
                                                        onChange={(e) => updateVariant(variantIndex, 'name', e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2"
                                                        placeholder="Variant name (e.g., Color, Size)"
                                                    />
                                                    {variants.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(variantIndex)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-gray-700">Values</label>
                                                    {variant.values.map((value, valueIndex) => (
                                                        <div key={valueIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="text"
                                                                value={value}
                                                                onChange={(e) => {
                                                                    const newValues = [...variant.values];
                                                                    newValues[valueIndex] = e.target.value;
                                                                    updateVariant(variantIndex, 'values', newValues);
                                                                }}
                                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder={`Value ${valueIndex + 1}`}
                                                            />
                                                            {variant.values.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeVariantValue(variantIndex, valueIndex)}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addVariantValue(variantIndex)}
                                                        className="flex items-center gap-2 text-brand_pink text-sm hover:text-brand_pink/80"
                                                    >
                                                        <Plus size={16} />
                                                        Add value
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="flex items-center gap-2 text-brand_pink text-sm hover:text-brand_pink/80 col-span-2"
                                        >
                                            <Plus size={20} />
                                            Add new variant
                                        </button>

                                        {/* Variant Combinations - Dropdown Selection */}
                                        {variants.filter(v => v.name && v.values.some(val => val)).length > 0 && (
                                            <div className="col-span-2 space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <h3 className="text-sm font-medium text-gray-900">Variant Combinations</h3>
                                                
                                                {/* Combination Selector */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-700 mb-2 block">
                                                            Select Variant Combination
                                                        </label>
                                                        <select
                                                            value={selectedCombinationIndex}
                                                            onChange={(e) => setSelectedCombinationIndex(parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            {variantCombinations.map((combination, index) => (
                                                                <option key={index} value={index}>
                                                                    {combination.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="text-xs text-gray-500 flex items-end">
                                                        {variantCombinations.length} combination{variantCombinations.length !== 1 ? 's' : ''} available
                                                    </div>
                                                </div>
                                                
                                                {/* Selected Combination Details */}
                                                {variantCombinations[selectedCombinationIndex] && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                                        {/* Variant Display */}
                                                        <div className="md:col-span-1">
                                                            <label className="text-xs font-medium text-gray-700 mb-2 block">
                                                                Current Selection
                                                            </label>
                                                            <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded border">
                                                                {variantCombinations[selectedCombinationIndex].options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Stock */}
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                                Stock
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={variantCombinations[selectedCombinationIndex].stock}
                                                                onChange={(e) => updateVariantCombination(selectedCombinationIndex, 'stock', parseInt(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="0"
                                                                min="0"
                                                            />
                                                        </div>
                                                        
                                                        {/* Additional Price */}
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                                Additional Price (₦)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={variantCombinations[selectedCombinationIndex].additionalPrice}
                                                                onChange={(e) => updateVariantCombination(selectedCombinationIndex, 'additionalPrice', parseInt(e.target.value) || 0)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                placeholder="0"
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Summary of all combinations */}
                                                <div className="mt-4">
                                                    <details className="text-xs text-gray-600">
                                                        <summary className="cursor-pointer hover:text-gray-800 font-medium">
                                                            View all combinations summary
                                                        </summary>
                                                        <div className="mt-2 space-y-1">
                                                            {variantCombinations.map((combination, index) => (
                                                                <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                                                                    <span>{combination.options.map(opt => `${opt.name}: ${opt.value}`).join(', ')}</span>
                                                                    <span className="font-medium">
                                                                        Stock: {combination.stock} | Price: +₦{combination.additionalPrice}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                </div>
                                                
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Select a combination from the dropdown to set its stock and additional price.
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default AddProductPage;