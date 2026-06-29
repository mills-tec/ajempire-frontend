"use client";

import { createCategory, createProduct, getAllCategories } from '@/lib/adminapi';
import { AlertCircle, CheckCircle, Film, Info, Plus, PlusIcon, Trash2, Upload, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
};

const TOAST_BG: Record<ToastType, string> = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
};

const Toast = ({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) => (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border ${TOAST_BG[type]} shadow-lg max-w-md`}>
        {TOAST_ICONS[type]}
        <span className="text-sm text-gray-800">{message}</span>
        <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
        </button>
    </div>
);

// ─── Toggle ───────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600" />
    </label>
);

// ─── Section card ─────────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {title && <h2 className="text-sm font-semibold text-gray-900">{title}</h2>}
        {children}
    </div>
);

// ─── Media preview card ───────────────────────────────────────────────────────

interface PreviewCardProps {
    src: string;
    name: string;
    onRemove: () => void;
}

const PreviewCard = ({ src, name, onRemove }: PreviewCardProps) => (
    <div className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
        <Image src={src} alt={name} fill className="object-cover" />
        <button
            type="button"
            onClick={onRemove}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            title={`Remove ${name}`}
        >
            <X size={16} className="text-white" />
        </button>
        <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] truncate px-1 py-0.5">
            {name}
        </span>
    </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AddProductPage = () => {
    const router = useRouter();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [showVariants, setShowVariants] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // ── Category state ────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
    const [newCategoryImagePreview, setNewCategoryImagePreview] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    // ── Product fields ────────────────────────────────────────────────────────
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [stock, setStock] = useState('');
    const [weight, setWeight] = useState('');
    const [sku, setSku] = useState('');
    const [barcode, setBarcode] = useState('');
    const [isReturnable, setIsReturnable] = useState(true);
    const [isTimedSpecialOffer, setIsTimedSpecialOffer] = useState(false);
    const [specialOfferDate, setSpecialOfferDate] = useState('');
    const [specialOfferTime, setSpecialOfferTime] = useState('');
    const [whatsInside, setWhatsInside] = useState(['']);

    // ── Media state ───────────────────────────────────────────────────────────
    // Cover image
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState('');

    // Additional images — each entry holds the File and its data-URL preview
    const [additionalImages, setAdditionalImages] = useState<{ file: File; preview: string }[]>([]);

    // Video
    const [productVideo, setProductVideo] = useState<File | null>(null);

    // ── Variants ──────────────────────────────────────────────────────────────
    const [variants, setVariants] = useState([
        { name: 'color', values: [''] },
        { name: 'size', values: [''] },
    ]);
    const [selectedCombinationIndex, setSelectedCombinationIndex] = useState(0);
    const [variantCombinations, setVariantCombinations] = useState([
        { options: [{ name: 'color', value: '' }, { name: 'size', value: '' }], stock: 0, additionalPrice: 0 },
    ]);

    // ── Toast helper ──────────────────────────────────────────────────────────
    const showToast = useCallback((message: string, type: ToastType) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    // ── Data fetching ─────────────────────────────────────────────────────────
    const fetchCategories = useCallback(async () => {
        try {
            const response = await getAllCategories();
            const data = response.data ?? (Array.isArray(response.message) ? response.message : null);
            if (data) {
                setCategories(data);
            } else {
                showToast('Failed to load categories', 'error');
            }
        } catch {
            showToast('Error loading categories', 'error');
        } finally {
            setLoadingCategories(false);
        }
    }, [showToast]);

    React.useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            showToast('Please login to access this page', 'error');
            router.push('/admin/login');
            return;
        }
        fetchCategories();
    }, [fetchCategories, router, showToast]);

    // ── Category creation ─────────────────────────────────────────────────────
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) { showToast('Please enter a category name', 'error'); return; }
        setCreatingCategory(true);
        try {
            const fd = new FormData();
            fd.append('name', newCategoryName.trim());
            if (newCategoryImage) fd.append('image', newCategoryImage);

            const response = await createCategory(fd);
            if (response.success || response.data) {
                showToast('Category created successfully!', 'success');
                await fetchCategories();
                setNewCategoryName('');
                setNewCategoryImage(null);
                setNewCategoryImagePreview('');
                setShowCategoryModal(false);
            } else {
                showToast(response.error ?? 'Failed to create category', 'error');
            }
        } catch {
            showToast('Error creating category', 'error');
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewCategoryImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setNewCategoryImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    // ── Cover image ───────────────────────────────────────────────────────────
    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverImage(file);
        const reader = new FileReader();
        reader.onloadend = () => setCoverImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    // ── Additional images ─────────────────────────────────────────────────────
    //
    // Accepts multiple files. Previews are generated via FileReader so the user
    // sees thumbnails immediately. Files are stored alongside their previews so
    // they can be individually removed before submission.
    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdditionalImages(prev => [...prev, { file, preview: reader.result as string }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset the input so the same file can be re-selected if removed and re-added
        e.target.value = '';
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    // ── Video ─────────────────────────────────────────────────────────────────
    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setProductVideo(file);
        e.target.value = '';
    };

    const removeVideo = () => setProductVideo(null);

    // ── Variant helpers ───────────────────────────────────────────────────────
    const updateVariantCombinationsStructure = (currentVariants: typeof variants) => {
        const valid = currentVariants.filter(v => v.name && v.values.some(val => val));
        if (!valid.length) { setVariantCombinations([]); return; }

        const combos: typeof variantCombinations = [];
        const gen = (idx: number, current: { name: string; value: string }[]) => {
            if (idx >= valid.length) { combos.push({ options: [...current], stock: 0, additionalPrice: 0 }); return; }
            valid[idx].values.filter(v => v).forEach(v => gen(idx + 1, [...current, { name: valid[idx].name, value: v }]));
        };
        gen(0, []);

        setVariantCombinations(combos.map(nc => {
            const existing = variantCombinations.find(ex =>
                JSON.stringify(ex.options.sort((a, b) => a.name.localeCompare(b.name))) ===
                JSON.stringify(nc.options.sort((a, b) => a.name.localeCompare(b.name)))
            );
            return existing ?? nc;
        }));
    };

    const updateVariant = (vi: number, field: 'name' | 'values', value: string | string[]) => {
        const nv = [...variants];
        if (field === 'name') nv[vi].name = value as string;
        else nv[vi].values = value as string[];
        setVariants(nv);
        updateVariantCombinationsStructure(nv);
    };

    const addVariantValue = (vi: number) => {
        const nv = [...variants];
        nv[vi].values.push('');
        setVariants(nv);
        updateVariantCombinationsStructure(nv);
    };

    const removeVariantValue = (vi: number, vali: number) => {
        const nv = [...variants];
        nv[vi].values = nv[vi].values.filter((_, i) => i !== vali);
        setVariants(nv);
        updateVariantCombinationsStructure(nv);
    };

    const addVariant = () => setVariants(prev => { const nv = [...prev, { name: '', values: [''] }]; updateVariantCombinationsStructure(nv); return nv; });

    const removeVariant = (vi: number) => {
        const nv = variants.filter((_, i) => i !== vi);
        setVariants(nv);
        updateVariantCombinationsStructure(nv);
    };

    const updateVariantCombination = (ci: number, field: 'stock' | 'additionalPrice', value: number) => {
        const nc = [...variantCombinations];
        nc[ci][field] = value;
        setVariantCombinations(nc);
    };

    // ── Form submission ───────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const missing: string[] = [];
            if (!productName) missing.push('Product Name');
            if (!productDescription) missing.push('Description');
            if (!productCategory) missing.push('Category');
            if (!productPrice) missing.push('Price');
            if (!showVariants && !stock) missing.push('Stock');
            if (!weight) missing.push('Weight');
            if (!coverImage) missing.push('Cover Image');

            if (missing.length) {
                showToast(`Please fill in: ${missing.join(', ')}`, 'error');
                return;
            }

            const fd = new FormData();
            fd.append('name', productName);
            fd.append('description', productDescription);
            fd.append('category', productCategory);
            fd.append('price', productPrice);
            fd.append('stock', stock);
            fd.append('weight', weight);
            fd.append('isReturnable', String(isReturnable));
            fd.append('isTimedSpecialOffer', String(isTimedSpecialOffer));
            if (isTimedSpecialOffer) {
                if (specialOfferDate) fd.append('specialOfferDate', specialOfferDate);
                if (specialOfferTime) fd.append('specialOfferTime', specialOfferTime);
            }
            if (sku) fd.append('sku', sku);
            if (barcode) fd.append('barcode', barcode);

            // Cover image
            fd.append('cover_image', coverImage!);

            // Additional images — each appended under the same key "images"
            additionalImages.forEach(({ file }) => fd.append('images', file));

            // Video
            if (productVideo) fd.append('video', productVideo);

            // What's inside
            const validInside = whatsInside.filter(i => i.trim());
            if (validInside.length) fd.append('whatsInside', JSON.stringify(validInside));

            // Variants
            const validVariants = variants.filter(v => v.name && v.values.some(val => val));
            if (validVariants.length) {
                fd.append('variants', JSON.stringify(validVariants));
                const validCombos = variantCombinations.filter(c => c.options.every(o => o.value));
                if (validCombos.length) fd.append('variantCombinations', JSON.stringify(validCombos));
            }

            const response = await createProduct(fd);
            if (response.status) {
                showToast('Product created successfully!', 'success');
                // Reset all fields
                setProductName(''); setProductDescription(''); setProductCategory('');
                setProductPrice(''); setStock(''); setWeight(''); setSku(''); setBarcode('');
                setCoverImage(null); setCoverImagePreview('');
                setAdditionalImages([]);
                setProductVideo(null);
                setIsReturnable(true); setIsTimedSpecialOffer(false);
                setSpecialOfferDate(''); setSpecialOfferTime('');
                setWhatsInside(['']);
                setVariants([{ name: 'color', values: [''] }, { name: 'size', values: [''] }]);
                setVariantCombinations([]);
                setSelectedCombinationIndex(0);
            } else {
                   showToast(response.error ?? 'Failed to create product', 'error');
            }
            
        } catch (error) {
            showToast(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50/30 font-poppins pr-5 pb-10">
            <div className="mx-auto">
                {/* Header */}
                <div className="flex items-center justify-end mb-8">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Adding...
                            </>
                        ) : 'Publish Inventory'}
                    </button>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

                    {/* ── Left column ─────────────────────────────────────── */}
                    <div className="space-y-6">
                        <Section title="">
                            {/* Cover image */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Cover Image <span className="text-red-500">*</span>
                                </label>
                                {coverImagePreview ? (
                                    <div className="relative w-32 h-32">
                                        <Image src={coverImagePreview} alt="Cover preview" fill className="object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => { setCoverImage(null); setCoverImagePreview(''); }}
                                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-100 p-6 py-10 w-max gap-2">
                                        <Image src="/images/image.svg" alt="Upload" width={30} height={30} />
                                        <div className="flex items-center gap-1 text-brand_pink">
                                            <UploadCloud size={18} />
                                            <span className="text-[10px]">Upload Cover Image</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                                    </label>
                                )}
                            </div>

                            {/* ── Additional images ──────────────────────── */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Additional Images
                                    <span className="ml-1 text-gray-400 font-normal">(up to 10)</span>
                                </label>

                                {/* Scrollable preview strip */}
                                {additionalImages.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        {additionalImages.map(({ file, preview }, idx) => (
                                            <PreviewCard
                                                key={`${file.name}-${idx}`}
                                                src={preview}
                                                name={file.name}
                                                onRemove={() => removeAdditionalImage(idx)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Upload button — always visible so user can keep adding */}
                                <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-600 ${additionalImages.length >= 10 ? 'opacity-40 pointer-events-none' : ''}`}>
                                    <Plus size={16} className="text-brand_pink" />
                                    {additionalImages.length === 0 ? 'Add images' : 'Add more'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAdditionalImagesChange}
                                        className="hidden"
                                        disabled={additionalImages.length >= 10}
                                    />
                                </label>

                                {additionalImages.length > 0 && (
                                    <p className="mt-1 text-xs text-gray-400">
                                        {additionalImages.length} / 10 image{additionalImages.length !== 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* ── Video ──────────────────────────────────── */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Product Video
                                    <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                                </label>

                                {productVideo ? (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="shrink-0 w-10 h-10 rounded-lg bg-brand_pink/10 flex items-center justify-center">
                                            <Film size={18} className="text-brand_pink" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate">{productVideo.name}</p>
                                            <p className="text-xs text-gray-400">
                                                {(productVideo.size / (1024 * 1024)).toFixed(1)} MB
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeVideo}
                                            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Remove video"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-600">
                                        <Film size={16} className="text-brand_pink" />
                                        Upload video
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}

                                <p className="mt-1 text-xs text-gray-400">MP4, MOV, WebM · max 100 MB</p>
                            </div>
                        </Section>

                        {/* Product fields */}
                        <Section title="">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                                    <input type="text" value={productName} onChange={e => setProductName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter product name" required />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                                    <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter product description" required />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                                    <select value={productCategory} onChange={e => setProductCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                                        <option value="">Select category</option>
                                        {!loadingCategories && categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        <option value="CREATE_NEW">+ Create New Category</option>
                                        {loadingCategories && <option disabled>Loading…</option>}
                                    </select>

                                    {productCategory === 'CREATE_NEW' ? (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-800 mb-2">Click below to create a new category</p>
                                            <button type="button" className="flex items-center text-sm text-brand_pink bg-white px-3 py-2 rounded border border-brand_pink hover:bg-brand_pink hover:text-white transition-colors" onClick={() => { setShowCategoryModal(true); setProductCategory(''); }}>
                                                <PlusIcon size={16} /><span className="ml-1">Create Category</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button type="button" className="flex items-center mt-2 text-sm text-brand_pink" onClick={() => setShowCategoryModal(true)}>
                                            <PlusIcon size={20} /><span>Add new category</span>
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">SKU (optional)</label>
                                    <input type="text" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter SKU" />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Barcode (optional)</label>
                                    <input type="text" value={barcode} onChange={e => setBarcode(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter barcode" />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Base Price (₦) <span className="text-red-500">*</span></label>
                                    <input type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0.00" required />
                                </div>

                                {!showVariants && (
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-2">Product Quantity <span className="text-red-500">*</span></label>
                                        <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0" required />
                                    </div>
                                )}

                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Weight (kg) <span className="text-red-500">*</span></label>
                                    <input type="number" step="0.01" min="0" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="0.00" required />
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* ── Right column ─────────────────────────────────────── */}
                    <div className="space-y-6">
                        {/* Product Policy */}
                        <Section title="Product Policy">
                            <div className="flex items-center justify-between gap-6">
                                <label className="text-xs font-medium text-gray-700">Is this product returnable?</label>
                                <Toggle checked={isReturnable} onChange={setIsReturnable} />
                            </div>
                        </Section>

                        {/* Special Offer + Variants */}
                        <Section title="Special Offer">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2 flex items-center gap-4">
                                    <Toggle checked={isTimedSpecialOffer} onChange={setIsTimedSpecialOffer} />
                                    <label className="text-xs font-medium text-gray-700">Timed Special Offer</label>
                                </div>

                                {isTimedSpecialOffer && (
                                    <div className="col-span-2 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Expiry Date</label>
                                            <input type="date" value={specialOfferDate} onChange={e => setSpecialOfferDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-2">Expiry Time</label>
                                            <input type="time" value={specialOfferTime} onChange={e => setSpecialOfferTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                        </div>
                                    </div>
                                )}

                                <div className="col-span-2 flex items-center gap-4">
                                    <Toggle checked={showVariants} onChange={setShowVariants} />
                                    <label className="text-xs font-medium text-gray-700">Does this product have variations (Color, Size, etc.)?</label>
                                </div>

                                {showVariants && (
                                    <>
                                        {variants.map((variant, vi) => (
                                            <div key={vi} className="col-span-2 space-y-4 p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <input type="text" value={variant.name} onChange={e => updateVariant(vi, 'name', e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Variant name (e.g., Color, Size)" />
                                                    {variants.length > 1 && (
                                                        <button type="button" onClick={() => removeVariant(vi)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-gray-700">Values</label>
                                                    {variant.values.map((val, vali) => (
                                                        <div key={vali} className="flex items-center gap-2">
                                                            <input type="text" value={val} onChange={e => { const nv = [...variant.values]; nv[vali] = e.target.value; updateVariant(vi, 'values', nv); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder={`Value ${vali + 1}`} />
                                                            {variant.values.length > 1 && (
                                                                <button type="button" onClick={() => removeVariantValue(vi, vali)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addVariantValue(vi)} className="flex items-center gap-2 text-brand_pink text-sm hover:text-brand_pink/80"><Plus size={16} />Add value</button>
                                                </div>
                                            </div>
                                        ))}

                                        <button type="button" onClick={addVariant} className="col-span-2 flex items-center gap-2 text-brand_pink text-sm hover:text-brand_pink/80"><Plus size={20} />Add new variant</button>

                                        {variantCombinations.length > 0 && (
                                            <div className="col-span-2 space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                <h3 className="text-sm font-medium text-gray-900">Variant Combinations</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Select Combination</label>
                                                        <select value={selectedCombinationIndex} onChange={e => setSelectedCombinationIndex(parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                                            {variantCombinations.map((c, i) => <option key={i} value={i}>{c.options.map(o => `${o.name}: ${o.value}`).join(', ')}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-end">{variantCombinations.length} combination{variantCombinations.length !== 1 ? 's' : ''}</div>
                                                </div>

                                                {variantCombinations[selectedCombinationIndex] && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Selection</label>
                                                            <div className="text-sm text-gray-900 font-medium bg-gray-50 p-3 rounded border">{variantCombinations[selectedCombinationIndex].options.map(o => `${o.name}: ${o.value}`).join(', ')}</div>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-700 mb-1 block">Stock</label>
                                                            <input type="number" value={variantCombinations[selectedCombinationIndex].stock || ''} onChange={e => updateVariantCombination(selectedCombinationIndex, 'stock', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" placeholder="0" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-medium text-gray-700 mb-1 block">Additional Price (₦)</label>
                                                            <input type="number" value={variantCombinations[selectedCombinationIndex].additionalPrice || ''} onChange={e => updateVariantCombination(selectedCombinationIndex, 'additionalPrice', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" placeholder="0" />
                                                        </div>
                                                    </div>
                                                )}

                                                <details className="text-xs text-gray-600">
                                                    <summary className="cursor-pointer hover:text-gray-800 font-medium">View all combinations</summary>
                                                    <div className="mt-2 space-y-1">
                                                        {variantCombinations.map((c, i) => (
                                                            <div key={i} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                                                                <span>{c.options.map(o => `${o.name}: ${o.value}`).join(', ')}</span>
                                                                <span className="font-medium">Stock: {c.stock} | +₦{c.additionalPrice}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </Section>
                    </div>
                </form>
            </div>

            {/* ── Category creation modal ──────────────────────────────────── */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Create New Category</h3>
                            <button type="button" onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter category name" autoFocus />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image (optional)</label>
                                <div className="flex items-center gap-4">
                                    {newCategoryImagePreview ? (
                                        <div className="relative">
                                            <Image src={newCategoryImagePreview} alt="Preview" width={80} height={80} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => { setNewCategoryImage(null); setNewCategoryImagePreview(''); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"><Upload className="w-6 h-6 text-gray-400" /></div>
                                    )}
                                    <div className="flex-1">
                                        <input type="file" accept="image/*" onChange={handleCategoryImageChange} className="hidden" id="cat-img" />
                                        <label htmlFor="cat-img" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"><Upload className="w-4 h-4" />Choose Image</label>
                                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 10 MB</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); setNewCategoryImage(null); setNewCategoryImagePreview(''); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="button" onClick={handleCreateCategory} disabled={creatingCategory} className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {creatingCategory ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</>) : 'Create Category'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AddProductPage;