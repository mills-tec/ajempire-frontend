'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, X } from 'lucide-react';
import { getCustomers, deleteCustomer, updateCustomerStatus } from '@/lib/adminapi';
import { useToast, ToastContainer } from '@/app/components/ui/Toast';

const CustomersPage = () => {
  const toast = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCustomers();
      
      // Handle different response structures with type assertions
      const responseAny = response as any;
      if (responseAny.message && typeof responseAny.message === 'object' && responseAny.message.users && Array.isArray(responseAny.message.users)) {
        setCustomers(responseAny.message.users);
      } else if (responseAny.users && Array.isArray(responseAny.users)) {
        setCustomers(responseAny.users);
      } else if (responseAny.message && Array.isArray(responseAny.message)) {
        setCustomers(responseAny.message);
      } else if (responseAny.data && Array.isArray(responseAny.data)) {
        setCustomers(responseAny.data);
      } else {
        setCustomers([]);
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Failed to fetch customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDeleteCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        setIsDeleting(true);
        const customerId = selectedCustomer.user?._id || selectedCustomer._id;
        
        if (!customerId) {
          toast.error('Customer ID is missing or invalid');
          return;
        }
        
        console.log('Deleting customer with ID:', customerId);
        const response = await deleteCustomer(customerId);
        
        if (response.message) {
          toast.success('Customer deleted successfully');
          fetchCustomers(); // Refresh list
        } else {
          toast.error(response.error || 'Failed to delete customer');
        }
      } catch (error: any) {
        console.error('Error deleting customer:', error);
        toast.error(error.message || 'Failed to delete customer');
      } finally {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setSelectedCustomer(null);
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedCustomer(null);
  };

  const handleUpdateStatus = async (customerId: string, newStatus: string) => {
    try {
      const response = await updateCustomerStatus(customerId, newStatus);
      if (response.message) {
        toast.success('Customer status updated successfully');
        fetchCustomers(); // Refresh list
      } else {
        toast.error(response.error || 'Failed to update customer status');
      }
    } catch (error: any) {
      console.error('Error updating customer status:', error);
      toast.error(error.message || 'Failed to update customer status');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.user && customer.user.fullname && customer.user.fullname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.user && customer.user.email && customer.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.user && customer.user.phone && customer.user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.user && customer.user._id && customer.user._id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-500 border-green-100';
      case 'VIP': return 'bg-purple-50 text-purple-500 border-purple-100';
      case 'Inactive': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.user && c.user.active).length;
  const inactiveCustomers = customers.filter(c => c.user && !c.user.active).length;
  const newCustomers = customers.filter(c => {
    const joinedDate = c.user && (c.user.createdAt || c.user.joinedDate) ? new Date(c.user.createdAt || c.user.joinedDate) : null;
    if (!joinedDate) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return joinedDate > thirtyDaysAgo;
  }).length;

  return (
    <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">×</span>
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">All Customers</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{totalCustomers}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Active</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{activeCustomers}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div>
              </div>

              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">In-active</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{inactiveCustomers}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-brand_pink" />
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
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">New Customers</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-brand_gray_dark">{newCustomers}</p>
                  <p className="text-green-500 text-xs">+0.00%</p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Purchasing</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{activeCustomers}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Abandoned Cart</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">0</h3>
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
              placeholder="Search Customer"
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
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer" />
                </th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Customer ID</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Phone</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Total Orders</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Total Spent</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Joined Date</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <tr key={customer.user?._id || idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      <input type="checkbox" className="rounded-md border-gray-300 text-brand_pink focus:ring-brand_pink w-4 h-4 cursor-pointer" />
                    </td>
                    <td className="p-4 text-sm font-medium text-brand_gray_dark/80">{customer.user?._id || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-brand_gray_dark">{customer.user?.fullname || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand_gray_dark/80">{customer.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand_gray_dark/80">{customer.user?.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-brand_gray_dark/80 text-center">{customer.totalOrders || 0}</td>
                    <td className="p-4 text-sm font-medium text-brand_gray_dark">
                      {customer.totalSpent ? `N${customer.totalSpent.toLocaleString()}` : 'N0'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(customer.user?.active ? 'Active' : 'Inactive')}`}>
                        {customer.user?.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand_gray_dark/80">
                          {customer.user?.createdAt ? new Date(customer.user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-brand_gray hover:text-red-500 transition-colors" 
                          title="Delete Customer"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewCustomer(customer)}
                          className="text-brand_gray hover:text-brand_pink transition-colors" 
                          title="View Customer"
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
              {filteredCustomers.length > 0 ? `1-${Math.min(8, filteredCustomers.length)} of ${filteredCustomers.length} items` : '0 items'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">
                of {Math.ceil(filteredCustomers.length / 8) || 1} pages
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 rounded-md text-brand_gray hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Customer</h3>
              <button 
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete this customer? This action cannot be undone.
              </p>
              <p className="font-medium text-gray-900">
                "{selectedCustomer?.user?.fullname || selectedCustomer?.fullname || 'Unknown Customer'}"
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

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedCustomer.user?.fullname || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer ID</p>
                    <p className="font-medium">{selectedCustomer.user?._id || selectedCustomer._id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedCustomer.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedCustomer.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(selectedCustomer.user?.active ? 'Active' : 'Inactive')}`}>
                      {selectedCustomer.user?.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined Date</p>
                    <p className="font-medium">
                      {selectedCustomer.user?.createdAt ? new Date(selectedCustomer.user.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Order Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="font-medium text-lg">{selectedCustomer.totalOrders || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Spent</p>
                    <p className="font-medium text-lg">
                      {selectedCustomer.totalSpent ? `N${selectedCustomer.totalSpent.toLocaleString()}` : 'N0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium">Standard</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Active</p>
                    <p className="font-medium">Recently</p>
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
                  handleDeleteCustomer(selectedCustomer);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
              >
                Delete Customer
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

export default CustomersPage;
