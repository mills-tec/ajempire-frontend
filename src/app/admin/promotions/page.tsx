'use client'

import EmptyTable from '@/components/EmptyTable';
import {
  createPromotion,
  deletePromotion,
  getAllCategories,
  getProducts,
  getPromotions,
  updatePromotion,
} from '@/lib/adminapi';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Megaphone,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import PromotionDetailsModal from './components/PromotionDetailsModal';
import PromotionFormModal from './components/PromotionFormModal';
import { Category, Product, Promotion, PromotionFormValues } from './types';
import {
  buildPromotionPayload,
  computePromotionStats,
  EMPTY_FORM_VALUES,
  extractList,
  extractPaginatedList,
  formatDiscount,
  getEntityId,
  getStatusStyle,
  toFormValues,
} from './utils';

type ActiveModal = 'add' | 'edit' | 'delete' | 'view' | null;

const FILTER_GROUPS: { heading: string; options: { value: string; menuLabel: string }[] }[] = [
  {
    heading: 'Filter by Status',
    options: [
      { value: 'all', menuLabel: 'All Promotions' },
      { value: 'active', menuLabel: 'Active' },
      { value: 'scheduled', menuLabel: 'Scheduled / Upcoming' },
      { value: 'expired', menuLabel: 'Expired' },
    ],
  },
  {
    heading: 'Filter by Type',
    options: [
      { value: 'flashsale', menuLabel: 'Flash Sales' },
      { value: 'coupon', menuLabel: 'Coupons' },
    ],
  },
];

const FILTER_BUTTON_LABELS: Record<string, string> = {
  all: 'Filter',
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  flashsale: 'Flash Sale',
  coupon: 'Coupon',
};

const matchesFilter = (promotion: Promotion, filter: string): boolean => {
  switch (filter) {
    case 'active':
    case 'scheduled':
    case 'expired':
      return promotion.status?.toLowerCase() === filter;
    case 'flashsale':
    case 'coupon':
      return promotion.promotionType?.toLowerCase() === filter;
    default:
      return true;
  }
};

const PERIOD_OPTIONS = ['This Week', 'This Month', 'This Year'];
const PAGE_SIZE_OPTIONS = [8, 16, 32];

interface PromotionRowProps {
  promotion: Promotion;
  onView: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

const PromotionRow = memo(function PromotionRow({
  promotion,
  onView,
  onEdit,
  onDelete,
}: PromotionRowProps) {
  return (
    <tr
      onClick={() => onView(promotion)}
      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
    >
      <td className="p-4">
        <span className="font-medium text-sm text-brand_gray_dark">{promotion.title}</span>
      </td>
      <td className="p-4 text-sm text-brand_gray_dark/80 capitalize">
        {promotion.promotionType}
      </td>
      <td className="p-4 text-sm text-brand_gray_dark/80">
        {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="p-4 text-sm text-brand_gray_dark/80">
        {promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'N/A'}
      </td>
      <td className="p-4">
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(promotion.status)}`}
        >
          {promotion.status || 'inactive'}
        </span>
      </td>
      <td className="p-4 text-sm text-brand_gray_dark/80">{formatDiscount(promotion)}</td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(promotion);
            }}
            className="p-1 rounded-md text-brand_gray hover:text-brand_pink hover:bg-brand_pink/5 transition-colors"
            title="Edit Promotion"
            aria-label={`Edit ${promotion.title || 'promotion'}`}
          >
            <SquarePen size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(promotion);
            }}
            className="p-1 rounded-md text-brand_gray hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Promotion"
            aria-label={`Delete ${promotion.title || 'promotion'}`}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(promotion);
            }}
            className="p-1 rounded-md text-brand_gray hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="View Promotion"
            aria-label={`View ${promotion.title || 'promotion'}`}
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
});

const PromotionsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [searchTerm, setSearchTerm] = useState('');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [promotionFilter, setPromotionFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number | null>(null);
  const [serverTotalPages, setServerTotalPages] = useState<number | null>(null);

  const fetchPromotions = useCallback(async (pageToLoad: number, limit: number) => {
    try {
      setLoading(true);
      const response = await getPromotions({ page: pageToLoad, limit });
      const result = extractPaginatedList<Promotion>(response);
      setPromotions(result.items);
      setTotalItems(result.totalItems);
      setServerTotalPages(result.totalPages);
      // Landing on an empty page (e.g. after deleting its last item) steps back.
      if (result.items.length === 0 && pageToLoad > 1) {
        setPage(pageToLoad - 1);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch from the API whenever the page or page size changes.
  useEffect(() => {
    fetchPromotions(page, itemsPerPage);
  }, [fetchPromotions, page, itemsPerPage]);

  const refreshCurrentPage = useCallback(() => {
    fetchPromotions(page, itemsPerPage);
  }, [fetchPromotions, page, itemsPerPage]);

  useEffect(() => {
    getAllCategories()
      .then((response) => setCategories(extractList<Category>(response)))
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setCategories([]);
      });

    getProducts()
      .then((response) => setProducts(extractList<Product>(response, 'products')))
      .catch((error) => {
        console.error('Error fetching products:', error);
        setProducts([]);
      });
  }, [fetchPromotions]);

  useEffect(() => {
    if (!showFilterDropdown) return;
    const handleClose = () => setShowFilterDropdown(false);
    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);
  }, [showFilterDropdown]);

  // --- Modal open/close handlers -------------------------------------------

  const openAddModal = useCallback(() => {
    setSelectedPromotion(null);
    setActionError(null);
    setActiveModal('add');
  }, []);

  const openEditModal = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setActionError(null);
    setActiveModal('edit');
  }, []);

  const openDeleteModal = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setActionError(null);
    setActiveModal('delete');
  }, []);

  const openViewModal = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setActiveModal('view');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedPromotion(null);
    setActionError(null);
  }, []);

  // The view modal's Edit/Delete actions keep the current selection.
  const switchToEdit = useCallback(() => {
    setActionError(null);
    setActiveModal('edit');
  }, []);

  const switchToDelete = useCallback(() => {
    setActionError(null);
    setActiveModal('delete');
  }, []);

  // --- Mutations ------------------------------------------------------------

  const handleFormSubmit = useCallback(
    async (values: PromotionFormValues, bannerFile: File | null) => {
      const isEdit = activeModal === 'edit';
      if (isEdit && !selectedPromotion?._id) return;

      setSubmitting(true);
      setActionError(null);
      try {
        const payload = buildPromotionPayload(values, bannerFile);
        const response = isEdit
          ? await updatePromotion(selectedPromotion!._id!, payload)
          : await createPromotion(payload);

        if (response.message) {
          closeModal();
          refreshCurrentPage();
        } else {
          setActionError(
            response.error || `Failed to ${isEdit ? 'update' : 'create'} promotion`,
          );
        }
      } catch (err: unknown) {
        console.error(`Error ${isEdit ? 'updating' : 'creating'} promotion:`, err);
        setActionError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setSubmitting(false);
      }
    },
    [activeModal, selectedPromotion, closeModal, refreshCurrentPage],
  );

  const confirmDelete = useCallback(async () => {
    if (!selectedPromotion?._id) return;

    setDeleting(true);
    setActionError(null);
    try {
      const response = await deletePromotion(selectedPromotion._id);
      if (response.message) {
        closeModal();
        refreshCurrentPage();
      } else {
        setActionError(response.error || 'Failed to delete promotion');
      }
    } catch (err: unknown) {
      console.error('Error deleting promotion:', err);
      setActionError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setDeleting(false);
    }
  }, [selectedPromotion, closeModal, refreshCurrentPage]);

  // --- Derived data ----------------------------------------------------------

  const filteredPromotions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return promotions.filter((promotion) => {
      const matchesSearch =
        !query ||
        promotion.title?.toLowerCase().includes(query) ||
        promotion.description?.toLowerCase().includes(query) ||
        promotion.promotionType?.toLowerCase().includes(query) ||
        promotion.couponCode?.toLowerCase().includes(query);
      return matchesSearch && matchesFilter(promotion, promotionFilter);
    });
  }, [promotions, searchTerm, promotionFilter]);

  const stats = useMemo(() => computePromotionStats(promotions), [promotions]);

  // The API paginates; totals come from its metadata when reported. Without
  // metadata, a full page means there is at least one more page to discover.
  const hasFullPage = promotions.length === itemsPerPage;
  const knownTotalPages =
    serverTotalPages ??
    (totalItems != null ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : null);
  const totalPages = knownTotalPages ?? (hasFullPage ? page + 1 : page);
  const canGoNext = knownTotalPages != null ? page < knownTotalPages : hasFullPage;

  // Search and status/type filters apply within the currently loaded page.
  const isFilteredView = searchTerm.trim() !== '' || promotionFilter !== 'all';
  const rangeStart = promotions.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const rangeEnd = rangeStart === 0 ? 0 : rangeStart + promotions.length - 1;
  const totalItemsLabel =
    totalItems != null ? String(totalItems) : hasFullPage ? `${rangeEnd}+` : String(rangeEnd);

  const productNameById = useMemo(
    () => new Map(products.map((p) => [getEntityId(p), p.name || p.title || ''])),
    [products],
  );
  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [getEntityId(c), c.name || ''])),
    [categories],
  );

  const appliedNames = useMemo(() => {
    if (!selectedPromotion?.applyToId?.length) return 'None';
    const { applyTo, applyToId } = selectedPromotion;
    if (applyTo === 'product') {
      return applyToId.map((id) => productNameById.get(id) || id).join(', ');
    }
    if (applyTo === 'category') {
      return applyToId.map((id) => categoryNameById.get(id) || id).join(', ');
    }
    return 'All Products';
  }, [selectedPromotion, productNameById, categoryNameById]);

  const formInitialValues = useMemo(
    () =>
      activeModal === 'edit' && selectedPromotion
        ? toFormValues(selectedPromotion)
        : EMPTY_FORM_VALUES,
    [activeModal, selectedPromotion],
  );

  // --- Search / filter / pagination handlers ---------------------------------

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterSelect = (value: string) => {
    setPromotionFilter(value);
    setShowFilterDropdown(false);
    setPage(1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setPage(1);
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
                aria-label="Stats period"
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                {PERIOD_OPTIONS.map((period) => (
                  <option key={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">
                  Active Promotions
                </p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.active}</h3>
              </div>
              <div className="text-left">
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">
                  Upcoming Promotions
                </p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.upcoming}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-t from-brand_solid_gradient/10 border border-brand_light_pink/30 rounded-2xl p-6 flex items-start justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand_pink opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-brand_pink/10 w-10 h-10 rounded-xl flex items-center justify-center">
                <Megaphone size={20} className="text-brand_pink" />
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                aria-label="Stats period"
                className="bg-transparent text-[10px] text-brand_gray border-none outline-none cursor-pointer"
              >
                {PERIOD_OPTIONS.map((period) => (
                  <option key={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-brand_gray_dark/60 text-xs font-medium mb-1">
                  Total Discount Value
                </p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">
                  {stats.totalPercentDiscount === 0 && stats.totalFixedDiscount === 0 ? (
                    '0'
                  ) : (
                    <>
                      {stats.totalPercentDiscount > 0 && (
                        <>
                          {stats.totalPercentDiscount}
                          <span className="text-sm font-normal">%</span>
                        </>
                      )}
                      {stats.totalPercentDiscount > 0 && stats.totalFixedDiscount > 0 && (
                        <span className="text-sm font-normal">, </span>
                      )}
                      {stats.totalFixedDiscount > 0 && (
                        <>
                          <span className="text-sm font-normal">₦</span>
                          {stats.totalFixedDiscount.toLocaleString()}
                        </>
                      )}
                    </>
                  )}
                </h3>
              </div>
              <div className="text-left">
                <p className="text-red-500 text-xs font-medium mb-1">Expired Promotions</p>
                <h3 className="text-2xl font-bold text-brand_gray_dark">{stats.expired}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-10 mt-10 relative z-20">
        {/* Search and Filters */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-50 rounded-t-2xl">
          <div className="relative w-full md:w-96 group">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-brand_gray group-focus-within:text-brand_pink transition-colors"
            />
            <input
              type="text"
              placeholder="Search Promotion"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand_pink/30 focus:bg-white transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={openAddModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand_pink hover:bg-brand_pink/90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md active:scale-95"
            >
              <Plus size={16} />
              Add Promotion
            </button>
            <div className="flex items-center gap-3 w-full md:w-auto relative z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterDropdown((prev) => !prev);
                }}
                aria-haspopup="menu"
                aria-expanded={showFilterDropdown}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 border px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  promotionFilter !== 'all'
                    ? 'bg-brand_pink/10 border-brand_pink/30 text-brand_pink'
                    : 'bg-gray-50 border-gray-100 text-brand_gray_dark hover:bg-gray-100'
                }`}
              >
                <Filter size={16} />
                {FILTER_BUTTON_LABELS[promotionFilter] ?? 'Filter'}
              </button>

              {showFilterDropdown && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {FILTER_GROUPS.map((group, groupIndex) => (
                    <React.Fragment key={group.heading}>
                      {groupIndex > 0 && <div className="h-px bg-gray-100 my-1"></div>}
                      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {group.heading}
                      </div>
                      {group.options.map((option) => (
                        <button
                          key={option.value}
                          role="menuitem"
                          onClick={() => handleFilterSelect(option.value)}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                            promotionFilter === option.value
                              ? 'text-brand_pink font-semibold bg-brand_pink/5'
                              : 'text-gray-700'
                          }`}
                        >
                          {option.menuLabel}
                        </button>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Campaign Name</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Start Date</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">End Date</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider">Discount Type</th>
                <th className="p-4 text-xs font-bold text-brand_gray_dark uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand_pink"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredPromotions.length === 0 ? (
                <EmptyTable
                  colSpan={7}
                  searchTerm={searchTerm || (promotionFilter !== 'all' ? promotionFilter : '')}
                  tableType="Promotions"
                />
              ) : (
                filteredPromotions.map((promotion, idx) => (
                  <PromotionRow
                    key={promotion._id || idx}
                    promotion={promotion}
                    onView={openViewModal}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-50 bg-gray-50/20 rounded-b-2xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                aria-label="Items per page"
                className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-xs text-brand_gray font-medium">Items per page</span>
            </div>
            <span className="text-xs text-brand_gray font-medium">
              {isFilteredView
                ? `${filteredPromotions.length} of ${promotions.length} items on this page`
                : promotions.length > 0
                  ? `${rangeStart}-${rangeEnd} of ${totalItemsLabel} items`
                  : '0 items'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                aria-label="Current page"
                className="bg-gray-100 border-none rounded-lg text-xs font-bold px-2 py-1 outline-none"
              >
                {Array.from({ length: totalPages }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              <span className="text-xs text-brand_gray font-medium">
                of {totalPages} {totalPages === 1 ? 'page' : 'pages'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || loading}
                aria-label="Previous page"
                className="p-1 rounded-md text-brand_gray hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!canGoNext || loading}
                aria-label="Next page"
                className="p-1 rounded-md text-brand_gray hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {(activeModal === 'add' || activeModal === 'edit') && (
        <PromotionFormModal
          mode={activeModal}
          initialValues={formInitialValues}
          products={products}
          categories={categories}
          submitting={submitting}
          error={actionError}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      )}

      {activeModal === 'delete' && selectedPromotion && (
        <DeleteConfirmModal
          promotionTitle={selectedPromotion.title}
          deleting={deleting}
          error={actionError}
          onClose={closeModal}
          onConfirm={confirmDelete}
        />
      )}

      {activeModal === 'view' && selectedPromotion && (
        <PromotionDetailsModal
          promotion={selectedPromotion}
          appliedNames={appliedNames}
          onClose={closeModal}
          onEdit={switchToEdit}
          onDelete={switchToDelete}
        />
      )}
    </main>
  );
};

export default PromotionsPage;
