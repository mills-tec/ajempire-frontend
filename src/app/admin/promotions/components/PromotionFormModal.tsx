'use client'

import { X } from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Category, Product, PromotionFormValues, SelectOption } from '../types';
import { getEntityId } from '../utils';
import ModalShell from './ModalShell';
import MultiSelect from './MultiSelect';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_pink focus:border-brand_pink transition-colors';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

const todayDateInputValue = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

/** Day after the given yyyy-mm-dd date — the earliest valid end date. */
const dayAfter = (date: string): string => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
};

interface PromotionFormModalProps {
  mode: 'add' | 'edit';
  initialValues: PromotionFormValues;
  products: Product[];
  categories: Category[];
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: PromotionFormValues, bannerFile: File | null) => void;
}

const PromotionFormModal = ({
  mode,
  initialValues,
  products,
  categories,
  submitting,
  error,
  onClose,
  onSubmit,
}: PromotionFormModalProps) => {
  const [values, setValues] = useState<PromotionFormValues>(initialValues);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Object URLs must be created once per file and revoked, otherwise every
  // render leaks a blob reference.
  const bannerPreviewUrl = useMemo(
    () => (bannerFile ? URL.createObjectURL(bannerFile) : null),
    [bannerFile],
  );
  useEffect(() => {
    return () => {
      if (bannerPreviewUrl) URL.revokeObjectURL(bannerPreviewUrl);
    };
  }, [bannerPreviewUrl]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        // Coupon codes only apply to coupon promotions.
        if (name === 'promotionType' && value !== 'coupon') next.couponCode = '';
        // Selected ids belong to the previous target list once applyTo changes.
        if (name === 'applyTo' && value !== prev.applyTo) next.applyToId = [];
        // The end date must be strictly after the start date.
        if (name === 'startDate' && next.endDate && next.endDate <= value) next.endDate = '';
        return next;
      });
    },
    [],
  );

  const handleApplyToIdChange = useCallback((ids: string[]) => {
    setValues((prev) => ({ ...prev, applyToId: ids }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerFile(e.target.files?.[0] ?? null);
  };

  const handleRemoveBanner = () => {
    if (bannerFile) {
      // Discard the pending replacement; the original banner (if any) stays.
      setBannerFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setValues((prev) => ({ ...prev, banner: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values, bannerFile);
  };

  const applyToOptions = useMemo<SelectOption[]>(() => {
    if (values.applyTo === 'product') {
      return products.map((product) => ({
        value: getEntityId(product),
        label: product.name || product.title || 'Unnamed Product',
      }));
    }
    if (values.applyTo === 'category') {
      return categories.map((category) => ({
        value: getEntityId(category),
        label: category.name || 'Unnamed Category',
      }));
    }
    return [];
  }, [values.applyTo, products, categories]);

  const isEdit = mode === 'edit';
  const previewSrc = bannerPreviewUrl ?? (values.banner || null);

  const today = useMemo(todayDateInputValue, []);
  // Past dates are disabled, except when editing a promotion that already
  // started — its original date stays selectable so the form remains valid.
  const startDateMin =
    isEdit && initialValues.startDate && initialValues.startDate < today
      ? initialValues.startDate
      : today;

  return (
    <ModalShell onClose={onClose} ariaLabel={isEdit ? 'Edit promotion' : 'Add new promotion'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Promotion' : 'Add New Promotion'}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
              <X size={12} className="text-white" />
            </div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="promotion-title" className={labelClass}>Promotion Name</label>
            <input
              id="promotion-title"
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="Enter promotion name"
            />
          </div>
          <div>
            <label htmlFor="promotion-type" className={labelClass}>Type</label>
            <select
              id="promotion-type"
              name="promotionType"
              value={values.promotionType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="flashsale">Flash Sale</option>
              <option value="coupon">Coupon</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="promotion-description" className={labelClass}>Description</label>
          <textarea
            id="promotion-description"
            name="description"
            value={values.description}
            onChange={handleChange}
            required
            rows={3}
            className={inputClass}
            placeholder="Enter promotion description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="promotion-start" className={labelClass}>Start Date</label>
            <input
              id="promotion-start"
              type="date"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              required
              min={startDateMin}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="promotion-end" className={labelClass}>End Date</label>
            <input
              id="promotion-end"
              type="date"
              name="endDate"
              value={values.endDate}
              onChange={handleChange}
              required
              min={values.startDate ? dayAfter(values.startDate) : dayAfter(startDateMin)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="promotion-discount-type" className={labelClass}>Discount Type</label>
            <select
              id="promotion-discount-type"
              name="discountType"
              value={values.discountType}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label htmlFor="promotion-discount-value" className={labelClass}>Discount Value</label>
            <input
              id="promotion-discount-value"
              type="number"
              name="discountValue"
              value={values.discountValue}
              onChange={handleChange}
              min="0"
              max={values.discountType === 'percent' ? 100 : undefined}
              step="any"
              inputMode="decimal"
              className={inputClass}
              placeholder={values.discountType === 'percent' ? 'e.g. 10' : 'e.g. 5000'}
            />
          </div>
        </div>

        <div>
          <label htmlFor="promotion-apply-to" className={labelClass}>Apply To</label>
          <select
            id="promotion-apply-to"
            name="applyTo"
            value={values.applyTo}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="product">Product</option>
            <option value="category">Category</option>
            <option value="all">All Products</option>
          </select>
        </div>

        {values.applyTo !== 'all' && (
          <div>
            <label className={labelClass}>
              {values.applyTo === 'product' ? 'Select Products' : 'Select Categories'}
            </label>
            <MultiSelect
              options={applyToOptions}
              selected={values.applyToId}
              onChange={handleApplyToIdChange}
              placeholder={
                values.applyTo === 'product' ? 'Select products...' : 'Select categories...'
              }
              searchPlaceholder={
                values.applyTo === 'product' ? 'Search products...' : 'Search categories...'
              }
              emptyMessage={
                values.applyTo === 'product' ? 'No products available' : 'No categories available'
              }
            />
          </div>
        )}

        {values.promotionType === 'coupon' && (
          <div>
            <label htmlFor="promotion-coupon" className={labelClass}>Coupon Code</label>
            <input
              id="promotion-coupon"
              type="text"
              name="couponCode"
              value={values.couponCode}
              onChange={handleChange}
              className={inputClass}
              placeholder="Optional: Enter coupon code"
            />
          </div>
        )}

        <div>
          <label htmlFor="promotion-banner" className={labelClass}>Banner Image</label>
          <input
            ref={fileInputRef}
            id="promotion-banner"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`${inputClass} file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand_pink/10 file:text-brand_pink hover:file:bg-brand_pink/20`}
          />
          {previewSrc && (
            <div className="mt-3 flex items-end gap-3">
              <div className="relative w-40 h-24 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 shadow-sm shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-semibold">
                  {bannerPreviewUrl ? 'New image' : 'Current banner'}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  aria-label={bannerPreviewUrl ? 'Remove selected image' : 'Remove current banner'}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              {bannerPreviewUrl && values.banner && (
                <p className="text-xs text-gray-500 pb-1">
                  This will replace the current banner. Remove it to keep the existing image.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-brand_pink text-white rounded-lg hover:bg-brand_pink/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : isEdit ? (
              'Update Promotion'
            ) : (
              'Create Promotion'
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

export default memo(PromotionFormModal);
