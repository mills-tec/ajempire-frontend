'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, SquarePen, Megaphone, ShoppingBag, X } from 'lucide-react';
import { getUserOrders, updateOrder } from '@/lib/adminapi';
import { filterByPeriod } from '@/lib/dashboard-utils';
import { useToast, ToastContainer } from '@/app/components/ui/Toast';

const DeliveryPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount).replace('NGN', '₦');
  };

  const handleUpdateStatus = async (orderDbId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const response = await updateOrder(orderDbId, { orderStatus: newStatus as any });

      if (response.success || (response as any).message === "Order Status Updated") {
        toast.success('Order status updated successfully');
        // Refresh orders
        await fetchOrders();
        // Update selected delivery to reflect new status
        setSelectedDelivery((prev: any) => {
          if (!prev || prev.dbId !== orderDbId) return prev;

          const updatedStatus = newStatus === 'shipped' ? 'In Transit' :
            newStatus === 'delivered' ? 'Delivered' :
              newStatus === 'processing' ? 'Pending' :
                newStatus === 'cancelled' ? 'Failed' : 'Pending';

          return {
            ...prev,
            status: updatedStatus,
            fullOrder: {
              ...prev.fullOrder,
              orderStatus: newStatus
            }
          };
        });
      } else {
        toast.error(response.error || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();

      if (response.message && Array.isArray(response.message)) {
        // Transform orders data to match delivery structure
        const transformedOrders = response.message.map((order: any) => ({
          id: order.order_id || 'Unknown',
          dbId: order._id || order.id || 'Unknown',
          trackingId: `TRK-${order.order_id?.slice(-6) || '000000'}`,
          customer: order.shippingAddress?.fullName || 'Unknown Customer',
          agent: order.deliveryAgent || 'Not Assigned',
          address: order.shippingAddress ?
            `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}`.trim() :
            'Unknown Address',
          status: order.orderStatus === 'shipped' || order.orderStatus === 'shipping' ? 'In Transit' :
            order.orderStatus === 'delivered' ? 'Delivered' :
              order.orderStatus === 'processing' ? 'Pending' :
                order.orderStatus === 'cancelled' || order.orderStatus === 'canceled' ? 'Failed' : 'Pending',
          deliveryDate: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }).replace(/\//g, '-') : 'Unknown',
          phone: order.shippingAddress?.phone || 'Unknown',
          email: order.shippingAddress?.email || 'Unknown',
          fullOrder: order
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter deliveries by selected period
  const periodFilteredDeliveries = filterByPeriod(orders, selectedPeriod, (o) => o.fullOrder?.createdAt);

  // Calculate stats dynamically
  const totalDeliveries = periodFilteredDeliveries?.length || 0;
  const inTransitDeliveries = periodFilteredDeliveries?.filter(o => o.status === 'In Transit').length || 0;
  const deliveredDeliveries = periodFilteredDeliveries?.filter(o => o.status === 'Delivered').length || 0;
  const pendingDeliveries = periodFilteredDeliveries?.filter(o => o.status === 'Pending').length || 0;
  const failedDeliveries = periodFilteredDeliveries?.filter(o => o.status === 'Failed').length || 0;
  const assignedAgents = new Set(periodFilteredDeliveries?.map(o => o.agent).filter(a => a !== 'Not Assigned')).size || 0;

  // Filter deliveries based on search and status filter
  const filteredDeliveries = periodFilteredDeliveries?.filter(delivery => {
    const matchesSearch = !searchTerm ||
      delivery?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery?.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery?.agent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery?.status?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (deliveryFilter !== 'all') {
      return delivery?.status?.toLowerCase() === deliveryFilter.toLowerCase();
    }

    return true;
  }) || [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'Delivered': return 'bg-green-50 text-green-500 border-green-100';
      case 'Pending': return 'bg-yellow-50 text-yellow-500 border-yellow-100';
      case 'Failed': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between">
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <ShoppingBag size={20} className="text-brand_pink" />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                <option>All Time</option>
                <option>This Week</option>
                <option>This Month</option>
                <option>This Year</option>
              </select>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Total Deliveries</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{totalDeliveries}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">In Transit</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{inTransitDeliveries}</h3>
              </div>

              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">Delivered</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{deliveredDeliveries}</h3>
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
              placeholder="Search Tracking ID, Customer, Agent, Status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto relative">
            <button
              onClick={toggleFilterDropdown}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${deliveryFilter !== 'all'
                ? 'bg-brand_pink/10 border-brand_pink/30 text-brand_pink'
                : 'bg-gray-50 border-gray-100 text-brand_gray_dark hover:bg-gray-100'
                }`}
            >
              <Filter size={16} />
              {deliveryFilter === 'all' && 'Filter'}
              {deliveryFilter === 'in transit' && 'In Transit'}
              {deliveryFilter === 'delivered' && 'Delivered'}
              {deliveryFilter === 'pending' && 'Pending'}
              {deliveryFilter === 'failed' && 'Failed'}
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
                  onClick={() => { setDeliveryFilter('all'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${deliveryFilter === 'all' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                >
                  All Deliveries
                </button>
                <button
                  onClick={() => { setDeliveryFilter('in transit'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${deliveryFilter === 'in transit' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                >
                  In Transit
                </button>
                <button
                  onClick={() => { setDeliveryFilter('delivered'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${deliveryFilter === 'delivered' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                >
                  Delivered
                </button>
                <button
                  onClick={() => { setDeliveryFilter('pending'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${deliveryFilter === 'pending' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                >
                  Pending
                </button>
                <button
                  onClick={() => { setDeliveryFilter('failed'); setShowFilterDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${deliveryFilter === 'failed' ? 'text-brand_pink font-semibold bg-brand_pink/5' : 'text-gray-700'}`}
                >
                  Failed
                </button>
              </div>
            )}
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
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Tracking ID</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Customer Name</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Delivery Agent</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Address</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Delivery Date</th>
                  <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      {searchTerm || deliveryFilter !== 'all' ? 'No deliveries found matching your filters.' : 'No deliveries found.'}
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery, idx) => (
                    <tr onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowViewModal(true);
                    }} key={idx} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                      <td className="p-4 text-sm font-medium text-brand_gray_dark/80">{delivery.trackingId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-brand_gray_dark">{delivery.customer}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-brand_gray_dark/80">{delivery.agent}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-brand_gray_dark/80 max-w-xs truncate">{delivery.address}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-brand_gray_dark/80">{delivery.deliveryDate}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowViewModal(true);
                            }}
                            className="text-brand_gray hover:text-blue-500 transition-colors"
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
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none">
                <option>8</option>
              </select>
              <span className="text-xs text-brand_gray font-medium">Items per page</span>
            </div>
            <span className="text-xs text-brand_gray font-medium">
              {filteredDeliveries.length > 0 ? `1-${filteredDeliveries.length} of ${filteredDeliveries.length} items` : '0 items'}
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
      </div>

      {/* View Delivery Details Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-brand_gray_dark">Delivery Details</h3>
                <p className="text-xs text-brand_gray font-medium">Tracking ID: {selectedDelivery.trackingId} (Order ID: {selectedDelivery.id})</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-lg text-brand_gray hover:bg-gray-50 hover:text-brand_gray_dark transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Status Update section */}
              <div className="bg-gradient-to-tr from-brand_solid_gradient/5 to-transparent border border-brand_light_pink/20 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-brand_gray_dark mb-1">Update Delivery Status</h4>
                    <p className="text-xs text-brand_gray font-medium">Select a status to update the order immediately</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: 'Pending', value: 'processing', activeVal: 'Pending', color: 'bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100/50' },
                      { label: 'In Transit', value: 'shipped', activeVal: 'In Transit', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100/50' },
                      { label: 'Delivered', value: 'delivered', activeVal: 'Delivered', color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100/50' },
                      { label: 'Failed', value: 'cancelled', activeVal: 'Failed', color: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100/50' },
                    ].map((statusBtn) => {
                      const isActive = selectedDelivery.status === statusBtn.activeVal;
                      return (
                        <button
                          key={statusBtn.value}
                          disabled={isUpdatingStatus}
                          onClick={() => handleUpdateStatus(selectedDelivery.dbId, statusBtn.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${statusBtn.color} ${isActive
                            ? 'ring-2 ring-brand_pink border-transparent scale-105 shadow-sm'
                            : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                          {isUpdatingStatus && isActive && (
                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          )}
                          {statusBtn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer & Address */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Customer & Delivery Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Customer Name</p>
                      <p className="text-sm font-semibold text-brand_gray_dark">{selectedDelivery.customer}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Email Address</p>
                      <p className="text-sm font-medium text-brand_gray_dark/80">{selectedDelivery.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Phone Number</p>
                      <p className="text-sm font-medium text-brand_gray_dark/80">{selectedDelivery.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Shipping Address</p>
                      <p className="text-sm font-medium text-brand_gray_dark/80 whitespace-pre-wrap">{selectedDelivery.address}</p>
                    </div>
                  </div>
                </div>

                {/* Logistics */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Logistics & Payment</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Delivery Agent</p>
                      <p className="text-sm font-semibold text-brand_gray_dark">{selectedDelivery.agent}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Payment Method</p>
                      <p className="text-sm font-medium text-brand_gray_dark/80 uppercase">{selectedDelivery.fullOrder?.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Delivery Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(selectedDelivery.status)}`}>
                        {selectedDelivery.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-brand_gray font-medium">Order Date</p>
                      <p className="text-sm font-medium text-brand_gray_dark/80">{selectedDelivery.deliveryDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Order Items</h4>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                  {selectedDelivery.fullOrder?.items?.map((item: any, index: number) => (
                    <div key={index} className="p-4 flex items-center justify-between text-sm hover:bg-gray-50/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-50 w-8 h-8 rounded-lg flex items-center justify-center text-brand_gray/50">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="font-semibold text-brand_gray_dark">{item.productName || item.name || 'Unknown Product'}</p>
                          <p className="text-xs text-brand_gray font-medium">{item.color || item.size ? `Variant: ${[item.color, item.size].filter(Boolean).join(' / ')}` : 'No variant selected'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand_gray_dark">{formatCurrency(item.price || item.unitPrice || 0)} x {item.quantity || 1}</p>
                        <p className="text-xs font-bold text-brand_pink">{formatCurrency((item.price || item.unitPrice || 0) * (item.quantity || 1))}</p>
                      </div>
                    </div>
                  )) || (
                      <div className="p-4 text-center text-xs text-brand_gray">No items in this order.</div>
                    )}
                </div>
                {/* Total Summary */}
                <div className="bg-gray-50/20 px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Total Amount</span>
                  <span className="text-base font-bold text-brand_pink">{formatCurrency(selectedDelivery.fullOrder?.totalPrice || selectedDelivery.fullOrder?.total || 0)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-gray-100 text-brand_gray_dark font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close Details
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

export default DeliveryPage;
