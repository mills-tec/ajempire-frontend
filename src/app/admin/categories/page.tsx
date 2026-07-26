'use client'

import { ToastContainer, useToast } from '@/app/components/ui/Toast';
import EmptyTable from '@/components/EmptyTable';
import { Category } from '@/lib/admin-types';
import { createCategory, deleteCategory, getAllCategories, getImagePresignedUpload, updateCategory, uploadFile } from '@/lib/adminapi';
import { bunnyLoader } from '@/lib/bunnyLoader';
import { compressImage } from '@/lib/utils';
import { AlertCircle, ChevronLeft, ChevronRight, Edit2, Eye, Filter, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const CategoriesPage = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    image: null as File | null,
  });

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getAllCategories();
      if (response.message && Array.isArray(response.message)) {
        console.log();
        setCategories(response.message.map(item => ({ ...item, id: item._id })) as Category[]);
      } else if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response)) {
        setCategories(response as unknown as Category[]);
      } else {
        console.error('Unexpected response structure:', response);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleViewClick = (item: Category) => {
    setSelectedCategory(item);
    setShowViewModal(true);
  };

  const handleDeleteClick = (item: Category) => {
    setSelectedCategory(item);
    setShowDeleteModal(true);
  };

  const handleEditClick = (item: Category) => {
    setSelectedCategory(item);
    setEditFormData({
      name: item.name || '',
      description: item.description || '',
      image: null,
    });
    setShowEditModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory?.id) return;

    try {
      setLoading(true);
      const response = await deleteCategory(selectedCategory.id);
      if (response.message) {
        fetchCategories();
        setShowDeleteModal(false);
        setSelectedCategory(null);
        toast.success('Category deleted successfully');
      } else {
        toast.error('Error deleting category. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setEditFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim()) {
      toast.error('Name is required');
      setLoading(false);
      return;
    }

    try {
      let objectKey: string | undefined;

      if (formData.image) {
        const fileToUpload = formData.image.type.startsWith("image")
          ? await compressImage(formData.image, "medium")
          : formData.image;

        const tr = await getImagePresignedUpload(fileToUpload);
        if (!tr.status || !tr.message) {
          throw new Error("Failed to get upload URL");
        }

        const uploadResult = await uploadFile(fileToUpload, tr.message.uploadUrl);
        if (uploadResult.status < 200 || uploadResult.status >= 300) {
          // handle upload failure — don't create the category
          throw new Error("Image upload failed");
        }

        objectKey = tr.message.objectKey;
      }

      const category = await createCategory({
        name: formData.name,
        description: formData.description,
        image: objectKey,
      });

      if (category.status) {
        setFormData({ name: '', description: '', image: null });
        setShowAddModal(false);
        fetchCategories();
        toast.success('Category created successfully');
      } else {
        toast.error('Error creating category. Please try again.');
      }


    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Error creating category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory?.id) return;

    setLoading(true);

    try {
      let objectKey: string | undefined;

      if (editFormData.image) {
        const fileToUpload = editFormData.image.type.startsWith("image")
          ? await compressImage(editFormData.image, "medium")
          : editFormData.image;

        const tr = await getImagePresignedUpload(fileToUpload);
        if (!tr.status || !tr.message) {
          throw new Error("Failed to get upload URL");
        }

        const uploadResult = await uploadFile(fileToUpload, tr.message.uploadUrl);
        if (uploadResult.status < 200 || uploadResult.status >= 300) {
          throw new Error("Image upload failed");
        }

        objectKey = tr.message.objectKey;
      }

      const response = await updateCategory(selectedCategory.id, {
        name: editFormData.name,
        description: editFormData.description,
        image: objectKey,
      });

      if (response.status) {
        setEditFormData({ name: '', description: '', image: null });
        setShowEditModal(false);
        setSelectedCategory(null);
        fetchCategories();
        toast.success('Category updated successfully');
      } else {
        toast.error('Error updating category. Please try again.');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Error updating category. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5 lg:overflow-y-auto">
      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-10">
        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors" />
            <input
              type="text"
              placeholder="Search Categories"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand_pink hover:bg-brand_pink/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md active:scale-95"
            >
              <Plus size={16} />
              Add Category
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Image</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Description</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Slug</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Created</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categoriesLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <EmptyTable colSpan={6} tableType='Categories' searchTerm={searchTerm} />
              ) : (
                filteredCategories.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    onClick={() => handleViewClick(item)}
                  >
                    <td className="p-4">
                      {item.image ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            sizes="40px"
                            fill
                            className="object-cover"
                            loader={bunnyLoader}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-brand_pink/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand_pink text-sm font-bold">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-sm text-brand_gray_dark">{item.name}</span>
                    </td>
                    <td className="p-4 text-sm text-brand_gray_dark/80 max-w-xs">
                      <span className="line-clamp-2">{item.description || '—'}</span>
                    </td>
                    <td className="p-4 text-sm text-brand_gray_dark/60 font-mono">{item.slug || '—'}</td>
                    <td className="p-4 text-sm text-brand_gray_dark/60">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                          className="text-brand_gray hover:text-brand_pink transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                          className="text-brand_gray hover:text-red-500 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewClick(item); }}
                          className="text-brand_gray hover:text-blue-500 transition-colors"
                          title="View Category"
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
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/20">
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
              1-{Math.min(8, filteredCategories.length)} of {filteredCategories.length} items
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>1</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">
                of {Math.max(1, Math.ceil(filteredCategories.length / 8))} pages
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Category</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors resize-none"
                  placeholder="Enter category description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand_pink file:text-white hover:file:bg-brand_pink/90"
                  />
                  {formData.image ? (
                    <div className="mt-2 text-sm text-green-600">Selected: {formData.image.name}</div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">No image selected (optional)</div>
                  )}
                </div>
              </div>

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
                    'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors resize-none"
                  placeholder="Enter category description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Image (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="image"
                    onChange={handleEditFileChange}
                    accept="image/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand_pink file:text-white hover:file:bg-brand_pink/90"
                  />
                  {editFormData.image && (
                    <div className="mt-2 text-sm text-gray-600">Selected: {editFormData.image.name}</div>
                  )}
                  {selectedCategory.image && !editFormData.image && (
                    <div className="mt-2 text-sm text-gray-500">Current: Image uploaded</div>
                  )}
                </div>
              </div>

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
                    'Update Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Category Modal */}
      {showViewModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Category Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                <p className="font-medium">{selectedCategory.name}</p>
              </div>

              {selectedCategory.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-700">{selectedCategory.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Slug</h3>
                <p className="font-medium font-mono text-sm">{selectedCategory.slug || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                  <p className="font-medium text-sm">
                    {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Updated</h3>
                  <p className="font-medium text-sm">
                    {selectedCategory.updatedAt ? new Date(selectedCategory.updatedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>

              {selectedCategory.image && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Image</h3>
                  <div className="w-full h-48 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={selectedCategory.image}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      alt={selectedCategory.name}
                      fill
                      quality={65}
                      className="object-cover"
                      loader={bunnyLoader}
                    />
                  </div>
                </div>
              )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                <span>Delete Category</span>
              </h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 space-y-2">
              <p className="text-sm text-brand_gray">
                Are you sure you want to delete this category?
              </p>
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">
                This action is permanent and cannot be undone. The category &quot;{selectedCategory.name}&quot; will be permanently deleted.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
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
                  'Delete Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </main>
  );
};

export default CategoriesPage;
