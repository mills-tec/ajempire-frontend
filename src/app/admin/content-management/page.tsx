'use client'

import React, { useState } from 'react';
import { Search, Filter, Eye, Trash2, Edit2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, SquarePen, Megaphone, Plus, X } from 'lucide-react';
import { createEducationWithFiles, getEducation, deleteEducation, updateEducation } from '@/lib/adminapi';
import { CreateEducationData, Education } from '@/lib/admin-types';
import { useToast, ToastContainer } from '@/app/components/ui/Toast';

const ContentManagementPage = () => {
  const toast = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Education | null>(null);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(true);
  const [content, setContent] = useState<Education[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'article' as 'video' | 'article' | 'tutorial',
    image: null as File | null,
    video: null as File | null,
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    image: null as File | null,
    video: null as File | null,
  });

  // Fetch education content from server
  const fetchContent = async () => {
    try {
      setContentLoading(true);
      const response = await getEducation();
      console.log('API Response:', response); // Debug log
      
      // Handle different response structures
      if (response.message && Array.isArray(response.message)) {
        setContent(response.message);
      } else if (response.data && Array.isArray(response.data)) {
        setContent(response.data);
      } else if (Array.isArray(response)) {
        setContent(response);
      } else {
        console.error('Unexpected response structure:', response);
        setContent([]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent([]);
    } finally {
      setContentLoading(false);
    }
  };

  // Fetch content on component mount
  React.useEffect(() => {
    fetchContent();
  }, []);

  // Handle view content
  const handleViewClick = (item: Education) => {
    setSelectedContent(item);
    setShowViewModal(true);
  };

  // Handle delete content
  const handleDeleteClick = (item: Education) => {
    setSelectedContent(item);
    setShowDeleteModal(true);
  };

  // Handle edit content
  const handleEditClick = (item: Education) => {
    setSelectedContent(item);
    setEditFormData({
      title: item.title || '',
      description: item.description || '',
      image: null,
      video: null,
    });
    setShowEditModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedContent?._id) return;
    
    try {
      setLoading(true);
      const response = await deleteEducation(selectedContent._id);
      if (response.message) {
        // Refresh content list
        fetchContent();
        setShowDeleteModal(false);
        setSelectedContent(null);
        console.log('Content deleted successfully');
      } else {
        console.error('Error deleting content:', response.message);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedContent(null);
  };

  // Calculate stats from content data
  const calculateStats = () => {
    const totalContent = content.length;
    const publishedContent = content.filter(item => item.status === 'Published').length;
    const draftContent = content.filter(item => item.status === 'Draft').length;
    const totalLikes = content.reduce((sum, item) => sum + (Array.isArray(item.likes) ? item.likes.length : 0), 0);
    const totalComments = content.reduce((sum, item) => sum + (Array.isArray(item.comments) ? item.comments.length : 0), 0);

    return {
      totalContent,
      publishedContent,
      draftContent,
      totalLikes,
      totalComments
    };
  };

  const stats = calculateStats();

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Published': return 'bg-green-50 text-green-500 border-green-100';
      case 'Draft': return 'bg-yellow-50 text-yellow-500 border-yellow-100';
      case 'Archived': return 'bg-gray-50 text-gray-500 border-gray-100';
      case 'Scheduled': return 'bg-blue-50 text-blue-500 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setEditFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Title is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      setLoading(false);
      return;
    }

    if (!formData.image) {
      toast.error('Image is required');
      setLoading(false);
      return;
    }

    if (!formData.video) {
      toast.error('Video is required');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      // formDataToSend.append('type', formData.type);
      
      // Image is compulsory
      formDataToSend.append('image', formData.image);
      
      // Video is now compulsory as well
      formDataToSend.append('video', formData.video);

      const response = await createEducationWithFiles(formDataToSend);
      
      if (response.message) {
        // Reset form and close modal
        setFormData({
          title: '',
          description: '',
          type: 'article',
          image: null,
          video: null,
        });
        setShowAddModal(false);
        // Refresh the content list
        fetchContent();
        toast.success('Content created successfully');
      } else {
        console.error('Error creating content:', response.message);
        toast.error('Error creating content. Please try again.');
      }
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Error creating content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent?._id) return;
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', editFormData.title);
      formDataToSend.append('description', editFormData.description);
      
      if (editFormData.image) {
        formDataToSend.append('image', editFormData.image);
      }
      
      if (editFormData.video) {
        formDataToSend.append('video', editFormData.video);
      }

      const response = await updateEducation(selectedContent._id, formDataToSend);
      
      if (response.message) {
        // Reset form and close modal
        setEditFormData({
          title: '',
          description: '',
          image: null,
          video: null,
        });
        setShowEditModal(false);
        setSelectedContent(null);
        // Refresh the content list
        fetchContent();
        console.log('Content updated successfully');
      } else {
        console.error('Error updating content:', response.message);
      }
    } catch (error) {
      console.error('Error updating content:', error);
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Total Content</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.totalContent}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Published</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.publishedContent}</h3>
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
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Total Likes</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.totalLikes}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Total Comments</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.totalComments}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-10 mt-10">
        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors" />
            <input
              type="text"
              placeholder="Search Content"
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
              Add Content
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Category</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Linked Product</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Likes</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Comments</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Views</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contentLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                    </div>
                  </td>
                </tr>
              ) : content.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No content found. Click "Add Content" to create your first content item.
                  </td>
                </tr>
              ) : (
                content.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-brand_gray_dark max-w-xs truncate">
                          {typeof item.title === 'string' ? item.title : (typeof item.text === 'string' ? item.text : 'No title')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-brand_gray_dark/80">{item.category || 'Education'}</td>
                    <td className="p-4 text-sm text-brand_gray_dark/80">{item.linkedProduct || 'N/A'}</td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">
                      {Array.isArray(item.likes) ? item.likes.length : (typeof item.likes === 'number' ? item.likes : 0)}
                    </td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">
                      {Array.isArray(item.comments) ? item.comments.length : 0}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(item.status)}`}>
                        {typeof item.status === 'string' ? item.status : 'Published'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">
                      {typeof item.views === 'number' ? item.views : 0}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="text-brand_gray hover:text-brand_pink transition-colors"
                          title="Edit Content"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item)}
                          className="text-brand_gray hover:text-red-500 transition-colors"
                          title="Delete Content"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewClick(item)}
                          className="text-brand_gray hover:text-blue-500 transition-colors"
                          title="View Content"
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
            <span className="text-xs text-brand_gray font-medium">1-8 of 1,248 items</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">of 156 pages</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add New Content</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                  placeholder="Enter content title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors resize-none"
                  placeholder="Enter content description"
                />
              </div>

              {/* Content Type */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                >
                  <option value="article">Article</option>
                  <option value="video">Video</option>
                  <option value="tutorial">Tutorial</option>
                </select>
              </div> */}

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="image"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand_pink file:text-white hover:file:bg-brand_pink/90"
                  />
                  {formData.image ? (
                    <div className="mt-2 text-sm text-green-600">
                      Selected: {formData.image.name}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">
                      Please select an image (required)
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="video"
                    onChange={handleFileChange}
                    accept="video/*"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand_pink file:text-white hover:file:bg-brand_pink/90"
                  />
                  {formData.video ? (
                    <div className="mt-2 text-sm text-green-600">
                      Selected: {formData.video.name}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-gray-500">
                      Please select a video (required)
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
                    'Create Content'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {showEditModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Content</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors"
                  placeholder="Enter content title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors resize-none"
                  placeholder="Enter content description"
                />
              </div>

              {/* Image Upload */}
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
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {editFormData.image.name}
                    </div>
                  )}
                  {selectedContent.image && !editFormData.image && (
                    <div className="mt-2 text-sm text-gray-500">
                      Current: Image uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Video (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="video"
                    onChange={handleEditFileChange}
                    accept="video/*"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand_pink file:text-white hover:file:bg-brand_pink/90"
                  />
                  {editFormData.video && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {editFormData.video.name}
                    </div>
                  )}
                  {selectedContent.video && !editFormData.video && (
                    <div className="mt-2 text-sm text-gray-500">
                      Current: Video uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
                    'Update Content'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Content Modal */}
      {showViewModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Content Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Title</h3>
                <p className="font-medium">{selectedContent.title || 'No title'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-700">{selectedContent.description || 'No description'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <p className="font-medium">{selectedContent.type || 'Article'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(selectedContent.status)}`}>
                    {selectedContent.status || 'Published'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Likes</h3>
                  <p className="font-medium">{Array.isArray(selectedContent.likes) ? selectedContent.likes.length : 0}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Comments</h3>
                  <p className="font-medium">{Array.isArray(selectedContent.comments) ? selectedContent.comments.length : 0}</p>
                </div>
              </div>
              
              {selectedContent.image && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Image</h3>
                  <img 
                    src={selectedContent.image} 
                    alt="Content preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {selectedContent.video && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Video</h3>
                  <video 
                    src={selectedContent.video} 
                    controls 
                    className="w-full h-48 rounded-lg"
                  />
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
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Content</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this content?
              </p>
              <p className="font-medium text-gray-900">
                "{selectedContent.title || 'Untitled content'}"
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
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
      
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
    </main>
  );
};

export default ContentManagementPage;
