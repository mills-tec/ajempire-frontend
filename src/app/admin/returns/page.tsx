'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, Edit2, X } from 'lucide-react';
import { getAllReturns, getReturnById, updateReturn } from '@/lib/adminapi';
import { useToast, ToastContainer } from '@/app/components/ui/Toast';

const ReturnsPage = () => {
  const toast = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await getAllReturns();
      
      if (response.message && Array.isArray(response.message)) {
        // Transform API data to match our table structure
        const transformedReturns = response.message.map((returnItem: any) => ({
          id: returnItem.order?.order_id || 'Unknown',
          customer: returnItem.phoneNumber || 'Unknown Customer',
          items: returnItem.product?.length || 0,
          returnDate: returnItem.createdAt ? new Date(returnItem.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-') : 'Unknown',
          status: returnItem.status || 'Unknown',
          // Store full return data for detailed view
          fullReturn: returnItem
        }));
        setReturns(transformedReturns);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats dynamically with safe defaults
  const totalReturns = returns?.length || 0;
  const processingReturns = returns?.filter(r => r.status === 'processing').length || 0;
  const inTransitReturns = returns?.filter(r => r.status === 'approved').length || 0;
  const declinedReturns = returns?.filter(r => r.status === 'rejected').length || 0;

  // Filter returns based on search with safe checks
  const filteredReturns = returns?.filter(returnItem => 
    returnItem?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem?.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-500 border-yellow-100';
      case 'Approved': return 'bg-green-50 text-green-500 border-green-100';
      case 'Processing': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Completed': return 'bg-green-50 text-green-500 border-green-100';
      case 'Rejected': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const handleViewReturn = async (returnItem: any) => {
    try {
      // Get detailed return data
      const response = await getReturnById(returnItem.fullReturn._id);
      if (response.message) {
        setSelectedReturn(response.message);
      } else {
        setSelectedReturn(returnItem.fullReturn);
      }
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching return details:', error);
      toast.error('Failed to fetch return details');
      setSelectedReturn(returnItem.fullReturn);
      setShowViewModal(true);
    }
  };

  const handleEditReturn = (returnItem: any) => {
    setSelectedReturn(returnItem.fullReturn);
    setShowEditModal(true);
  };

  const handleUpdateReturn = async (updatedData: any) => {
    if (selectedReturn) {
      try {
        setIsUpdating(true);
        const response = await updateReturn(selectedReturn._id, updatedData);
        
        if (response.message) {
          toast.success('Return updated successfully');
          setShowEditModal(false);
          setSelectedReturn(null);
          fetchReturns(); // Refresh list
        } else {
          toast.error(response.error || 'Failed to update return');
        }
      } catch (error: any) {
        console.error('Error updating return:', error);
        toast.error(error.message || 'Failed to update return');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  
  const cancelEdit = () => {
    setShowEditModal(false);
    setSelectedReturn(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReturns = filteredReturns.slice(startIndex, endIndex);

  // Pagination handlers
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
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
                <Users size={20} className="text-brand_pink" />
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
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Total Returns</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{totalReturns}</h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">1,248</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div> */}
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Processing</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{processingReturns}</h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div> */}
              </div>

              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Completed</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{returns.filter(r => r.status === 'Completed').length}</h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">156</p>
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
                <CornerDownRight size={20} className="text-brand_pink" />
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
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">In Transit</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{inTransitReturns}</h3>
                {/* <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-brand_gray_dark">89</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div> */}
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Declined</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{declinedReturns}</h3>
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
              placeholder="Search Order ID, Customer, Status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 border border-gray-100 text-brand_gray_dark px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-left">No. of Items</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Return Date</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedReturns.map((returnItem, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-sm font-medium text-brand_gray_dark/80">{returnItem.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-brand_gray_dark">{returnItem.customer}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-left">{returnItem.items}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand_gray_dark/80">{returnItem.returnDate}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(returnItem.status)}`}>
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleViewReturn(returnItem)}
                          className="text-brand_gray hover:text-brand_pink transition-colors" 
                          title="View Return"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditReturn(returnItem)}
                          className="text-brand_gray hover:text-blue-500 transition-colors" 
                          title="Edit Return"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select 
                className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              >
                <option value={8}>8</option>
                <option value={16}>16</option>
                <option value={32}>32</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">Items per page</span>
            </div>
            <span className="text-xs text-brand_gray font-medium">
              {filteredReturns.length > 0 ? `${startIndex + 1}-${Math.min(endIndex, filteredReturns.length)} of ${filteredReturns.length} items` : '0 items'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select 
                className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none"
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
              <span className="text-xs text-brand_gray font-medium">of {totalPages} pages</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-1 rounded-md text-brand_gray hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md text-brand_gray hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      
      {/* View Return Modal */}
      {showViewModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Return Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Order Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{selectedReturn?.order?.order_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Return Date</p>
                    <p className="font-medium">
                      {selectedReturn?.createdAt ? new Date(selectedReturn.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(selectedReturn?.status)}`}>
                      {selectedReturn?.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{selectedReturn?.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Product Information</h4>
                {selectedReturn?.product && Array.isArray(selectedReturn.product) ? (
                  <div className="space-y-3">
                    {selectedReturn.product.map((item: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm text-gray-500">Product Name</p>
                            <p className="font-medium">{item.productName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Quantity</p>
                            <p className="font-medium">{item.quantity || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Reason</p>
                            <p className="font-medium">{item.reason || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No product information available</p>
                )}
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Return ID</p>
                    <p className="font-medium">{selectedReturn?._id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {selectedReturn?.updatedAt ? new Date(selectedReturn.updatedAt).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditReturn({ fullReturn: selectedReturn });
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
              >
                Edit Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Return Modal */}
      {showEditModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Return</h3>
              <button 
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Status Update */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Return Status</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue={selectedReturn?.status || 'Pending'}
                      id="statusSelect"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Processing">Processing</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Current Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Current Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{selectedReturn?.order?.order_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{selectedReturn?.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const statusSelect = document.getElementById('statusSelect') as HTMLSelectElement;
                  const newStatus = statusSelect?.value;
                  handleUpdateReturn({ status: newStatus });
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Return'
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

export default ReturnsPage;
