'use client'

import { bunnyLoader } from '@/lib/bunnyLoader';
import { Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { memo } from 'react';
import { Promotion } from '../types';
import { formatDiscount, getStatusStyle } from '../utils';
import ModalShell from './ModalShell';

interface PromotionDetailsModalProps {
  promotion: Promotion;
  appliedNames: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const formatDate = (date?: string) =>
  date ? new Date(date).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : 'N/A';

const PromotionDetailsModal = ({
  promotion,
  appliedNames,
  onClose,
  onEdit,
  onDelete,
}: PromotionDetailsModalProps) => {
  return (
    <ModalShell onClose={onClose} closeOnBackdrop ariaLabel="Promotion details">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-brand_gray_dark">Promotion Details</h2>
          <p className="text-xs text-brand_gray font-medium">
            Campaign ID: {promotion._id || 'N/A'}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-1.5 rounded-lg text-brand_gray hover:bg-gray-50 hover:text-brand_gray_dark transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {promotion.banner && (
          <div className="w-full h-48 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center relative shadow-sm">
            <Image
              src={promotion.banner}
              alt="Campaign Banner"
              className="w-full h-full object-cover"
              loader={bunnyLoader}
              fill
              loading='eager'
              sizes="(max-width: 480px) 100vw,
         (max-width: 768px) 50vw,
         (max-width: 1024px) 40vw,
         384px"
            />


            <div className="absolute top-3 right-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(promotion.status)}`}
              >
                {promotion.status || 'inactive'}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">
              Campaign Information
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-brand_gray font-medium">Campaign Name</p>
                <p className="text-sm font-semibold text-brand_gray_dark">
                  {promotion.title || 'Untitled'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-brand_gray font-medium">Description</p>
                <p className="text-sm font-medium text-brand_gray_dark/80">
                  {promotion.description || 'No description provided.'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-brand_gray font-medium">Promotion Type</p>
                <p className="text-sm font-semibold text-brand_pink capitalize">
                  {promotion.promotionType || 'N/A'}
                </p>
              </div>
              {promotion.couponCode && (
                <div>
                  <p className="text-[10px] text-brand_gray font-medium">Coupon Code</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-brand_pink/10 border border-brand_pink/20 rounded text-xs font-bold text-brand_pink uppercase tracking-wider">
                    {promotion.couponCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-brand_gray_dark uppercase tracking-wider">
              Discount & Application
            </h4>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-brand_gray font-medium">Discount Value</p>
                <p className="text-sm font-bold text-brand_gray_dark">
                  {formatDiscount(promotion)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-brand_gray font-medium">Applies To</p>
                <p className="text-sm font-semibold text-brand_gray_dark capitalize">
                  {promotion.applyTo || 'All Products'}
                </p>
              </div>
              {promotion.applyTo !== 'all' && (
                <div>
                  <p className="text-[10px] text-brand_gray font-medium">
                    Applied Items / Collections
                  </p>
                  <p className="text-xs font-medium text-brand_gray_dark/80 whitespace-pre-wrap max-h-24 overflow-y-auto mt-1 bg-white p-2 border border-gray-100 rounded-lg">
                    {appliedNames}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-brand_gray font-medium">Duration Period</p>
                <p className="text-xs font-medium text-brand_gray_dark/80 mt-0.5">
                  Start: {formatDate(promotion.startDate)}
                  <br />
                  End: {formatDate(promotion.endDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <button
          onClick={onDelete}
          className="px-5 py-2 border border-red-200 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={15} />
          Delete
        </button>
        <button
          onClick={onEdit}
          className="px-5 py-2 border border-gray-200 text-brand_gray_dark font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
        >
          Edit Campaign
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-brand_pink text-white font-semibold text-sm rounded-xl hover:bg-brand_pink/90 transition-colors"
        >
          Close Details
        </button>
      </div>
    </ModalShell>
  );
};

export default memo(PromotionDetailsModal);
