'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Eye, Link2, Image as ImageIcon, X, Check, 
  Loader2, ToggleLeft, ToggleRight, ExternalLink, Calendar, Copy,
  Images, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  getBanners, createBanner, updateBanner, removeImageFromBanner, deleteBanner,
  Banner, BannerImage 
} from '@/lib/adminapi';
import { toast } from 'sonner';

interface NewImageItem {
  file: File;
  link: string;
  preview: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Selection state
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  
  // Form state
  const [newImages, setNewImages] = useState<NewImageItem[]>([]);
  const [editIsActive, setEditIsActive] = useState(true);
  const [appendedImages, setAppendedImages] = useState<NewImageItem[]>([]);
  const [deletingImageUrls, setDeletingImageUrls] = useState<string[]>([]);

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getBanners();
      if (res && res.success !== false && !res.error) {
        let bannerList: Banner[] = [];
        if (Array.isArray(res.message)) {
          bannerList = res.message;
        } else if (Array.isArray(res.data)) {
          bannerList = res.data;
        } else if (Array.isArray(res)) {
          bannerList = res;
        }
        setBanners(bannerList);
      } else {
        setBanners([]);
        toast.error(res?.error || 'Failed to load banners');
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      toast.error('An error occurred while fetching banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Copy link helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard');
  };

  // Add Banner Image selection handler
  const handleAddFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems: NewImageItem[] = filesArray.map(file => ({
        file,
        link: '',
        preview: URL.createObjectURL(file)
      }));
      setNewImages(prev => [...prev, ...newItems]);
    }
  };

  // Append Banner Image selection handler (Edit mode)
  const handleAppendFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems: NewImageItem[] = filesArray.map(file => ({
        file,
        link: '',
        preview: URL.createObjectURL(file)
      }));
      setAppendedImages(prev => [...prev, ...newItems]);
    }
  };

  // Remove local image before upload
  const removeNewImageLocally = (index: number) => {
    setNewImages(prev => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Remove appended image locally before upload (Edit mode)
  const removeAppendedImageLocally = (index: number) => {
    setAppendedImages(prev => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Update link value for a local selected file
  const handleLinkChange = (index: number, link: string) => {
    setNewImages(prev => prev.map((item, i) => i === index ? { ...item, link } : item));
  };

  // Update link value for appended files in Edit mode
  const handleAppendedLinkChange = (index: number, link: string) => {
    setAppendedImages(prev => prev.map((item, i) => i === index ? { ...item, link } : item));
  };

  // Toggle active status in listing
  const handleToggleStatus = async (banner: Banner) => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('isActive', (!banner.isActive).toString());
      
      const res = await updateBanner(banner._id, formData);
      if (res && res.success !== false && !res.error) {
        toast.success(`Banner status updated to ${!banner.isActive ? 'Active' : 'Inactive'}`);
        fetchBanners();
      } else {
        toast.error(res?.error || 'Failed to update banner status');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  // Add Banner submit
  const handleAddBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      
      // Append files
      newImages.forEach(img => {
        formData.append('images', img.file);
      });

      // Prepare metadata
      const meta = newImages.map(img => ({
        link: img.link.trim()
      }));
      formData.append('imagesMeta', JSON.stringify(meta));
      formData.append('isActive', 'true');

      const res = await createBanner(formData);
      if (res && res.success !== false && !res.error) {
        toast.success('Banner created successfully');
        setShowAddModal(false);
        // Clean up object URLs
        newImages.forEach(img => URL.revokeObjectURL(img.preview));
        setNewImages([]);
        fetchBanners();
      } else {
        toast.error(res?.error || 'Failed to create banner');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while creating banner');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Banner details (open modal)
  const openEditModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setEditIsActive(banner.isActive);
    setAppendedImages([]);
    setDeletingImageUrls([]);
    setShowEditModal(true);
  };

  // Delete individual image from banner (Edit mode)
  const handleDeleteImageFromBanner = async (imageUrl: string) => {
    if (!selectedBanner) return;
    
    // Add to deleting state for loading UI indicator
    setDeletingImageUrls(prev => [...prev, imageUrl]);
    
    try {
      const res = await removeImageFromBanner(selectedBanner._id, imageUrl);
      if (res && res.success !== false && !res.error) {
        toast.success('Image removed from banner');
        // Update local selectedBanner state
        setSelectedBanner(prev => {
          if (!prev) return null;
          return {
            ...prev,
            images: prev.images.filter(img => img.url !== imageUrl)
          };
        });
        fetchBanners();
      } else {
        toast.error(res?.error || 'Failed to remove image');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while removing image');
    } finally {
      setDeletingImageUrls(prev => prev.filter(url => url !== imageUrl));
    }
  };

  // Save Edit Changes (Status toggle and appending new images)
  const handleEditBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanner) return;

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('isActive', editIsActive.toString());

      // If there are new images appended
      if (appendedImages.length > 0) {
        appendedImages.forEach(img => {
          formData.append('images', img.file);
        });

        const meta = appendedImages.map(img => ({
          link: img.link.trim()
        }));
        formData.append('imagesMeta', JSON.stringify(meta));
      }

      const res = await updateBanner(selectedBanner._id, formData);
      if (res && res.success !== false && !res.error) {
        toast.success('Banner updated successfully');
        setShowEditModal(false);
        // Clean up object URLs
        appendedImages.forEach(img => URL.revokeObjectURL(img.preview));
        setAppendedImages([]);
        fetchBanners();
      } else {
        toast.error(res?.error || 'Failed to update banner');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while updating banner');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Delete confirmation
  const openDeleteModal = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowDeleteModal(true);
  };

  // Confirm delete banner
  const handleConfirmDeleteBanner = async () => {
    if (!selectedBanner) return;
    try {
      setActionLoading(true);
      const res = await deleteBanner(selectedBanner._id);
      if (res && res.success !== false && !res.error) {
        toast.success('Banner deleted successfully');
        setShowDeleteModal(false);
        fetchBanners();
      } else {
        toast.error(res?.error || 'Failed to delete banner');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while deleting banner');
    } finally {
      setActionLoading(false);
    }
  };

  // Count helper functions for statistics cards
  const totalBanners = banners.length;
  const activeBannersCount = banners.filter(b => b.isActive).length;
  const totalImagesCount = banners.reduce((sum, b) => sum + (b.images?.length || 0), 0);

  return (
    <div className="pb-12 text-brand_gray_dark">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-brand_gray">
            Upload, manage, and toggle status of home screen promotional banners.
          </p>
        </div>
        <button
          onClick={() => {
            setNewImages([]);
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-brand_pink hover:bg-brand_pink/95 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md active:scale-95 duration-150"
        >
          <Plus size={18} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-brand_pink/10 w-12 h-12 rounded-xl flex items-center justify-center text-brand_pink">
            <Images size={24} />
          </div>
          <div>
            <p className="text-xs text-brand_gray font-medium">Total Banners</p>
            <h3 className="text-xl font-bold text-gray-900">{totalBanners}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-brand_gray font-medium">Active Banners</p>
            <h3 className="text-xl font-bold text-gray-900">{activeBannersCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-500">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-xs text-brand_gray font-medium">Total Banner Images</p>
            <h3 className="text-xl font-bold text-gray-900">{totalImagesCount}</h3>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <Loader2 className="w-10 h-10 text-brand_pink animate-spin mb-4" />
          <p className="text-sm font-medium text-brand_gray">Loading banners, please wait...</p>
        </div>
      ) : banners.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4 text-brand_gray">
            <Images size={48} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Banners Uploaded</h3>
          <p className="text-sm text-brand_gray max-w-sm mb-6">
            You haven't uploaded any promotional banners yet. Create one to highlight collections or deals on the store homepage.
          </p>
          <button
            onClick={() => {
              setNewImages([]);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-brand_pink hover:bg-brand_pink/95 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <Plus size={16} />
            <span>Create First Banner</span>
          </button>
        </div>
      ) : (
        /* Banners Cards Grid */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner._id} 
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                    banner.isActive 
                      ? 'bg-green-50 text-green-500 border-green-100' 
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {/* Status Toggle Button */}
                  <button 
                    onClick={() => handleToggleStatus(banner)}
                    disabled={actionLoading}
                    className="text-brand_gray hover:text-brand_pink transition-colors disabled:opacity-50"
                    title={banner.isActive ? "Deactivate banner" : "Activate banner"}
                  >
                    {banner.isActive ? (
                      <ToggleRight size={24} className="text-brand_pink" />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-1.5 rounded-lg text-brand_gray hover:bg-gray-100 hover:text-brand_pink transition-all"
                    title="Edit banner"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(banner)}
                    className="p-1.5 rounded-lg text-brand_gray hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Delete banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card Body - Images list */}
              <div className="p-5 flex-1 space-y-4">
                {banner.images && banner.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banner.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="border border-gray-100 rounded-xl overflow-hidden flex flex-col bg-gray-50"
                      >
                        <div className="relative aspect-[21/9] w-full bg-gray-200 overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={img.url} 
                            alt={`Banner ${idx + 1}`} 
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                          <a 
                            href={img.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1 rounded-md transition-colors"
                          >
                            <Eye size={12} />
                          </a>
                        </div>
                        
                        <div className="p-3 flex items-center justify-between text-xs text-brand_gray gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Link2 size={14} className="flex-shrink-0 text-brand_pink" />
                            {img.link ? (
                              <span 
                                className="truncate font-medium cursor-pointer hover:text-brand_pink transition-colors" 
                                title={img.link}
                                onClick={() => copyToClipboard(img.link || '')}
                              >
                                {img.link}
                              </span>
                            ) : (
                              <span className="italic">No redirect link configured</span>
                            )}
                          </div>
                          {img.link && (
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button 
                                onClick={() => copyToClipboard(img.link || '')}
                                className="p-1 rounded hover:bg-white text-gray-400 hover:text-brand_pink transition-colors"
                                title="Copy link"
                              >
                                <Copy size={12} />
                              </button>
                              <a 
                                href={img.link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-1 rounded hover:bg-white text-gray-400 hover:text-brand_pink transition-colors"
                                title="Open redirect URL"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-28 flex items-center justify-center text-sm italic text-gray-400">
                    No images in this banner
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-brand_gray font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {banner.createdAt ? new Date(banner.createdAt).toLocaleDateString('en-GB') : 'Unknown Date'}
                </span>
                <span>{banner.images?.length || 0} image(s)</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Banner</h3>
                <p className="text-xs text-brand_gray">Upload promotional graphics and define custom links</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddBannerSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* File Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand_gray">Upload Banner Images</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-brand_pink rounded-xl p-8 text-center bg-gray-50/50 hover:bg-brand_pink/5 transition-all duration-200 relative group cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="bg-white p-3 rounded-full shadow-sm text-brand_pink border border-gray-50 group-hover:scale-110 transition-transform duration-200">
                      <Plus size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Click to upload files</p>
                      <p className="text-xs text-brand_gray mt-0.5">Supports PNG, JPG, JPEG, WebP</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Files List */}
              {newImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand_gray">Selected Files ({newImages.length})</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {newImages.map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all"
                      >
                        <div className="relative w-20 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.preview} alt="Selected file" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-bold text-gray-800 truncate">{item.file.name}</p>
                          <input
                            type="url"
                            placeholder="Destination redirect link (e.g. https://store.com/category)"
                            value={item.link}
                            onChange={(e) => handleLinkChange(idx, e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-brand_pink/30 focus:ring-1 focus:ring-brand_pink/10 transition-all"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeNewImageLocally(idx)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition-colors flex-shrink-0 mt-0.5"
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer inside form (Sticky on mobile scroll) */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || newImages.length === 0}
                  className="flex-1 px-4 py-2.5 bg-brand_pink hover:bg-brand_pink/95 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Banner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {showEditModal && selectedBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Banner Settings</h3>
                <p className="text-xs text-brand_gray">Manage images, redirect links, and overall active status</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditBannerSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Active Toggle */}
              <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Banner Visibility</h4>
                  <p className="text-xs text-brand_gray">Toggle to display or hide this banner on the storefront.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className="text-brand_gray hover:text-brand_pink transition-colors focus:outline-none"
                >
                  {editIsActive ? (
                    <ToggleRight size={32} className="text-brand_pink" />
                  ) : (
                    <ToggleLeft size={32} />
                  )}
                </button>
              </div>

              {/* Current Images List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand_gray">Current Banner Images ({selectedBanner.images?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedBanner.images && selectedBanner.images.length > 0 ? (
                    selectedBanner.images.map((img, idx) => {
                      const isDeleting = deletingImageUrls.includes(img.url);
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-all"
                        >
                          <div className="relative w-20 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="Current banner image" className="w-full h-full object-cover" />
                            {isDeleting && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-brand_gray">
                              <Link2 size={12} className="text-brand_pink flex-shrink-0" />
                              <span className="truncate max-w-[320px] font-medium" title={img.link || 'No link'}>
                                {img.link || <span className="italic">No redirect link</span>}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteImageFromBanner(img.url)}
                            disabled={isDeleting || deletingImageUrls.length > 0}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-white transition-colors disabled:opacity-50"
                            title="Remove image from banner"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-xs italic text-brand_gray">
                      No current images in this banner.
                    </div>
                  )}
                </div>
              </div>

              {/* Append New Images Section */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand_gray mb-1">Add More Images</h4>
                  <p className="text-xs text-brand_gray">Select additional images to append to this banner</p>
                </div>
                
                <div className="border-2 border-dashed border-gray-200 hover:border-brand_pink rounded-xl p-6 text-center bg-gray-50/50 hover:bg-brand_pink/5 transition-all duration-200 relative cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAppendFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <ImageIcon size={20} className="text-brand_pink mb-1" />
                    <p className="text-xs font-semibold text-gray-900">Select files to append</p>
                  </div>
                </div>

                {appendedImages.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-brand_gray">Newly Appended Files ({appendedImages.length})</h5>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                      {appendedImages.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-4 p-3 border border-gray-100 rounded-xl bg-gray-50/50"
                        >
                          <div className="relative w-16 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.preview} alt="Appended file" className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-[10px] font-bold text-gray-800 truncate">{item.file.name}</p>
                            <input
                              type="url"
                              placeholder="Destination redirect link"
                              value={item.link}
                              onChange={(e) => handleAppendedLinkChange(idx, e.target.value)}
                              className="w-full bg-white border border-gray-200 rounded-lg py-1 px-2.5 text-xs outline-none focus:border-brand_pink/30 transition-all"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeAppendedImageLocally(idx)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-white transition-colors mt-0.5"
                            title="Remove file"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-brand_pink hover:bg-brand_pink/95 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                <span>Delete Banner</span>
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
                Are you sure you want to delete this promotional banner?
              </p>
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">
                This action is permanent, cannot be undone, and will immediately remove all {selectedBanner.images?.length || 0} associated image(s) from store display.
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
                onClick={handleConfirmDeleteBanner}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Banner'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
