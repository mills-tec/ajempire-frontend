'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, SquarePen, Megaphone, ShoppingBag } from 'lucide-react';
import { getUserOrders } from '@/lib/adminapi';

const DeliveryPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      
      if (response.message && Array.isArray(response.message)) {
        // Transform orders data to match delivery structure
        const transformedOrders = response.message.map((order: any) => ({
          id: order.order_id || 'Unknown',
          trackingId: `TRK-${order.order_id?.slice(-6) || '000000'}`,
          customer: order.shippingAddress?.fullName || 'Unknown Customer',
          agent: order.deliveryAgent || 'Not Assigned',
          address: order.shippingAddress ? 
            `${order.shippingAddress.address || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''}`.trim() : 
            'Unknown Address',
          status: order.orderStatus === 'shipping' ? 'In Transit' : 
                  order.orderStatus === 'delivered' ? 'Delivered' : 
                  order.orderStatus === 'processing' ? 'Pending' : 
                  order.orderStatus === 'canceled' ? 'Failed' : 'Pending',
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

  // Calculate stats dynamically
  const totalDeliveries = orders?.length || 0;
  const inTransitDeliveries = orders?.filter(o => o.status === 'In Transit').length || 0;
  const deliveredDeliveries = orders?.filter(o => o.status === 'Delivered').length || 0;
  const pendingDeliveries = orders?.filter(o => o.status === 'Pending').length || 0;
  const failedDeliveries = orders?.filter(o => o.status === 'Failed').length || 0;
  const assignedAgents = new Set(orders?.map(o => o.agent).filter(a => a !== 'Not Assigned')).size || 0;

  // Filter deliveries based on search
  const filteredDeliveries = orders?.filter(delivery => 
    delivery?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery?.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery?.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery?.agent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery?.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
                {filteredDeliveries.map((delivery, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
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
                      <button className="text-brand_gray hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      <button className="text-brand_gray hover:text-blue-500 transition-colors"><Eye size={16} /></button>
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
    </main>
  );
};

export default DeliveryPage;
