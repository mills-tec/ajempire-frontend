'use client'

import React, { useState } from 'react';
import { Search, Filter, Eye, Trash2, ChevronLeft, ChevronRight, Users, TrendingUp, Package, MoreHorizontal, Mail, Phone, Calendar, CornerDownRight, SquarePen, Megaphone, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const SupportPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');

  const support = [
    { id: 'SUP-001', name: 'John Doe', subject: 'Order Tracking Issue', dateCreated: '2024-02-10', status: 'Open' },
    { id: 'SUP-002', name: 'Jane Smith', subject: 'Product Quality Concern', dateCreated: '2024-02-09', status: 'In Progress' },
    { id: 'SUP-003', name: 'Mike Johnson', subject: 'Payment Processing Error', dateCreated: '2024-02-08', status: 'Resolved' },
    { id: 'SUP-004', name: 'Sarah Williams', subject: 'Shipping Delay Inquiry', dateCreated: '2024-02-07', status: 'Closed' },
    { id: 'SUP-005', name: 'David Brown', subject: 'Return Request', dateCreated: '2024-02-06', status: 'Open' },
    { id: 'SUP-006', name: 'Emily Davis', subject: 'Account Access Problem', dateCreated: '2024-02-05', status: 'In Progress' },
    { id: 'SUP-007', name: 'Robert Wilson', subject: 'Product Information', dateCreated: '2024-02-04', status: 'Resolved' },
    { id: 'SUP-008', name: 'Lisa Anderson', subject: 'Refund Status', dateCreated: '2024-02-03', status: 'Closed' }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-500 border-blue-100';
      case 'In Progress': return 'bg-yellow-50 text-yellow-500 border-yellow-100';
      case 'Resolved': return 'bg-green-50 text-green-500 border-green-100';
      case 'Closed': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <main className="w-full min-h-screen bg-gray-50/30 font-poppins pr-5">
     
      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-10">
        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors" />
            <input
              type="text"
              placeholder="Search Support"
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
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Subject</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Date Created</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {support.map((ticket, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm text-brand_gray_dark">{ticket.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-brand_gray_dark/80 max-w-xs truncate">{ticket.subject}</td>
                  <td className="p-4 text-sm text-brand_gray_dark/80">{ticket.dateCreated}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-brand_gray hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      <button className="text-brand_gray hover:text-brand_pink transition-colors"><SquarePen size={16} /></button>
                      <button className="text-brand_gray hover:text-blue-500 transition-colors"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
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
    </main>
  );
};

export default SupportPage;
