'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Package, ListFilter, MapPin, CreditCardIcon, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getOrderById } from '@/lib/adminapi';

const SingleReturnPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderById(orderId);
      
      if (response.message) {
        setOrder(response.message);
      } else {
        console.error('Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      // hour: '2-digit',
      // minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <button 
            onClick={() => router.push('/admin/orders')}
            className="text-brand_pink hover:underline"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const handleCopyTrackingId = () => {
    if (order?.trackingId) {
      navigator.clipboard.writeText(order.trackingId);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = () => {
    // Handle order cancellation logic here
    setShowCancelConfirm(false);
    router.push('/admin/orders');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-orange-50 text-orange-500 border-orange-100';
      case 'shipping': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'delivered': return 'bg-green-50 text-green-500 border-green-100';
      case 'canceled': return 'bg-red-50 text-red-500 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-sm font-semibold text-brand_gray_dark">Order ID <span className="text-brand_gray font-normal">#{order.order_id || order._id}</span></h1>
          </div>

          <div>
            <h1 className="text-sm font-semibold text-brand_gray_dark">Order Date <span className="text-brand_gray font-normal">{formatDate(order.createdAt)}</span></h1>
          </div>

          <div className='flex items-center gap-x-2'>
            <h1 className="text-sm font-semibold text-brand_gray_dark">Tracking ID <span className="text-brand_gray font-normal">{order.trackingId || 'Not assigned'}</span></h1>
            <Copy 
              size={14} 
              className="text-blue-500 cursor-pointer hover:text-blue-600" 
              onClick={handleCopyTrackingId}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-x-1">
            <ListFilter size={18} className="text-brand_gray_dark" />
            <select name="acrtions" id="action" className='outline-none text-sm'>
              <option value="action">Action</option>
            </select>
          </button>

          <button
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Cancel Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Customer Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-44 shadow-sm">
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="flex items-center gap-3">
                <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                  <Image src="/images/profile.svg" alt="profile" width={20} height={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">{order.shippingAddress?.fullName || 'Unknown Customer'}</p>
                  <p className="text-xs text-gray-400">Customer since <span className="text-black">{formatDate(order.createdAt)}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-normal border ${getStatusStyle(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="items-center gap-2 text-xs">
                <p className='text-gray-400'>Phone</p>
                <span className="text-sm text-black">{order.shippingAddress?.phone || 'Not provided'}</span>
              </div>
              <div className="items-center gap-2 text-xs">
                <p className='text-gray-400'>Email</p>
                <span className="text-sm text-black">{order.shippingAddress?.email || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-44 shadow-sm">
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="flex items-center gap-3">
                <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                  <MapPin size={16} className="text-brand_pink" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="items-center gap-2 text-xs">
                <p className='text-gray-400'>Home Address</p>
                <span className="text-sm text-black">{order.shippingAddress?.address || 'Not provided'}</span>
              </div>
              <div className="items-center gap-2 text-xs">
                <p className='text-gray-400'>Billing Address</p>
                <span className="text-sm text-black">{order.billingAddress?.address || order.shippingAddress?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-44 shadow-sm">
          <div className="flex flex-col gap-6 w-full">
            <div className='flex items-center justify-between mb-4'>
              <div className="flex items-center gap-3">
                <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                  <CreditCardIcon size={16} className="text-brand_pink" />
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="items-center gap-2 text-xs">
                <p className='text-gray-400'>Payment Method</p>
                <span className="text-sm text-black">{order.paymentMethod || 'Paystack'}</span>
              </div>
              <div className="items-center gap-2 text-xs">
                <p className='text-gray-400'>Order Type</p>
                <span className="text-sm text-black">{order.deliveryMethod || 'Home Delivery'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-brand_gray_dark">Order Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-left text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Product</th>
                <th className="p-4 text-center text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Qty</th>
                <th className="p-4 text-left text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Property</th>
                <th className="p-4 text-right text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Unit Price</th>
                <th className="p-4 text-right text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Discount</th>
                <th className="p-4 text-right text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Order Total</th>
                <th className="p-4 text-center text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items?.map((item: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-brand_gray/40" />
                      </div>
                      <span className="font-medium text-sm text-brand_gray_dark">{item.productName || item.name || 'Unknown Product'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-sm text-brand_gray_dark">{item.quantity || 1}</td>
                  <td className="p-4 text-sm text-brand_gray_dark">{item.color || item.size || 'N/A'}</td>
                  <td className="p-4 text-right text-sm text-brand_gray_dark">{formatCurrency(item.price || item.unitPrice)}</td>
                  <td className="p-4 text-right text-sm text-brand_gray_dark">{formatCurrency(item.discount || 0)}</td>
                  <td className="p-4 text-right text-sm font-bold text-brand_gray_dark">{formatCurrency((item.price || item.unitPrice) * (item.quantity || 1))}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No items found in this order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-end">
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(order.subtotal || order.totalPrice)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Shipping</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(order.shippingFee || 0)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Tax</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(order.tax || 0)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-bold text-brand_pink">{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Are you sure you want to cancel this order?
              </p>
              <p className="font-medium text-gray-900">
                Order #{order.order_id || order._id}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No, Keep Order
              </button>
              <button 
                onClick={confirmCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SingleReturnPage;
