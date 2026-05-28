'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, SquarePen, Megaphone, Plus, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getPromotions, createPromotion, updatePromotion, deletePromotion, getAllCategories, getProducts } from '@/lib/adminapi';

const PromotionsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [promotionFilter, setPromotionFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promotionType: 'flashsale',
    discountType: 'percent',
    discountValue: 0,
    applyTo: 'product',
    applyToId: [] as string[],
    banner: '',
    startDate: '',
    endDate: '',
    couponCode: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    if (!showFilterDropdown) return;
    const handleClose = () => setShowFilterDropdown(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [showFilterDropdown]);

  const toggleFilterDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFilterDropdown(!showFilterDropdown);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleViewClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setShowViewModal(true);
  };

  const getAppliedNames = () => {
    if (!selectedPromotion || !selectedPromotion.applyToId || selectedPromotion.applyToId.length === 0) return 'None';
    if (selectedPromotion.applyTo === 'product') {
      return selectedPromotion.applyToId.map((id: string) => {
        const prod = products.find(p => (p._id || p.id) === id);
        return prod?.name || prod?.title || id;
      }).join(', ');
    } else if (selectedPromotion.applyTo === 'category') {
      return selectedPromotion.applyToId.map((id: string) => {
        const cat = categories.find(c => (c._id || c.id) === id);
        return cat?.name || id;
      }).join(', ');
    }
    return 'All Products';
  };

  // Fetch promotions from server
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getPromotions();
      console.log('Promotions response:', response);
      if (response.message && Array.isArray(response.message)) {
        setPromotions(response.message);
      } else if (response.data && Array.isArray(response.data)) {
        setPromotions(response.data);
      } else if (Array.isArray(response)) {
        setPromotions(response);
      } else {
        setPromotions([]);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from server
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      console.log('Categories response:', response);
      if (response.message && Array.isArray(response.message)) {
        setCategories(response.message);
      } else if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch products from server
  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      console.log('Products response:', response);
      const productsData = response.message as any;
      if (productsData && productsData.products && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      } else if (response.message && Array.isArray(response.message)) {
        setProducts(response.message);
      } else if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else if (Array.isArray(response)) {
        setProducts(response);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchPromotions();
    fetchCategories();
    fetchProducts();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-500 border-green-100';
      case 'Scheduled': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Completed': return 'bg-gray-50 text-gray-500 border-gray-100';
      case 'Paused': return 'bg-yellow-50 text-yellow-500 border-yellow-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Reset applyToId when applyTo changes to 'all'
    if (name === 'applyTo' && value === 'all') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        applyToId: []
      }));
    } else if (name === 'promotionType' && value === 'flashsale') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        couponCode: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle add promotion
  const handleAddClick = () => {
    setFormData({
      title: '',
      description: '',
      promotionType: 'flashsale',
      discountType: 'percent',
      discountValue: 0,
      applyTo: 'product',
      applyToId: [],
      banner: '',
      startDate: '',
      endDate: '',
      couponCode: ''
    });
    setBannerFile(null);
    setError(null);
    setShowAddModal(true);
  };

  // Handle edit promotion
  const handleEditClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setFormData({
      title: promotion.title || '',
      description: promotion.description || '',
      promotionType: promotion.promotionType || 'flashsale',
      discountType: promotion.discountType || 'percent',
      discountValue: promotion.discountValue || 0,
      applyTo: promotion.applyTo || 'product',
      applyToId: promotion.applyToId || [],
      banner: promotion.banner || '',
      startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
      endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
      couponCode: promotion.couponCode || ''
    });
    setBannerFile(null);
    setError(null);
    setShowEditModal(true);
  };

  // Handle delete promotion
  const handleDeleteClick = (promotion: any) => {
    setSelectedPromotion(promotion);
    setShowDeleteModal(true);
  };

  // Handle form submit (create)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('promotionType', formData.promotionType);
      payload.append('discountType', formData.discountType);
      payload.append('discountValue', String(formData.discountValue));
      payload.append('applyTo', formData.applyTo);

      if (formData.applyToId && formData.applyToId.length > 0) {
        formData.applyToId.forEach(id => {
          payload.append('applyToId', id);
        });
      }

      if (bannerFile) {
        payload.append('banner', bannerFile);
      } else if (formData.banner) {
        payload.append('banner', formData.banner);
      }

      if (formData.startDate) {
        payload.append('startDate', new Date(formData.startDate).toISOString());
      }
      if (formData.endDate) {
        payload.append('endDate', new Date(formData.endDate).toISOString());
      }
      if (formData.promotionType === 'coupon') {
        if (formData.couponCode) {
          payload.append('couponCode', formData.couponCode);
        }
      } else {
        payload.append('couponCode', '');
      }

      const response = await createPromotion(payload);
      if (response.message) {
        setShowAddModal(false);
        fetchPromotions();
        setFormData({
          title: '',
          description: '',
          promotionType: 'flashsale',
          discountType: 'percent',
          discountValue: 0,
          applyTo: 'product',
          applyToId: [],
          banner: '',
          startDate: '',
          endDate: '',
          couponCode: ''
        });
        setBannerFile(null);
      } else {
        setError(response.error || 'Failed to create promotion');
      }
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPromotion?._id) return;

    setLoading(true);
    setError(null);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('promotionType', formData.promotionType);
      payload.append('discountType', formData.discountType);
      payload.append('discountValue', String(formData.discountValue));
      payload.append('applyTo', formData.applyTo);

      if (formData.applyToId && formData.applyToId.length > 0) {
        formData.applyToId.forEach(id => {
          payload.append('applyToId', id);
        });
      }

      if (bannerFile) {
        payload.append('banner', bannerFile);
      } else if (formData.banner) {
        payload.append('banner', formData.banner);
      }

      if (formData.startDate) {
        payload.append('startDate', new Date(formData.startDate).toISOString());
      }
      if (formData.endDate) {
        payload.append('endDate', new Date(formData.endDate).toISOString());
      }
      if (formData.promotionType === 'coupon') {
        if (formData.couponCode) {
          payload.append('couponCode', formData.couponCode);
        }
      } else {
        payload.append('couponCode', '');
      }

      const response = await updatePromotion(selectedPromotion._id, payload);
      if (response.message) {
        setShowEditModal(false);
        fetchPromotions();
        setSelectedPromotion(null);
        setBannerFile(null);
      } else {
        setError(response.error || 'Failed to update promotion');
      }
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!selectedPromotion?._id) return;

    setLoading(true);

    try {
      const response = await deletePromotion(selectedPromotion._id);
      if (response.message) {
        setShowDeleteModal(false);
        fetchPromotions();
        setSelectedPromotion(null);
      } else {
        setError(response.error || 'Failed to delete promotion');
      }
    } catch (error: any) {
      console.error('Error deleting promotion:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Filter promotions based on search and status/type filters
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = !searchTerm ||
      promotion.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.promotionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.couponCode?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (promotionFilter === 'active') {
      return promotion.status?.toLowerCase() === 'active';
    }
    if (promotionFilter === 'scheduled') {
      return promotion.status?.toLowerCase() === 'scheduled';
    }
    if (promotionFilter === 'expired') {
      return promotion.status?.toLowerCase() === 'expired';
    }
    if (promotionFilter === 'flashsale') {
      return promotion.promotionType?.toLowerCase() === 'flashsale';
    }
    if (promotionFilter === 'coupon') {
      return promotion.promotionType?.toLowerCase() === 'coupon';
    }

    return true;
  });

  // Calculate promotion statistics
  const calculateStats = () => {
    const now = new Date();
    const stats = {
      active: 0,
      upcoming: 0,
      expired: 0,
      totalDiscountValue: 0,
      hasPercentageDiscount: false,
      hasFixedDiscount: false
    };

    promotions.forEach(promotion => {
      const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
      const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
      const status = promotion.status?.toLowerCase();

      // Determine promotion status based on dates or explicit status
      if (status === 'expired' || (endDate && endDate < now)) {
        stats.expired++;
      } else if (status === 'active' || (startDate && startDate <= now && endDate && endDate >= now)) {
        stats.active++;
        // Track discount types and add discount value for active promotions
        if (promotion.discountValue) {
          if (promotion.discountType === 'percent') {
            stats.hasPercentageDiscount = true;
            stats.totalDiscountValue += promotion.discountValue;
          } else {
            stats.hasFixedDiscount = true;
            stats.totalDiscountValue += promotion.discountValue;
          }
        }
      } else if (status === 'scheduled' || (startDate && startDate > now)) {
        stats.upcoming++;
      } else {
        // Default logic if no explicit status
        if (!startDate && !endDate) {
          stats.active++; // Assume active if no dates
          if (promotion.discountValue) {
            if (promotion.discountType === 'percent') {
              stats.hasPercentageDiscount = true;
              stats.totalDiscountValue += promotion.discountValue;
            } else {
              stats.hasFixedDiscount = true;
              stats.totalDiscountValue += promotion.discountValue;
            }
          }
        } else if (startDate && startDate > now) {
          stats.upcoming++;
        } else if (endDate && endDate < now) {
          stats.expired++;
        } else {
          stats.active++;
          if (promotion.discountValue) {
            if (promotion.discountType === 'percent') {
              stats.hasPercentageDiscount = true;
              stats.totalDiscountValue += promotion.discountValue;
            } else {
              stats.hasFixedDiscount = true;
              stats.totalDiscountValue += promotion.discountValue;
            }
          }
        }
      }
    });

    return stats;
  };

  const stats = calculateStats();

  return (
    <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between">
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <Megaphone size={20} className="text-brand_pink" />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Active Promotions</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.active}</h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div> */}
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Upcoming Promotions</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.upcoming}</h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.upcoming}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <Megaphone size={20} className="text-brand_pink" />
              </div>

              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>

            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Total Discount Value</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">
                  {stats.totalDiscountValue > 0 ? (
                    <>
                      {stats.totalDiscountValue}
                      <span className="text-sm font-normal ml-1">
                        {stats.hasPercentageDiscount && stats.hasFixedDiscount
                          ? 'mixed'
                          : stats.hasPercentageDiscount
                            ? '%'
                            : '₦'}
                      </span>
                    </>
                  ) : '0'}
                </h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-brand_gray_dark">{stats.totalDiscountValue}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div> */}
              </div>

              <div className="text-left">
                <p className="text-red-500 text-xs font-medium mb-1">Expired Promotions</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.expired}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-10 mt-10 relative z-20">
        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50 rounded-t-2xl">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors" />
            <input
              type="text"
              placeholder="Search Promotion"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleAddClick}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand_pink hover:bg-brand_pink/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md active:scale-95"
            >
              <Plus size={16} />
              Add Promotion
            </button>
            <div className="flex items-center gap-3 w-full md:w-auto relative z-30">
              <button
                onClick={toggleFilterDropdown}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${promotionFilter !== 'all'
                  ? 'bg-brand_pink/10 border-brand_pink/30 text-brand_pink'
                  : 'bg-gray-50 border-gray-100 text-brand_gray_dark hover:bg-gray-100'
                  }`}
              >
                <Filter size={16} />
                {promotionFilter === 'all' && 'Filter'}
                {promotionFilter === 'active' && 'Active'}
                {promotionFilter === 'scheduled' && 'Scheduled'}
                {promotionFilter === 'expired' && 'Expired'}
                {promotionFilter === 'flashsale' && 'Flash Sale'}
                {promotionFilter === 'coupon' && 'Coupon'}
              </button>

              {showFilterDropdown && (
                <div
                  onClick={handleDropdownClick}
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Filter by Status
                  </div>
                  <button
                    onClick={() => { setPromotionFilter('all'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${promotionFilter === 'all' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                  >
                    All Promotions
                  </button>
                  <button
                    onClick={() => { setPromotionFilter('active'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${promotionFilter === 'active' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => { setPromotionFilter('scheduled'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${promotionFilter === 'scheduled' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                  >
                    Scheduled / Upcoming
                  </button>
                  <button
                    onClick={() => { setPromotionFilter('expired'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${promotionFilter === 'expired' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                  >
                    Expired
                  </button>

                  <div className="h-px bg-gray-100 my-1"></div>

                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Filter by Type
                  </div>
                  <button
                    onClick={() => { setPromotionFilter('flashsale'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${promotionFilter === 'flashsale' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                  >
                    Flash Sales
                  </button>
                  <button
                    onClick={() => { setPromotionFilter('coupon'); setShowFilterDropdown(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${promotionFilter === 'coupon' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                  >
                    Coupons
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Campaign Name</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Start Date</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">End Date</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Discount Type</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {searchTerm || promotionFilter !== 'all' ? 'No promotions found matching your filters.' : 'No promotions found.'}
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promotion, idx) => (
                  <tr 
                    key={promotion._id || idx} 
                    onClick={() => handleViewClick(promotion)}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm text-brand_gray_dark">{promotion.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-brand_gray_dark/80">{promotion.promotionType}</td>
                    <td className="p-4 text-sm text-brand_gray_dark/80">
                      {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-sm text-brand_gray_dark/80">
                      {promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(promotion.status)}`}>
                        {promotion.status || 'inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-brand_gray_dark/80">
                      {promotion.discountType === 'percent' ? `${promotion.discountValue}% OFF` :
                        promotion.discountType === 'fixed' ? `₦${promotion.discountValue.toLocaleString()} OFF` :
                          promotion.discountType || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(promotion); }}
                          className="text-brand_gray hover:text-brand_pink transition-colors"
                          title="Edit Promotion"
                        >
                          <SquarePen size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(promotion); }}
                          className="text-brand_gray hover:text-red-500 transition-colors"
                          title="Delete Promotion"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewClick(promotion); }}
                          className="text-brand_gray hover:text-blue-500 transition-colors"
                          title="View Promotion"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/20 rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>8</option>
                <option>16</option>
                <option>32</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">Items per page</span>
            </div>
            <span className="text-xs text-brand_gray font-medium">
              {filteredPromotions.length > 0 ? `1-${filteredPromotions.length} of ${filteredPromotions.length} items` : '0 items'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>1</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">
                of 1 pages
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Add Promotion Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New Promotion</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X size={12} className="text-white" />
                    </div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Name</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      placeholder="Enter promotion name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      name="promotionType"
                      value={formData.promotionType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    >
                      <option value="flashsale">Flash Sale</option>
                      <option value="coupon">Coupon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    placeholder="Enter promotion description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                  >
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      placeholder="Enter discount value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
                    <select
                      name="applyTo"
                      value={formData.applyTo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    >
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                      <option value="all">All Products</option>
                    </select>
                  </div>
                </div>

                {formData.applyTo !== 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.applyTo === 'product' ? 'Select Products' : 'Select Categories'}
                    </label>
                    <div className="text-xs text-red-500 mb-2">
                      Debug: applyTo={formData.applyTo}, products={products.length}, categories={categories.length}
                    </div>
                    <select
                      multiple
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      value={formData.applyToId}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        console.log('Selected options:', selectedOptions);
                        setFormData(prev => ({
                          ...prev,
                          applyToId: selectedOptions
                        }));
                      }}
                      size={4}
                    >
                      {formData.applyTo === 'product' && products.length > 0 ? (
                        products.map(product => (
                          <option key={product._id || product.id} value={product._id || product.id}>
                            {product.name || product.title || 'Unnamed Product'}
                          </option>
                        ))
                      ) : formData.applyTo === 'category' && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category._id || category.id} value={category._id || category.id}>
                            {category.name || 'Unnamed Category'}
                          </option>
                        ))
                      ) : (
                        <option value="">No {formData.applyTo === 'product' ? 'products' : 'categories'} available</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple items
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand_pink/10 file:text-brand_pink hover:file:bg-brand_pink/20"
                  />
                  {(bannerFile || formData.banner) && (
                    <div className="mt-3 relative w-32 h-20 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={bannerFile ? URL.createObjectURL(bannerFile) : formData.banner}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerFile(null);
                          setFormData(prev => ({ ...prev, banner: '' }));
                        }}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {formData.promotionType === 'coupon' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      placeholder="Optional: Enter coupon code"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Promotion'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Promotion Modal */}
        {showEditModal && selectedPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Promotion</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <X size={12} className="text-white" />
                    </div>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Name</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      placeholder="Enter promotion name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      name="promotionType"
                      value={formData.promotionType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    >
                      <option value="flashsale">Flash Sale</option>
                      <option value="coupon">Coupon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    placeholder="Enter promotion description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                  >
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      placeholder="Enter discount value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply To</label>
                    <select
                      name="applyTo"
                      value={formData.applyTo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                    >
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                      <option value="all">All Products</option>
                    </select>
                  </div>
                </div>

                {formData.applyTo !== 'all' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.applyTo === 'product' ? 'Select Products' : 'Select Categories'}
                    </label>
                    <div className="text-xs text-red-500 mb-2">
                      Debug: applyTo={formData.applyTo}, products={products.length}, categories={categories.length}
                    </div>
                    <select
                      multiple
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      value={formData.applyToId}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        console.log('Selected options:', selectedOptions);
                        setFormData(prev => ({
                          ...prev,
                          applyToId: selectedOptions
                        }));
                      }}
                      size={4}
                    >
                      {formData.applyTo === 'product' && products.length > 0 ? (
                        products.map(product => (
                          <option key={product._id || product.id} value={product._id || product.id}>
                            {product.name || product.title || 'Unnamed Product'}
                          </option>
                        ))
                      ) : formData.applyTo === 'category' && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category._id || category.id} value={category._id || category.id}>
                            {category.name || 'Unnamed Category'}
                          </option>
                        ))
                      ) : (
                        <option value="">No {formData.applyTo === 'product' ? 'products' : 'categories'} available</option>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple items
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand_pink/10 file:text-brand_pink hover:file:bg-brand_pink/20"
                  />
                  {(bannerFile || formData.banner) && (
                    <div className="mt-3 relative w-32 h-20 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={bannerFile ? URL.createObjectURL(bannerFile) : formData.banner}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerFile(null);
                          setFormData(prev => ({ ...prev, banner: '' }));
                        }}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {formData.promotionType === 'coupon' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                      placeholder="Optional: Enter coupon code"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Promotion'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPromotion && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  <span>Delete Promotion</span>
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6 space-y-2">
                <p className="text-sm text-brand_gray">
                  Are you sure you want to delete this promotion?
                </p>
                <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">
                  This action is permanent, cannot be undone, and will immediately deactivate and delete the promotion "{selectedPromotion.title || 'Untitled promotion'}".
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Promotion'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Promotion Details Modal */}
        {showViewModal && selectedPromotion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-brand_gray_dark">Promotion Details</h2>
                  <p className="text-xs text-brand_gray font-medium">Campaign ID: {selectedPromotion._id || 'N/A'}</p>
                </div>
                <button
                  onClick={() => { setShowViewModal(false); setSelectedPromotion(null); }}
                  className="p-1.5 rounded-lg text-brand_gray hover:bg-gray-50 hover:text-brand_gray_dark transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Image Banner */}
                {selectedPromotion.banner && (
                  <div className="w-full h-48 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center relative shadow-sm">
                    <img
                      src={selectedPromotion.banner}
                      alt="Campaign Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(selectedPromotion.status)}`}>
                        {selectedPromotion.status || 'inactive'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Campaign Information</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-brand_gray font-medium">Campaign Name</p>
                        <p className="text-sm font-semibold text-brand_gray_dark">{selectedPromotion.title || 'Untitled'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand_gray font-medium">Description</p>
                        <p className="text-sm font-medium text-brand_gray_dark/80">{selectedPromotion.description || 'No description provided.'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand_gray font-medium">Promotion Type</p>
                        <p className="text-sm font-semibold text-brand_pink capitalize">{selectedPromotion.promotionType || 'N/A'}</p>
                      </div>
                      {selectedPromotion.couponCode && (
                        <div>
                          <p className="text-[10px] text-brand_gray font-medium">Coupon Code</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-brand_pink/10 border border-brand_pink/20 rounded text-xs font-bold text-brand_pink uppercase tracking-wider">
                            {selectedPromotion.couponCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
                    <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Discount & Application</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] text-brand_gray font-medium">Discount Value</p>
                        <p className="text-sm font-bold text-brand_gray_dark">
                          {selectedPromotion.discountType === 'percent' ? `${selectedPromotion.discountValue}% OFF` :
                            selectedPromotion.discountType === 'fixed' ? `₦${selectedPromotion.discountValue.toLocaleString()} OFF` :
                              selectedPromotion.discountValue || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-brand_gray font-medium">Applies To</p>
                        <p className="text-sm font-semibold text-brand_gray_dark capitalize">{selectedPromotion.applyTo || 'All Products'}</p>
                      </div>
                      {selectedPromotion.applyTo !== 'all' && (
                        <div>
                          <p className="text-[10px] text-brand_gray font-medium">Applied Items / Collections</p>
                          <p className="text-xs font-medium text-brand_gray_dark/80 whitespace-pre-wrap max-h-24 overflow-y-auto mt-1 bg-white p-2 border border-gray-100 rounded-lg">
                            {getAppliedNames()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-brand_gray font-medium">Duration Period</p>
                        <p className="text-xs font-medium text-brand_gray_dark/80 mt-0.5">
                          Start: {selectedPromotion.startDate ? new Date(selectedPromotion.startDate).toLocaleDateString('en-GB') : 'N/A'}<br />
                          End: {selectedPromotion.endDate ? new Date(selectedPromotion.endDate).toLocaleDateString('en-GB') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditClick(selectedPromotion);
                  }}
                  className="px-5 py-2 border border-gray-200 text-brand_gray_dark font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Edit Campaign
                </button>
                <button
                  onClick={() => { setShowViewModal(false); setSelectedPromotion(null); }}
                  className="px-6 py-2 bg-brand_pink text-white font-semibold text-sm rounded-xl hover:bg-brand_pink/90 transition-colors"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default PromotionsPage;
